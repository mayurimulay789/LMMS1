const express = require("express")
const router = express.Router()
const { body, validationResult } = require("express-validator")
const Contact = require("../models/Contact")
const auth = require("../middleware/auth")
const adminMiddleware = require("../middleware/AdminMiddleware")
const { sendContactNotificationEmail, sendContactAutoReplyEmail } = require("../services/emailService")

// Validation rules
const contactValidation = [
  body("name").trim().isLength({ min: 2, max: 100 }).withMessage("Name must be between 2 and 100 characters"),
  body("email").isEmail().normalizeEmail().withMessage("Please provide a valid email address"),
  body("subject").trim().isLength({ min: 5, max: 200 }).withMessage("Subject must be between 5 and 200 characters"),
  body("message").trim().isLength({ min: 10, max: 2000 }).withMessage("Message must be between 10 and 2000 characters"),
  body("phone").optional().isMobilePhone().withMessage("Please provide a valid phone number"),
  body("category")
    .optional()
    .isIn(["general", "support", "billing", "technical", "partnership", "feedback"])
    .withMessage("Invalid category"),
]

// POST /api/contact - Submit contact form (public)
router.post("/", contactValidation, async (req, res) => {
  try {
    // Check validation errors
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: "Validation failed",
        details: errors.array(),
      })
    }

    const { name, email, subject, message, phone, category } = req.body

    // Create contact record
    const contact = new Contact({
      name,
      email,
      subject,
      message,
      phone,
      category: category || "general",
      metadata: {
        ipAddress: req.ip,
        userAgent: req.get("User-Agent"),
        referrer: req.get("Referrer"),
        source: "website",
      },
    })

    await contact.save()

    // TODO: Send email notification to admin
    // TODO: Send auto-reply email to user

    res.status(201).json({
      message: "Contact form submitted successfully",
      contactId: contact._id,
      status: "received",
    })
  } catch (error) {
    res.status(500).json({
      error: "Submission failed",
      message: "Failed to submit contact form. Please try again later.",
    })
  }
})

// GET /api/contact - Get all contacts (admin only)
router.get("/", auth, adminMiddleware, async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      status,
      category,
      priority,
      search,
      sortBy = "createdAt",
      sortOrder = "desc",
    } = req.query

    // Build query
    const query = {}
    if (status) query.status = status
    if (category) query.category = category
    if (priority) query.priority = priority
    if (search) {
      query.$text = { $search: search }
    }

    // Build sort options
    const sortOptions = {}
    sortOptions[sortBy] = sortOrder === "desc" ? -1 : 1

    // Execute query with pagination
    const contacts = await Contact.find(query)
      .populate("assignedTo", "name email")
      .populate("readBy", "name email")
      .populate("response.respondedBy", "name email")
      .sort(sortOptions)
      .limit(limit * 1)
      .skip((page - 1) * limit)

    const total = await Contact.countDocuments(query)

    res.json({
      contacts,
      pagination: {
        current: Number.parseInt(page),
        pages: Math.ceil(total / limit),
        total,
        limit: Number.parseInt(limit),
      },
      stats: {
        total: await Contact.countDocuments(),
        unread: await Contact.countDocuments({ isRead: false }),
        new: await Contact.countDocuments({ status: "new" }),
        inProgress: await Contact.countDocuments({ status: "in-progress" }),
        resolved: await Contact.countDocuments({ status: "resolved" }),
      },
    })
  } catch (error) {
    res.status(500).json({
      error: "Failed to fetch contacts",
      message: error.message,
    })
  }
})

// GET /api/contact/:id - Get specific contact (admin only)
router.get("/:id", auth, adminMiddleware, async (req, res) => {
  try {
    const contact = await Contact.findById(req.params.id)
      .populate("assignedTo", "name email role")
      .populate("readBy", "name email")
      .populate("response.respondedBy", "name email role")

    if (!contact) {
      return res.status(404).json({
        error: "Contact not found",
        message: "The requested contact does not exist",
      })
    }

    // Mark as read if not already read
    if (!contact.isRead) {
      await contact.markAsRead(req.user.id)
    }

    res.json(contact)
  } catch (error) {
    res.status(500).json({
      error: "Failed to fetch contact",
      message: error.message,
    })
  }
})

// PUT /api/contact/:id/status - Update contact status (admin only)
router.put("/:id/status", auth, adminMiddleware, async (req, res) => {
  try {
    const { status, assignedTo, priority } = req.body

    const contact = await Contact.findById(req.params.id)
    if (!contact) {
      return res.status(404).json({
        error: "Contact not found",
        message: "The requested contact does not exist",
      })
    }

    // Update fields
    if (status) contact.status = status
    if (assignedTo) contact.assignedTo = assignedTo
    if (priority) contact.priority = priority

    await contact.save()

    const updatedContact = await Contact.findById(req.params.id)
      .populate("assignedTo", "name email")
      .populate("response.respondedBy", "name email")

    res.json({
      message: "Contact updated successfully",
      contact: updatedContact,
    })
  } catch (error) {
    res.status(500).json({
      error: "Failed to update contact",
      message: error.message,
    })
  }
})

// POST /api/contact/:id/response - Add response to contact (admin only)
router.post("/:id/response", auth, adminMiddleware, async (req, res) => {
  try {
    const { message } = req.body

    if (!message || message.trim().length < 10) {
      return res.status(400).json({
        error: "Invalid response",
        message: "Response message must be at least 10 characters long",
      })
    }

    const contact = await Contact.findById(req.params.id)
    if (!contact) {
      return res.status(404).json({
        error: "Contact not found",
        message: "The requested contact does not exist",
      })
    }

    await contact.addResponse(message.trim(), req.user.id)

    const updatedContact = await Contact.findById(req.params.id)
      .populate("assignedTo", "name email")
      .populate("response.respondedBy", "name email role")

    // TODO: Send email response to user

    res.json({
      message: "Response added successfully",
      contact: updatedContact,
    })
  } catch (error) {
    res.status(500).json({
      error: "Failed to add response",
      message: error.message,
    })
  }
})

// DELETE /api/contact/:id - Delete contact (admin only)
router.delete("/:id", auth, adminMiddleware, async (req, res) => {
  try {
    const contact = await Contact.findById(req.params.id)
    if (!contact) {
      return res.status(404).json({
        error: "Contact not found",
        message: "The requested contact does not exist",
      })
    }

    await Contact.findByIdAndDelete(req.params.id)

    res.json({
      message: "Contact deleted successfully",
      contactId: req.params.id,
    })
  } catch (error) {
    res.status(500).json({
      error: "Failed to delete contact",
      message: error.message,
    })
  }
})

// GET /api/contact/stats/dashboard - Get contact statistics (admin only)
router.get("/stats/dashboard", auth, adminMiddleware, async (req, res) => {
  try {
    const stats = {
      total: await Contact.countDocuments(),
      unread: await Contact.countDocuments({ isRead: false }),
      byStatus: {
        new: await Contact.countDocuments({ status: "new" }),
        inProgress: await Contact.countDocuments({ status: "in-progress" }),
        resolved: await Contact.countDocuments({ status: "resolved" }),
        closed: await Contact.countDocuments({ status: "closed" }),
      },
      byCategory: {
        general: await Contact.countDocuments({ category: "general" }),
        support: await Contact.countDocuments({ category: "support" }),
        billing: await Contact.countDocuments({ category: "billing" }),
        technical: await Contact.countDocuments({ category: "technical" }),
        partnership: await Contact.countDocuments({ category: "partnership" }),
        feedback: await Contact.countDocuments({ category: "feedback" }),
      },
      byPriority: {
        low: await Contact.countDocuments({ priority: "low" }),
        medium: await Contact.countDocuments({ priority: "medium" }),
        high: await Contact.countDocuments({ priority: "high" }),
        urgent: await Contact.countDocuments({ priority: "urgent" }),
      },
      recent: await Contact.find()
        .sort({ createdAt: -1 })
        .limit(5)
        .select("name email subject status category createdAt"),
    }

    res.json(stats)
  } catch (error) {
    res.status(500).json({
      error: "Failed to fetch contact statistics",
      message: error.message,
    })
  }
})

// POST /api/contact/bulk-action - Bulk actions on contacts (admin only)
router.post("/bulk-action", auth, adminMiddleware, async (req, res) => {
  try {
    const { action, contactIds, data } = req.body

    if (!action || !contactIds || !Array.isArray(contactIds)) {
      return res.status(400).json({
        error: "Invalid request",
        message: "Action and contact IDs are required",
      })
    }

    let result
    switch (action) {
      case "mark-read":
        result = await Contact.updateMany(
          { _id: { $in: contactIds } },
          {
            isRead: true,
            readAt: new Date(),
            readBy: req.user.id,
          },
        )
        break

      case "update-status":
        if (!data.status) {
          return res.status(400).json({
            error: "Status required",
            message: "Status is required for status update action",
          })
        }
        result = await Contact.updateMany({ _id: { $in: contactIds } }, { status: data.status })
        break

      case "assign":
        if (!data.assignedTo) {
          return res.status(400).json({
            error: "Assignee required",
            message: "Assignee is required for assign action",
          })
        }
        result = await Contact.updateMany({ _id: { $in: contactIds } }, { assignedTo: data.assignedTo })
        break

      case "delete":
        result = await Contact.deleteMany({ _id: { $in: contactIds } })
        break

      default:
        return res.status(400).json({
          error: "Invalid action",
          message: "Unsupported bulk action",
        })
    }

    res.json({
      message: `Bulk ${action} completed successfully`,
      affected: result.modifiedCount || result.deletedCount,
      contactIds,
    })
  } catch (error) {
    res.status(500).json({
      error: "Bulk action failed",
      message: error.message,
    })
  }
})

module.exports = router
