const express = require('express');
const router = express.Router();
const SupportTicket = require('../models/SupportTicket');
const { protect, authorize } = require('../middleware/auth');

// @route   POST /api/support/tickets
// @desc    Create a new support ticket
// @access  Private
router.post('/tickets', protect, async (req, res) => {
  try {
    const { subject, category, priority, description, orderId, attachments } = req.body;

    if (!subject || !description) {
      return res.status(400).json({
        success: false,
        message: 'Subject and description are required'
      });
    }

    const ticket = await SupportTicket.create({
      user: req.user.id,
      subject,
      category,
      priority,
      description,
      order: orderId,
      attachments,
      metadata: {
        userAgent: req.headers['user-agent'],
        ipAddress: req.ip
      }
    });

    await ticket.populate('user', 'firstName lastName email');

    res.status(201).json({
      success: true,
      data: ticket,
      message: 'Your ticket has been created'
    });
  } catch (error) {
    console.error('Create ticket error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create ticket'
    });
  }
});

// @route   GET /api/support/tickets
// @desc    Get user's support tickets
// @access  Private
router.get('/tickets', protect, async (req, res) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;

    const query = { user: req.user.id };
    if (status) query.status = status;

    const [tickets, total] = await Promise.all([
      SupportTicket.find(query)
        .sort('-createdAt')
        .skip((page - 1) * limit)
        .limit(Number(limit)),
      SupportTicket.countDocuments(query)
    ]);

    res.json({
      success: true,
      data: tickets,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get tickets error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch tickets'
    });
  }
});

// @route   GET /api/support/tickets/:id
// @desc    Get single ticket with messages
// @access  Private
router.get('/tickets/:id', protect, async (req, res) => {
  try {
    const ticket = await SupportTicket.findOne({
      _id: req.params.id,
      user: req.user.id
    }).populate('messages.sender', 'firstName lastName email avatar');

    if (!ticket) {
      return res.status(404).json({
        success: false,
        message: 'Ticket not found'
      });
    }

    res.json({
      success: true,
      data: ticket
    });
  } catch (error) {
    console.error('Get ticket error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch ticket'
    });
  }
});

// @route   POST /api/support/tickets/:id/messages
// @desc    Add message to ticket
// @access  Private
router.post('/tickets/:id/messages', protect, async (req, res) => {
  try {
    const { message, attachments } = req.body;

    if (!message) {
      return res.status(400).json({
        success: false,
        message: 'Message is required'
      });
    }

    const ticket = await SupportTicket.findOne({
      _id: req.params.id,
      user: req.user.id
    });

    if (!ticket) {
      return res.status(404).json({
        success: false,
        message: 'Ticket not found'
      });
    }

    if (['resolved', 'closed'].includes(ticket.status)) {
      return res.status(400).json({
        success: false,
        message: 'Cannot reply to a closed ticket'
      });
    }

    ticket.messages.push({
      sender: req.user.id,
      message,
      attachments,
      isAdmin: false
    });

    // Update status if it was resolved
    if (ticket.status === 'resolved') {
      ticket.status = 'pending';
    }

    await ticket.save();
    await ticket.populate('messages.sender', 'firstName lastName email avatar');

    // TODO: Send email notification to support team

    res.json({
      success: true,
      data: ticket,
      message: 'Message added'
    });
  } catch (error) {
    console.error('Add message error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to add message'
    });
  }
});

// Admin Routes
// @route   GET /api/support/admin/tickets
// @desc    Get all tickets (admin)
// @access  Private/Admin
router.get('/admin/tickets', protect, authorize('admin'), async (req, res) => {
  try {
    const { status, priority, category, assignedTo, page = 1, limit = 20 } = req.query;

    const query = {};
    if (status) query.status = status;
    if (priority) query.priority = priority;
    if (category) query.category = category;
    if (assignedTo) query.assignedTo = assignedTo;

    const [tickets, total] = await Promise.all([
      SupportTicket.find(query)
        .populate('user', 'firstName lastName email')
        .populate('assignedTo', 'firstName lastName email')
        .sort('-createdAt')
        .skip((page - 1) * limit)
        .limit(Number(limit)),
      SupportTicket.countDocuments(query)
    ]);

    res.json({
      success: true,
      data: tickets,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Admin get tickets error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch tickets'
    });
  }
});

// @route   PUT /api/support/admin/tickets/:id
// @desc    Update ticket (admin)
// @access  Private/Admin
router.put('/admin/tickets/:id', protect, authorize('admin'), async (req, res) => {
  try {
    const { status, priority, assignedTo, internalNote } = req.body;

    const ticket = await SupportTicket.findById(req.params.id);

    if (!ticket) {
      return res.status(404).json({
        success: false,
        message: 'Ticket not found'
      });
    }

    if (status) ticket.status = status;
    if (priority) ticket.priority = priority;
    if (assignedTo) ticket.assignedTo = assignedTo;

    if (status === 'in_progress' && !ticket.firstResponseAt) {
      ticket.firstResponseAt = new Date();
    }

    if (['resolved', 'closed'].includes(status)) {
      ticket.resolvedAt = new Date();
    }

    await ticket.save();
    await ticket.populate('user', 'firstName lastName email');

    res.json({
      success: true,
      data: ticket,
      message: 'Ticket updated'
    });
  } catch (error) {
    console.error('Admin update ticket error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update ticket'
    });
  }
});

// @route   POST /api/support/admin/tickets/:id/reply
// @desc    Admin reply to ticket
// @access  Private/Admin
router.post('/admin/tickets/:id/reply', protect, authorize('admin'), async (req, res) => {
  try {
    const { message, attachments, status } = req.body;

    const ticket = await SupportTicket.findById(req.params.id);

    if (!ticket) {
      return res.status(404).json({
        success: false,
        message: 'Ticket not found'
      });
    }

    ticket.messages.push({
      sender: req.user.id,
      message,
      attachments,
      isAdmin: true
    });

    if (status) ticket.status = status;
    if (status === 'in_progress' && !ticket.firstResponseAt) {
      ticket.firstResponseAt = new Date();
    }

    await ticket.save();
    await ticket.populate('messages.sender', 'firstName lastName email avatar');

    // TODO: Send email notification to user

    res.json({
      success: true,
      data: ticket,
      message: 'Reply sent'
    });
  } catch (error) {
    console.error('Admin reply error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send reply'
    });
  }
});

module.exports = router;
