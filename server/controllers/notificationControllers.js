import asyncHandler from "express-async-handler";
import Notification from "../models/notificationModel.js";
import User from "../models/userModel.js";

// @desc    Get all notifications for a user
// @route   GET /api/notifications
// @access  Private (User)
const getNotifications = asyncHandler(async (req, res) => {
  const { user } = req;
  const { pageNumber = 1, limit = 20, isRead } = req.query;

  const page = Number(pageNumber);
  const pageSize = Number(limit);
  const skip = pageSize * (page - 1);

  // Build query
  const query = { userId: user.id };
  if (isRead !== undefined) {
    query.isRead = isRead === "true";
  }

  // Get notifications
  const notifications = await Notification.find(query)
    .populate("createdBy", "userId email")
    .sort({ createdAt: -1 })
    .limit(pageSize)
    .skip(skip);

  // Get total count
  const count = await Notification.countDocuments(query);

  // Get unread count
  const unreadCount = await Notification.countDocuments({
    userId: user.id,
    isRead: false,
  });

  res.json({
    notifications,
    pages: Math.ceil(count / pageSize),
    currentPage: page,
    total: count,
    unreadCount,
  });
});

// @desc    Get unread notifications count
// @route   GET /api/notifications/unread-count
// @access  Private (User)
const getUnreadCount = asyncHandler(async (req, res) => {
  const { user } = req;

  const unreadCount = await Notification.countDocuments({
    userId: user.id,
    isRead: false,
  });

  res.json({ unreadCount });
});

// @desc    Mark notification as read
// @route   PUT /api/notifications/:id/read
// @access  Private (User)
const markAsRead = asyncHandler(async (req, res) => {
  const { user } = req;
  const { id } = req.params;

  const notification = await Notification.findById(id);

  if (!notification) {
    res.status(404);
    throw new Error("Notification not found");
  }

  // Check if notification belongs to user
  if (notification.userId.toString() !== user.id.toString()) {
    res.status(403);
    throw new Error("Not authorized to update this notification");
  }

  notification.isRead = true;
  notification.readAt = new Date();
  await notification.save();

  res.json({ message: "Notification marked as read", notification });
});

// @desc    Mark all notifications as read
// @route   PUT /api/notifications/read-all
// @access  Private (User)
const markAllAsRead = asyncHandler(async (req, res) => {
  const { user } = req;

  const result = await Notification.updateMany(
    { userId: user.id, isRead: false },
    { isRead: true, readAt: new Date() }
  );

  res.json({
    message: "All notifications marked as read",
    updatedCount: result.modifiedCount,
  });
});

// @desc    Create a notification (for admin use later)
// @route   POST /api/notifications
// @access  Private (Admin)
const createNotification = asyncHandler(async (req, res) => {
  const { userId, title, message, type = "INFO" } = req.body;

  if (!userId || !title || !message) {
    res.status(400);
    throw new Error("userId, title, and message are required");
  }

  // Check if user exists
  const user = await User.findById(userId);
  if (!user) {
    res.status(404);
    throw new Error("User not found");
  }

  const notification = await Notification.create({
    userId,
    title,
    message,
    type,
    createdBy: req.user.id,
  });

  const populatedNotification = await Notification.findById(notification._id)
    .populate("createdBy", "userId email")
    .populate("userId", "userId email");

  res.status(201).json(populatedNotification);
});

export { getNotifications, getUnreadCount, markAsRead, markAllAsRead, createNotification };
