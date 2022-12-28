const validator = require('validator');


// EMAIL VALIDATOR 
module.exports = (req, res, next) => {
    const email = req.body.email;
    if (email) {
        if (validator.isEmail(email)) {
            next();
        } else {
            return res.status(400).json({ error: 'Unvalid email format !' })
        }
    } else {
        return res.status(400).json({ error: 'Please add an email !' })
    }
};