const { Op } = require('sequelize');
// const paginate = require('../middlewares/paginate');
const Comment = require('../models/comment');
const Post = require('../models/post');
const User = require('../models/user');


// CREATE new comment -> POST
exports.createComment = (req, res) => {
    if (req.body) {
        Post.findOne({ where: { id: req.params.postId } })
            .then((post) => {
                if (!post) {
                    res.status(404).json({ error: 'Resource not found' });
                } else {
                    Comment.create({
                        userId: req.auth.userId,
                        content: req.body.content,
                        postId: req.params.postId
                    })
                        .then(() => res.status(201).json({ message: 'Comment created !' }))
                        .catch(() => res.status(500).json({ error: 'Internal server error' }));
                }
            })
            .catch(() => res.status(500).json({ error: 'Internal server error' }));
    } else {
        return res.status(400).json({ error : 'Client input error' })
    }
};

// READ - Get single Comment -> GET
/* exports.getOneComment = (req, res) => {
    Comment.findOne({
        where: { id: req.params.id, userId: req.auth.userId },
        include: [{ model: User, required: true, attributes: ['id', 'firstname', 'lastname', 'isActive'] },
        { model: Post, required: true, attributes: ['id']}]
    }) 
        .then((comment) => {
            if (!comment) {
                return res.status(404).json({ error : 'Resource not found' })
            }
            res.status(200).json(comment)
        })
        .catch(() => res.status(500).json({ error: 'Internal server error' })
        );
}; */

// READ - Get all comments -> GET
exports.getAllCommentsByPost = (req, res) => {
    let page = parseInt(req.query.page)
    let limit = parseInt(req.query.limit)

    if (!Number.isFinite(limit) || limit <= 0 || limit > 50) {
        limit = 5;
        return res.status(400).json({ error: 'Client input error' });
    }
    if (!Number.isFinite(page) || page <= 0) {
        page = 1;
        return res.status(400).json({ error: 'Client input error' });
    }
        
    Comment.findAndCountAll({
        where: {[Op.and]: [ {postid: req.params.postId}, {[ "$user.isActive$" ]: true } ]},
        include: [{ model: User, required: true, attributes: ['id', 'username', 'isActive']}],
        order: [['createdAt', 'DESC']],
        limit : limit,
        offset: ((page - 1) * limit)
    })
        .then((comments) => {
            if (!comments) {
                return res.status(404).json({ error: 'Resource not found' });
            } else {
                if (comments.rows && comments.rows.length > 0) {
                const totalPages = Math.ceil(comments.count / limit)
                return res.status(200).json({
                    totalCount: comments.count,
                    itemsCount: comments.rows.length,
                    totalPages,
                    nextPage: page < totalPages ? page + 1 : null,
                    previousPage: page > 1 ? page - 1 : null,
                    items: comments.rows,
                })
                } else {
                    return res.status(400).json({ error: 'Client input error' });
                }
            }
        }) 
        .catch(() => res.status(500).json({ error : 'Internal server error' }));
}

/* exports.getAllComments = (req, res) => {
    paginatedComments = paginate.paginatedResults(Comment);
    return res.status(200).json(paginatedComments);
}; */

// UPDATE Comment -> PUT
exports.modifyComment = (req, res) => {
    const commentData = { content: req.body.content };
    Comment.findOne({ where: { id: req.params.id } })
        .then((comment) => {
            if (!comment) {
                res.status(404).json({ error: 'Resource not found' });
            } else {
                if (comment.userId === req.auth.userId || req.auth.isAdmin) {
                    if (commentData) {
                        Comment.update({ ...commentData }, { where: { id: req.params.id } })
                            .then(() => res.status(200).json({ message: 'Comment updated !' }))
                            .catch(error => res.status(500).json({ error : 'Internal server error' }));
                    } else {
                        return res.status(400).json({ error: 'Client input error' });
                    }
                } else {
                    res.status(401).json({ error: 'Unauthorized request' });
                }
            }
        })
        .catch(() => res.status(500).json({ error : 'Internal server error' }));
};

//DELETE Comment -> DELETE
exports.deleteComment = (req, res) => {
    Comment.findOne({ where: {id: req.params.id} })
        .then((comment) => {
            if (!comment) {
                res.status(404).json({ error: 'Resource not found' });
            } else {
                if (comment.userId === req.auth.userId || req.auth.isAdmin) {
                    Comment.destroy({ where: { id: req.params.id } })
                        .then(() => res.status(200).json({ message: 'Comment deleted !' }))
                        .catch(() => res.status(500).json({ error: 'Internal server error' }));
                } else {
                    res.status(401).json({ error: 'Unauthorized request' });
                }
            }
        })
        .catch(() => res.status(500).json({ error : 'Internal server error' }));
};