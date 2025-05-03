import express from 'express';
import { getNotifications, markAsRead, markAllAsRead, deleteNotification } from '../controllers/notificationController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// Protect all routes (only authenticated users)
router.use(protect);

// @route   GET /api/notifications
// @desc    Get all notifications for the logged-in user
router.get('/', getNotifications);

// @route   PATCH /api/notifications/:id/read
// @desc    Mark a single notification as read
router.patch('/:id/read', markAsRead);

// @route   PATCH /api/notifications/read-all
// @desc    Mark all notifications as read
router.patch('/read-all', markAllAsRead);

// @route   DELETE /api/notifications/:id
// @desc    Delete a notification
router.delete('/:id', deleteNotification);

export default router;
