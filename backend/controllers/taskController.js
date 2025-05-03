import Task from '../models/Task.js';
import { getSocket } from '../utils/socket.js';
import { sendNotification } from '../utils/sendNotification.js';

// @desc Create a new task
// @route POST /api/tasks
// @access Private
export const createTask = async (req, res) => {
  const { title, description, dueDate, priority, assignedTo } = req.body;

  try {
    const task = await Task.create({
      title,
      description,
      dueDate,
      priority,
      createdBy: req.user._id,
      assignedTo,
    });

    if (assignedTo && assignedTo.toString() !== req.user._id.toString()) {
      await sendNotification({
        userId: assignedTo,
        type: 'task_assigned',
        message: `You have been assigned a new task: "${title}"`,
        taskId: task._id,
        io: getSocket(),
      });
    }

    res.status(201).json(task);
  } catch (err) {
    res.status(500).json({ message: 'Error creating task', error: err.message });
  }
};

// @desc Get all tasks
// @route GET /api/tasks
// @access Private
export const getTasks = async (req, res) => {
  try {
    const tasks = await Task.find({
      $or: [{ createdBy: req.user._id }, { assignedTo: req.user._id }],
    }).populate('assignedTo', 'name email');

    res.json(tasks);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching tasks', error: err.message });
  }
};

// @desc Update a task
// @route PUT /api/tasks/:id
// @access Private (creator or admin)
export const updateTask = async (req, res) => {
  const { title, description, dueDate, priority, status, assignedTo } = req.body;

  try {
    const task = await Task.findById(req.params.id);

    if (!task) return res.status(404).json({ message: 'Task not found' });

    if (!task.createdBy.equals(req.user._id) && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to update this task' });
    }

    const prevAssignedTo = task.assignedTo?.toString();
    const prevStatus = task.status;

    task.title = title || task.title;
    task.description = description || task.description;
    task.dueDate = dueDate || task.dueDate;
    task.priority = priority || task.priority;
    task.status = status || task.status;
    task.assignedTo = assignedTo || task.assignedTo;

    const updatedTask = await task.save();
    const io = getSocket();

    // Notify if assigned user changed
    if (assignedTo && assignedTo.toString() !== prevAssignedTo) {
      await sendNotification({
        userId: assignedTo,
        type: 'task_assigned',
        message: `You have been assigned a new task: "${updatedTask.title}"`,
        taskId: updatedTask._id,
        io,
      });
    }

    // Notify if task was updated (to current assigned user)
    if (task.assignedTo) {
      await sendNotification({
        userId: task.assignedTo,
        type: 'task_updated',
        message: `Your task "${updatedTask.title}" has been updated.`,
        taskId: updatedTask._id,
        io,
      });
    }

    // Notify if status changed
    if (status && status !== prevStatus && task.assignedTo) {
      const statusMessage =
        status === 'completed'
          ? `Your task "${task.title}" has been marked as completed.`
          : `Status of your task "${task.title}" changed to "${status}".`;

      await sendNotification({
        userId: task.assignedTo,
        type: 'status_updated',
        message: statusMessage,
        taskId: task._id,
        io,
      });
    }

    res.json(updatedTask);
  } catch (err) {
    res.status(500).json({ message: 'Error updating task', error: err.message });
  }
};

// @desc Delete a task
// @route DELETE /api/tasks/:id
// @access Private (creator or admin)
export const deleteTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);

    if (!task) return res.status(404).json({ message: 'Task not found' });

    if (!task.createdBy.equals(req.user._id) && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to delete this task' });
    }

    const assignedUser = task.assignedTo;
    const deletedTitle = task.title;
    const io = getSocket();

    await task.deleteOne();

    // Notify assigned user about deletion
    if (assignedUser) {
      await sendNotification({
        userId: assignedUser,
        type: 'task_deleted',
        message: `The task "${deletedTitle}" assigned to you has been deleted.`,
        io,
      });
    }

    res.json({ message: 'Task deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Error deleting task', error: err.message });
  }
};
