const express = require('express');
const auth = require('../middlewares/auth');
const router = express.Router();

const commentControl = require('../controllers/commentcontroller');


//ROUTES

router.post('/:postId', auth, commentControl.createComment);
//router.get('/:id', auth, commentControl.getOneComment);
router.get('/:postId', auth, commentControl.getAllCommentsByPost);
router.put('/:id', auth, commentControl.modifyComment);
router.delete('/:id', auth, commentControl.deleteComment);

// EXPORTS
module.exports = router;