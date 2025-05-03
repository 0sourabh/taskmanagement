// utils/sendNotification.js
import Notification from '../models/Notification.js';

/**
 * Sends and stores a notification
 * @param {Object} options - Options for the notification
 * @param {ObjectId} options.userId - Recipient user ID
 * @param {String} options.type - Type of notification (e.g., task_created)
 * @param {String} options.message - Message to display
 * @param {ObjectId} [options.taskId] - Optional: related task
 * @param {Object} [options.io] - Optional: socket.io instance for real-time
 */
export const sendNotification = async ({ userId, type, message, taskId, io }) => {
  try {
    // Save to DB
    const notification = await Notification.create({
      user: userId,
      type,
      message,
      task: taskId,
    });

    // Emit real-time notification (if io is provided and user is connected)
    if (io && userId) {
      io.to(userId.toString()).emit('newNotification', notification);
    }

    return notification;
  } catch (err) {
    console.error('Error sending notification:', err.message);
  }
};
