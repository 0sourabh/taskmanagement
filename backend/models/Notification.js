// models/Notification.js
import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, // recipient
    type: {
      type: String,
      enum: [
        'task_created',        // A task was created
        'task_assigned',       // A task was assigned to the user
        'task_updated',        // Any field updated (title, desc, etc.)
        'status_updated',      // Status changed (pending → completed)
        'priority_updated',    // Priority changed
        'dueDate_updated',     // Due date changed
        'task_deleted',        // Task deleted
        'task_completed',      // Task marked completed
        'general'              // For any other info
      ],
      default: 'general',
    },
    message: { type: String, required: true }, // Custom message text
    task: { type: mongoose.Schema.Types.ObjectId, ref: 'Task' }, // Optional: related task
    isRead: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export default mongoose.model('Notification', notificationSchema);
