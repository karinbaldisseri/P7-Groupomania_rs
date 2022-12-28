const PasswordValidator = require('password-validator');


// SCHEMA
const passwordSchema = new PasswordValidator();

// Password format rules
passwordSchema
    .is().min(6)                                    // Minimum length 6
    .is().max(50)                                   // Maximum length 50
    .has().uppercase()                              // Must have uppercase letters
    .has().lowercase()                              // Must have lowercase letters
    .has().digits(1)                                // Must have digits
    .has().not().spaces()                           // Should not have spaces
    .is().not().oneOf(['Passw0rd', 'Password123']); // Blacklist these values


module.exports = (req, res, next) => {
    const password = req.body.password;
    if (password) {
        if (passwordSchema.validate(password)) {
            next();
        } else {
            res.status(400).json({ error: `Please reinforce the password : ${passwordSchema.validate(password, { list: true })}` });
        }
    } else {
        res.status(400).json({error: 'Please add a password !'})
    }
};