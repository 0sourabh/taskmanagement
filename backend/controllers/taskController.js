import Task from '../models/Task.js';
import { getSocket } from '../utils/socket.js';

// @desc    Create a new task
// @route   POST /api/tasks
// @access  Private (authenticated user)
export const createTask = async (req, res) => {
  const { title, description, dueDate, priority, assignedTo } = req.body;

  try {
    const task = await Task.create({
      title,
      description,
      dueDate,
      priority,
      createdBy: req.user._id, // Set the creator as the logged-in user
      assignedTo,
    });

    res.status(201).json(task);
  } catch (err) {
    res.status(500).json({ message: 'Error creating task', error: err.message });
  }
};

// @desc    Get all tasks (created by or assigned to the user)
// @route   GET /api/tasks
// @access  Private (authenticated user)
export const getTasks = async (req, res) => {
  try {
    const tasks = await Task.find({
      $or: [{ createdBy: req.user._id }, { assignedTo: req.user._id }],
    }).populate('assignedTo', 'name email'); // Populate assigned user's details

    res.json(tasks);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching tasks', error: err.message });
  }
};

// @desc    Update a task
// @route   PUT /api/tasks/:id
// @access  Private (creator or admin)
export const updateTask = async (req, res) => {
    const { title, description, dueDate, priority, status, assignedTo } = req.body;
  
    try {
      const task = await Task.findById(req.params.id);
  
      if (!task) {
        console.log(`Task with id ${req.params.id} not found`);
        return res.status(404).json({ message: 'Task not found' });
      }
  
      // Debugging log to check if the creator or admin
      console.log(`User ID: ${req.user._id}, Task Creator ID: ${task.createdBy}`);
      console.log(`User Role: ${req.user.role}`);
  
      // Ensure that only the creator or admin can update the task
      if (!task.createdBy.equals(req.user._id) && req.user.role !== 'admin') {
        console.log('User is not authorized to update this task');
        return res.status(403).json({ message: 'Not authorized to update this task' });
      }
  
      task.title = title || task.title;
      task.description = description || task.description;
      task.dueDate = dueDate || task.dueDate;
      task.priority = priority || task.priority;
      task.status = status || task.status;
      task.assignedTo = assignedTo || task.assignedTo;
  
      const updatedTask = await task.save();

      // Emit a notification when a task is updated
        const io = getSocket();
        if (assignedTo) {
            io.to(assignedTo.toString()).emit('taskUpdated', {
                taskId: updatedTask._id,
                message: `Your task "${updatedTask.title}" has been updated.`,
      });
    }

      res.json(updatedTask);
    } catch (err) {
      console.error('Error updating task:', err);
      res.status(500).json({ message: 'Error updating task', error: err.message });
    }
  };

// @desc    Delete a task
// @route   DELETE /api/tasks/:id
// @access  Private (creator or admin)
export const deleteTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);

    if (!task) return res.status(404).json({ message: 'Task not found' });

    // Ensure that only the creator or admin can delete the task
    if (!task.createdBy.equals(req.user._id) && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to delete this task' });
    }

    await task.deleteOne();
    res.json({ message: 'Task deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Error deleting task', error: err.message });
  }
};
