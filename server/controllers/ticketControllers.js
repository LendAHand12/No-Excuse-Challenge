import asyncHandler from "express-async-handler";
import Ticket from "../models/ticketModel.js";
import User from "../models/userModel.js";
import { Types } from "mongoose";
import {
  sendTicketResponseEmail,
  sendTicketResponseEmailToAdmin,
} from "../utils/sendMailCustom.js";

// @desc    Create a new ticket
// @route   POST /api/tickets
// @access  Private (User)
const createTicket = asyncHandler(async (req, res) => {
  const { user } = req;
  const { subject, message } = req.body;

  // Log for debugging
  console.log("Create ticket request:", {
    userId: user.id,
    subject,
    message,
    filesCount: req.files ? req.files.length : 0,
    files: req.files ? req.files.map((f) => f.filename) : [],
  });

  // Process images
  const images =
    req.files && req.files.length > 0
      ? req.files.map((file) => `/uploads/tickets/${file.filename}`)
      : [];

  if (!subject || !message) {
    res.status(400);
    throw new Error("Subject and message are required");
  }

  // Get user info
  const userInfo = await User.findById(user.id);
  if (!userInfo) {
    res.status(404);
    throw new Error("User not found");
  }

  // Create ticket
  const ticket = await Ticket.create({
    userId: user.id,
    subject,
    message,
    images,
    status: "PENDING",
  });

  console.log("Ticket created successfully:", {
    ticketId: ticket._id,
    images: ticket.images,
  });

  // Send email notification to admin
  try {
    await sendTicketResponseEmailToAdmin({
      userEmail: userInfo.email,
      userName: userInfo.userId || userInfo.email,
      ticketSubject: subject,
      message,
      ticketId: ticket._id.toString(),
    });
  } catch (error) {
    console.error("Error sending ticket notification email:", error);
    // Don't fail the request if email fails
  }

  res.status(201).json({
    success: true,
    ticket,
    message: "Ticket created successfully",
  });
});

// @desc    Get all tickets for a user
// @route   GET /api/tickets/user
// @access  Private (User)
const getUserTickets = asyncHandler(async (req, res) => {
  const { user } = req;
  const { pageNumber = 1, status } = req.query;
  const page = Number(pageNumber) || 1;
  const pageSize = 10;

  // Convert user.id to ObjectId
  const userId = new Types.ObjectId(user.id);

  const matchStage = { userId: userId };
  if (status && ["PENDING", "IN_PROGRESS", "RESOLVED", "CLOSED"].includes(status)) {
    matchStage.status = status;
  }

  console.log("getUserTickets - userId:", userId, "matchStage:", matchStage);

  const aggregationPipeline = [
    { $match: matchStage },
    {
      $lookup: {
        from: "users",
        localField: "userId",
        foreignField: "_id",
        as: "userInfo",
      },
    },
    { $unwind: { path: "$userInfo", preserveNullAndEmptyArrays: true } },
    { $sort: { createdAt: -1 } },
    {
      $project: {
        _id: 1,
        subject: 1,
        message: 1,
        images: 1,
        status: 1,
        adminResponse: 1,
        adminResponseAt: 1,
        resolvedAt: 1,
        createdAt: 1,
        updatedAt: 1,
        userInfo: {
          _id: 1,
          userId: 1,
          email: 1,
        },
      },
    },
  ];

  // Count total - create a copy for counting
  const countPipeline = [...aggregationPipeline, { $count: "total" }];
  const countAggregation = await Ticket.aggregate(countPipeline);
  const count = countAggregation[0]?.total || 0;

  // Add pagination
  aggregationPipeline.push({ $skip: pageSize * (page - 1) }, { $limit: pageSize });

  const tickets = await Ticket.aggregate(aggregationPipeline);

  console.log("getUserTickets - found tickets:", tickets.length, "total:", count);

  res.json({
    success: true,
    tickets,
    pages: Math.ceil(count / pageSize),
    currentPage: page,
    total: count,
  });
});

// @desc    Get all tickets (Admin)
// @route   GET /api/tickets
// @access  Private (Admin)
const getAllTickets = asyncHandler(async (req, res) => {
  const { pageNumber = 1, status, keyword } = req.query;
  const page = Number(pageNumber) || 1;
  const pageSize = 10;

  const matchStage = {};
  if (status && ["PENDING", "IN_PROGRESS", "RESOLVED", "CLOSED"].includes(status)) {
    matchStage.status = status;
  }

  const aggregationPipeline = [
    {
      $lookup: {
        from: "users",
        localField: "userId",
        foreignField: "_id",
        as: "userInfo",
      },
    },
    { $unwind: "$userInfo" },
  ];

  // Add keyword search
  if (keyword) {
    aggregationPipeline.push({
      $match: {
        $or: [
          { subject: { $regex: keyword, $options: "i" } },
          { message: { $regex: keyword, $options: "i" } },
          { "userInfo.userId": { $regex: keyword, $options: "i" } },
          { "userInfo.email": { $regex: keyword, $options: "i" } },
        ],
      },
    });
  }

  // Add status filter
  if (Object.keys(matchStage).length > 0) {
    aggregationPipeline.push({ $match: matchStage });
  }

  // Count total - create a copy for counting
  const countPipeline = [...aggregationPipeline, { $count: "total" }];
  const countAggregation = await Ticket.aggregate(countPipeline);
  const count = countAggregation[0]?.total || 0;

  // Add sorting and pagination
  aggregationPipeline.push(
    { $sort: { createdAt: -1 } },
    {
      $project: {
        _id: 1,
        subject: 1,
        message: 1,
        images: 1,
        status: 1,
        adminResponse: 1,
        adminResponseAt: 1,
        resolvedAt: 1,
        resolvedBy: 1,
        createdAt: 1,
        updatedAt: 1,
        userInfo: {
          _id: 1,
          userId: 1,
          email: 1,
        },
      },
    },
    { $skip: pageSize * (page - 1) },
    { $limit: pageSize }
  );

  const tickets = await Ticket.aggregate(aggregationPipeline);

  res.json({
    success: true,
    tickets,
    pages: Math.ceil(count / pageSize),
    currentPage: page,
    total: count,
  });
});

// @desc    Get ticket by ID
// @route   GET /api/tickets/:id
// @access  Private (User or Admin)
const getTicketById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { user } = req;

  const ticket = await Ticket.findById(id)
    .populate("userId", "userId email")
    .populate("resolvedBy", "userId email");

  if (!ticket) {
    res.status(404);
    throw new Error("Ticket not found");
  }

  // Check if user is owner or admin
  if (ticket.userId._id.toString() !== user.id && !user.isAdmin) {
    res.status(403);
    throw new Error("Not authorized to access this ticket");
  }

  res.json({
    success: true,
    ticket,
  });
});

// @desc    Reply to a ticket (Admin)
// @route   PUT /api/tickets/:id/reply
// @access  Private (Admin)
const replyTicket = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { user } = req;
  const { adminResponse } = req.body;

  if (!adminResponse) {
    res.status(400);
    throw new Error("Admin response is required");
  }

  const ticket = await Ticket.findById(id).populate("userId", "userId email");

  if (!ticket) {
    res.status(404);
    throw new Error("Ticket not found");
  }

  // Update ticket
  ticket.adminResponse = adminResponse;
  ticket.adminResponseAt = new Date();
  if (ticket.status === "PENDING") {
    ticket.status = "IN_PROGRESS";
  }
  await ticket.save();

  // Send email to user
  try {
    const userInfo = ticket.userId;
    await sendTicketResponseEmail({
      userEmail: userInfo.email,
      userName: userInfo.userId || userInfo.email,
      ticketSubject: ticket.subject,
      adminResponse,
      ticketId: ticket._id.toString(),
    });
  } catch (error) {
    console.error("Error sending ticket response email:", error);
    // Don't fail the request if email fails
  }

  res.json({
    success: true,
    ticket,
    message: "Reply sent successfully",
  });
});

// @desc    Mark ticket as resolved (Admin)
// @route   PUT /api/tickets/:id/resolve
// @access  Private (Admin)
const markResolved = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { user } = req;

  const ticket = await Ticket.findById(id);

  if (!ticket) {
    res.status(404);
    throw new Error("Ticket not found");
  }

  // Update ticket
  ticket.status = "RESOLVED";
  ticket.resolvedAt = new Date();
  ticket.resolvedBy = user.id;
  await ticket.save();

  res.json({
    success: true,
    ticket,
    message: "Ticket marked as resolved",
  });
});

// @desc    Close ticket (Admin)
// @route   PUT /api/tickets/:id/close
// @access  Private (Admin)
const closeTicket = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const ticket = await Ticket.findById(id);

  if (!ticket) {
    res.status(404);
    throw new Error("Ticket not found");
  }

  // Update ticket
  ticket.status = "CLOSED";
  await ticket.save();

  res.json({
    success: true,
    ticket,
    message: "Ticket closed",
  });
});

export {
  createTicket,
  getUserTickets,
  getAllTickets,
  getTicketById,
  replyTicket,
  markResolved,
  closeTicket,
};
