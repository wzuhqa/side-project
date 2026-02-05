const mongoose = require('mongoose');

const supportTicketSchema = new mongoose.Schema({
  ticketNumber: {
    type: String,
    unique: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  order: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order'
  },
  subject: {
    type: String,
    required: true,
    trim: true,
    maxlength: 200
  },
  category: {
    type: String,
    enum: ['order_issue', 'product_question', 'return_refund', 'payment', 'shipping', 'technical', 'other'],
    default: 'other'
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium'
  },
  status: {
    type: String,
    enum: ['open', 'pending', 'in_progress', 'resolved', 'closed'],
    default: 'open'
  },
  description: {
    type: String,
    required: true,
    maxlength: 5000
  },
  attachments: [{
    url: String,
    name: String,
    type: String,
    uploadedAt: { type: Date, default: Date.now }
  }],
  messages: [{
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    isAdmin: { type: Boolean, default: false },
    message: { type: String, required: true },
    attachments: [{
      url: String,
      name: String,
      type: String
    }],
    createdAt: { type: Date, default: Date.now }
  }],
  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  firstResponseAt: Date,
  resolvedAt: Date,
  slaDeadline: Date,
  tags: [String],
  metadata: {
    userAgent: String,
    ipAddress: String,
    orderNumber: String,
    productName: String
  }
}, {
  timestamps: true
});

// Generate ticket number before saving
supportTicketSchema.pre('save', async function(next) {
  if (!this.ticketNumber) {
    const count = await this.constructor.countDocuments();
    this.ticketNumber = `TKT-${String(count + 10001).padStart(6, '0')}`;
  }
  next();
});

// Indexes
supportTicketSchema.index({ user: 1, status: 1 });
supportTicketSchema.index({ ticketNumber: 1 });
supportTicketSchema.index({ status: 1, priority: -1 });
supportTicketSchema.index({ assignedTo: 1, status: 1 });

// Virtual for response time
supportTicketSchema.virtual('responseTime').get(function() {
  if (this.firstResponseAt && this.createdAt) {
    return this.firstResponseAt - this.createdAt;
  }
  return null;
});

module.exports = mongoose.model('SupportTicket', supportTicketSchema);
