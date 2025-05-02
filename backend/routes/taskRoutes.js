import express from 'express';
import {
  createTask,
  getTasks,
  updateTask,
  deleteTask,
} from '../controllers/taskController.js';
import { protect, authorizeRoles } from '../middleware/authMiddleware.js';

const router = express.Router();

// All users can create and get tasks
router.route('/').post(protect, createTask).get(protect, getTasks);

// Update/Delete: Only creator or admin can update or delete
router
  .route('/:id')
  .put(protect, authorizeRoles('admin', 'manager', 'user'), updateTask)
  .delete(protect, authorizeRoles('admin', 'manager', 'user'), deleteTask);

export default router;
