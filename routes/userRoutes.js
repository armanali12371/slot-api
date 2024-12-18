const express = require('express');
const { createUser, updateProfile, getUserList,getUserById } = require('../controllers/userController');
const { verifyToken } = require('../middleware/authMiddleware');
const { updateUserProfile } = require("../controllers/profileController");
const router = express.Router();

router.post('/createUser', verifyToken, createUser);
router.post("/updateProfile", verifyToken, updateProfile);
router.get('/list', verifyToken, getUserList); // Get User List
router.get('/user/:id', getUserById);


module.exports = router;
