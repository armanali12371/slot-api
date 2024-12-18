const { db } = require('../models/firebase');
const { verifyToken } = require('../middleware/authMiddleware');
const sendTaskNotification = require('../utils/emailService'); 

// Create Task function
const createTask = async (req, res) => {
  const { title, description, status, assignee } = req.body;
  const createdBy = req.userId; // The user ID should be available after the auth middleware
  const userRole = req.user.role; // Role of the user (admin or user)

  console.log('User ID:', req.userId, 'Role:', userRole);

  if (!title || !description || !status) {
    return res.status(400).json({ error: 'Title, description, and status are required.' });
  }

  if (!createdBy) {
    return res.status(400).json({ error: 'CreatedBy (user ID) is required.' });
  }

  // Determine the assignee based on user role
  const taskAssignee = userRole === 'admin' ? assignee : createdBy;

  // Validate admin-specific logic
  if (userRole === 'admin' && !assignee) {
    return res.status(400).json({ error: 'Assignee is required for admin-created tasks.' });
  }

  try {
    // Create the task in Firestore
    const taskRef = await db.collection('tasks').add({
      title,
      description,
      assignee: taskAssignee,
      status,
      createdAt: new Date(),
      updatedAt: new Date(),
      createdBy, // User who created the task
    });

    res.status(201).json({
      message: 'Task created successfully!',
      taskId: taskRef.id,
    });
  } catch (error) {
    console.error('Error creating task:', error.message);
    res.status(500).json({ error: error.message });
  }
};


// Get Task List function
const getTaskList = async (req, res) => {
    const userRole = req.user.role; // Role of the user (admin or user)
    const userId = req.userId; // Logged-in user's ID
  
    try {
      const tasksSnapshot = await db.collection('tasks').get();
  
      // Extract tasks
      let tasks = [];
      tasksSnapshot.forEach((doc) => {
        tasks.push({ id: doc.id, ...doc.data() });
      });
  
      // Filter tasks based on user role
      if (userRole === 'user') {
        tasks = tasks.filter((task) => task.assignee === userId);
      }
  
      // Format tasks based on user role
      const formattedTasks = tasks.map((task) => {
        if (userRole === 'admin') {
          return {
            TaskId: task.id,
            TaskTitle: task.title,
            Description: task.description,
            Status: task.status,
            AssignedTo: task.assignee,
            CreatedBy: task.createdBy,
            CreatedAt: new Date(task.createdAt.toDate()).toLocaleString(),
            UpdatedAt: new Date(task.updatedAt.toDate()).toLocaleString(),
          };
        } else if (userRole === 'user') {
          return {
            TaskId: task.id,
            TaskTitle: task.title,
            Description: task.description,
            Status: task.status,
            CreatedAt: new Date(task.createdAt.toDate()).toLocaleString(),
            UpdatedAt: new Date(task.updatedAt.toDate()).toLocaleString(),
            Actions: ['Mark as Completed', 'Mark as In Progress'], // Possible actions
          };
        }
      });
  
      res.status(200).json({
        message: 'Tasks retrieved successfully!',
        tasks: formattedTasks,
      });
    } catch (error) {
      console.error('Error retrieving tasks:', error.message);
      res.status(500).json({ error: error.message });
    }
  };

  const deleteTask = async (req, res) => {
    const { taskId } = req.query; // Extract taskId from query parameters
  
    if (!taskId) {
      return res.status(400).json({ error: 'Task ID is required to delete a task.' });
    }
  
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'You do not have permission to delete tasks.' });
    }
  
    try {
      const taskRef = db.collection('tasks').doc(taskId);
  
      const taskDoc = await taskRef.get();
      if (!taskDoc.exists) {
        return res.status(404).json({ error: 'Task not found.' });
      }
  
      await taskRef.delete();
  
      res.status(200).json({ message: 'Task deleted successfully.' });
    } catch (error) {
      console.error('Error deleting task:', error.message);
      res.status(500).json({ error: error.message });
    }
  };
  const updateTaskStatus = async (req, res) => {
    const { taskId, status } = req.body; // Task ID and new status from the request body
    const userId = req.userId; // Logged-in user's ID
    const userRole = req.user.role; // Role of the logged-in user
  
    if (!taskId || !status) {
      return res.status(400).json({ error: 'Task ID and status are required.' });
    }
  
    try {
      const taskRef = db.collection('tasks').doc(taskId);
      const taskDoc = await taskRef.get();
  
      if (!taskDoc.exists) {
        return res.status(404).json({ error: 'Task not found.' });
      }
  
      const taskData = taskDoc.data();
  
      // Check if the user is the assignee or an admin
      if (userRole !== 'admin' && taskData.assignee !== userId) {
        return res.status(403).json({ error: 'You do not have permission to update this task.' });
      }
  
      // Update the task status
      await taskRef.update({
        status,
        updatedAt: new Date(),
      });
  
      res.status(200).json({ message: 'Task status updated successfully!' });
    } catch (error) {
      console.error('Error updating task status:', error.message);
      res.status(500).json({ error: error.message });
    }
  };

  const createTaskEmail = async (req, res) => {
    const { title, description, status, assignee } = req.body;
    const createdBy = req.userId; // The user ID should be available after the auth middleware
    const userRole = req.user.role; // Role of the user (admin or user)
  
    console.log('User ID:', req.userId, 'Role:', userRole);
  
    // Validate input fields
    if (!title || !description || !status) {
      return res.status(400).json({ error: 'Title, description, and status are required.' });
    }
  
    if (!createdBy) {
      return res.status(400).json({ error: 'CreatedBy (user ID) is required.' });
    }
  
    // Determine the assignee based on user role
    const taskAssignee = userRole === 'admin' ? assignee : createdBy;
  
    // Validate admin-specific logic
    if (userRole === 'admin' && !assignee) {
      return res.status(400).json({ error: 'Assignee is required for admin-created tasks.' });
    }
  
    try {
      // Get the assignee's email from Firestore
      const assigneeDoc = await db.collection('users').doc(taskAssignee).get();
      if (!assigneeDoc.exists) {
        return res.status(400).json({ error: 'Assignee not found.' });
      }
      const assigneeEmail = assigneeDoc.data().email;
  
      // Create the task in Firestore
      const taskRef = await db.collection('tasks').add({
        title,
        description,
        assignee: taskAssignee,
        status,
        createdAt: new Date(),
        updatedAt: new Date(),
        createdBy, // User who created the task
      });
  
      // Send email to the assignee
      sendTaskNotification(assigneeEmail, { title, description, status });
  
      res.status(201).json({
        message: 'Task created successfully!',
        taskId: taskRef.id,
      });
    } catch (error) {
      console.error('Error creating task:', error.message);
      res.status(500).json({ error: error.message });
    }
  };
  
  
module.exports = { createTask, getTaskList, deleteTask ,updateTaskStatus,createTaskEmail};
