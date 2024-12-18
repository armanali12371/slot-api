const express = require('express');
const { createTask, getTaskList, deleteTask, updateTaskStatus,createTaskEmail } = require('../controllers/taskController');
const { verifyToken } = require('../middleware/authMiddleware');
const router = express.Router();

// Route to create a task
router.post('/createTask', verifyToken, createTask);
router.post('/createTaskEmail', verifyToken, createTaskEmail);
router.get('/getTaskList', verifyToken, getTaskList);
router.delete('/delete', verifyToken, deleteTask);
router.patch('/updateStatus', verifyToken, updateTaskStatus);

module.exports = router;
