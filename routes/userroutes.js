const express = require('express');
const router = express.Router();
const userController = require('../controllers/usercontroller');
const auth = require('../middlewares/auth');
const passwordValidation = require('../middlewares/password-validation');
const emailValidation = require('../middlewares/email-validation');


// ROUTES
router.post('/signup', emailValidation ,passwordValidation, userController.signup);
router.post('/login', userController.login);
router.put('/me/deactivate', auth, userController.deactivateUser);
router.get('/me', auth, userController.getOneUser);
// router.get('/users', auth, userController.getAllUsers);
router.put('/me', auth, passwordValidation, userController.modifyUser);
router.delete('/me', auth, userController.deleteUser);


// EXPORTS
module.exports = router;