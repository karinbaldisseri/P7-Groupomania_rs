const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const cryptojs = require('crypto-js');
const { Op } = require('sequelize');
const User = require('../models/user');
const Like = require('../models/like');
const Post = require('../models/post');


// SIGNUP
exports.signup = (req, res) => {
    if (req.body.email && req.body.password && req.body.firstname && req.body.lastname) {
        // Email encryption
        const cryptoJsEmail = cryptojs.HmacSHA256(req.body.email, `${process.env.CRYPTOJS_EMAIL_KEY}`).toString();
        User.findOne({ attributes: ['email', 'isActive'], where: { email: cryptoJsEmail } })
            .then((user) => {
                if (!user) {
                    // Password hash + salt 
                    bcrypt.hash(req.body.password, 10)
                        .then(hash => {
                        // Create user and save in DB
                        User.create({
                            email: cryptoJsEmail,
                            password: hash,
                            firstname: req.body.firstname,
                            lastname: req.body.lastname
                        })
                            .then(() => res.status(201).json({ message : 'User created !'}))
                            .catch(() => res.status(500).json({ error: 'Internal server error' }));
                        })
                        .catch(() => res.status(500).json({ error: 'Internal server error'}));
                } else if (user.isActive === false) {
                    return res.status(403).json({ error: 'Account deactivated ! Please contact your admin.' });
                } else {
                    return res.status(400).json({ error: 'Client input error' });
                }
            })
            .catch(() => res.status(500).json({ error: 'Internal server error' }));
    } else {
        return res.status(400).json({ error: 'Client input error / missing password, email, firstname and/or lastname' });
    }
};

// LOGIN
exports.login = (req, res) => {
    //if (req.body.email !== null && req.body.password !== null) {
    if (req.body.email && req.body.password) {
        const cryptoJsEmail = cryptojs.HmacSHA256(req.body.email, `${process.env.CRYPTOJS_EMAIL_KEY}`).toString();
        User.findOne({ attributes: ['id','email','password','isActive', 'isAdmin'], where: { email: cryptoJsEmail }})
            .then((user) => {
                // Check if user exists in DB
                if (!user) {
                    return res.status(400).json({ message: 'Invalid User and/or password !' });
                 }  else if (user.isActive === false) {
                    return res.status(403).json({ message: 'Account deactivated ! Please contact your admin.' });
                } else {
                    // Check if password is valid
                    bcrypt.compare(req.body.password, user.password) 
                        .then((validPassword) => {
                            if (!validPassword) {
                                return res.status(401).json({ message: 'Invalid user and/or Password !' })
                            } else {
                                res.status(200).json({
                                    // Create token
                                    userId: user.id,
                                    token: jwt.sign({
                                        userId: user.id,
                                        isAdmin: user.isAdmin
                                        },
                                        `${process.env.JWT_TOKEN}`,
                                        { expiresIn: '24h' } 
                                    )
                                });
                            }
                        })
                    .catch(() => res.status(500).json({ error: 'Internal server error' }));
                }
            })
            .catch(()=> res.status(500).json({ error: 'Internal server error' }));
    } else {
        return res.status(400).json({ error: 'Client input error' });
    }
};

// GET USERINFO for one user
exports.getOneUser = (req, res) => {
    User.findOne({
        attributes: ['id', 'firstname', 'lastname', 'username'],
        where: { id: req.auth.userId }
        // if use id as params in url => check id = id in url & id in auth
        //where: {[Op.and]: [{id: req.params.id}, {id: req.auth.userId}]}
    })
        .then((user) => {
            if (!user) {
                return res.status(401).json({ error: 'Unauthorized request !' });
            } else {
                return res.status(200).json(user);
            }
        })
        .catch(() => res.status(500).json({ error: 'Internal server error' }))
}; 

// GET ALL USERS info
/* exports.getAllUsers = (req, res) => {
    User.findAll()
        .then((users) => {
            return res.status(200).json(users)
        })
        .catch(() => res.status(500).json({ error: 'Internal server error' }))
}; */

// MODIFY USER
exports.modifyUser = (req, res) => {
    const userData = { ...req.body };
    // if use id as params in url => check id = id in url & id in auth
    // User.findOne({ where: { [Op.and]: [{ id: req.params.id }, { id: req.auth.userId }] } })
        User.findOne({ attributes: ['id', 'firstname', 'lastname', 'username'], where: { id: req.auth.userId } })
        .then((user) => {
            if (!user) {
                return res.status(401).json({ error: 'Unauthorized request !' });
            } else {
                if (userData.password) {
                    bcrypt.hash(userData.password, 10)
                        .then(hash => {
                            // if use id as params in url => check id = id in url & id in auth
                            //User.update({ ...userData, password: hash }, { where: { id: req.params.id, id: req.auth.userId } })
                            User.update({ ...userData, password: hash }, { where: { id: req.auth.userId } })
                            .then(() => res.status(200).json({ message: 'User updated !' }))
                            .catch(() => res.status(500).json({ error: 'Internal server error' }));
                    })
                } else {
                    // if use id as params in url => check id = id in url & id in auth
                    //User.update({ ...userData }, { where: { id: req.params.id, id: req.auth.userId } })
                    User.update({ ...userData }, { where: { id: req.auth.userId } })
                        .then(() => res.status(200).json({ message: 'User updated !' }))
                        .catch(() => res.status(500).json({ error: 'Internal server error' }));
                    }
            }
        })
        .catch(() => res.status(500).json({ error: 'Internal server error' }))
};

// DELETE USER
exports.deleteUser = (req, res) => {
    // find all user's likes (votes) if user is active (no need to decrement likestotal for unactive user's like)
    Like.findAll({ where: { userId: req.auth.userId }, include: [{ model: User, where: {isActive: true} }] })
        .then((likesFound) => {
            for (let like of likesFound) {
                // get postId of each like
                const postId = like.postId;      
                Post.findOne({ where: { id: postId } })
                    .then((post) => {
                        // if vote =like
                        if (like.likeValue === 1) {
                            post.decrement('likesTotal');
                        //if vote = dislike
                        } else if (like.likeValue === -1) {
                            post.decrement('dislikesTotal');
                        } else {
                            return res.status(404).json({ error: 'Bad request !' });
                        }
                    })
            }
        })
        .catch(() => res.status(500).json({ error: 'Internal server error' }));

    // if use id as params in url => check id = id in url & id in auth
    // User.findOne({ where: {[Op.and]: [{id: req.params.id}, {id: req.auth.userId}]} })
    User.findOne({ attributes: ['id', 'firstname', 'lastname'], where: { id: req.auth.userId } })
        .then((user) => {
            if (!user) {
                return res.status(401).json({ error: 'Unauthorized request !' });
            } else {
                // if use id as params in url => check id = id in url & id in auth
                // User.destroy({ where: { id: req.params.id, id: req.auth.userId } })
                User.destroy({ where: { id: req.auth.userId } })
                    .then(() => res.status(200).json({ message: 'User deleted !' }))
                    .catch(() => res.status(500).json({ error: 'Internal server error' }));
            }
        })
        .catch(() => res.status(500).json({ error: 'Internal server error' }));
};

// DEACTIVATE USER
// if deactivated , does admin change isActive in DB or ask a developper to do it?
exports.deactivateUser = (req, res) => {
    // find all user's likes (votes)
    Like.findAll({ where: { userId: req.auth.userId} })
        .then((likesFound) => {
            for (let like of likesFound) {
                // get postId of each like
                const postId = like.postId;      
                Post.findOne({ where: { id: postId } })
                    .then((post) => {
                        // if vote =like
                        if (like.likeValue === 1) {
                            post.decrement('likesTotal');
                        //if vote = dislike
                        } else if (like.likeValue === -1) {
                            post.decrement('dislikesTotal');
                        } else {
                            return res.status(404).json({ error: 'Bad request !' });
                        }
                    })
            }
        })
        .catch(() => res.status(500).json({ error: 'Internal server error' }));
        //BUT !!! like still exists so if LIKE.COUNT done it will be wrong... or let likesTotal as is ?
    
    User.findOne({ attributes: ['id', 'firstname', 'lastname'], where: { id: req.auth.userId } })
        .then((user) => {
            if (user) {
                User.update({ isActive: false }, { where: { id: req.auth.userId } })
                    .then(() => res.status(200).json({ message: "User deactivated !" }))
                    // delete user after a certain time it has been deactivated ->  ne marche pas
                    /* .then((deactivatedUser) => {
                        deactivatedUser.destroy({ where: { updatedAt: { [Op.lte]: new Date(Date.now() - (10 * 1000)) } } })
                    }) */
                    .catch(() => res.status(500).json({ error: 'Internal server error 1' }));
            } else {
                return res.status(401).json({ error: 'Unauthorized request !' });
            }
        })
        .catch(() => res.status(500).json({ error: 'Internal server error 2' }))
};