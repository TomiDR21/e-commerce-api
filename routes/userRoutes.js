const express = require('express');
const { signupUser, loginUser, getUsers, purchases, getPurchasesByUser } = require('../controllers/userController');

const router = express.Router();

router.post('/signup', signupUser);
router.post('/login', loginUser);
router.get('/users', getUsers);
router.post('/purchases', purchases);
router.get('/purchases/:userId', getPurchasesByUser)
module.exports = router;
