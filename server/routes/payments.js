const express = require("express")
const router = express.Router()
const Razorpay = require("razorpay")
const crypto = require("crypto")
const Payment = require("../models/Payment")
const Enrollment = require("../models/Enrollment")
const Course = require("../models/Course")
const User = require("../models/User")
const PromoCode = require("../models/PromoCode")
const auth = require("../middleware/auth")


if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
  throw new Error("❌ RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET must be set in .env file")
}

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
})

// Create Razorpay order
router.post("/create-order", auth, async (req, res) => {
  try {
    const { courseId, amount, promoCode, billingInfo } = req.body
    const userId = req.user.id

    // Fetch course details
    const course = await Course.findById(courseId)
    if (!course) {
      return res.status(404).json({ message: "Course not found" })
    }

    // Check if user is already enrolled
    const existingEnrollment = await Enrollment.findOne({
      user: userId,
      course: courseId,
    })
    if (existingEnrollment) {
      return res.status(400).json({ message: "Already enrolled in this course" })
    }

    // Validate promo code if provided
    let discount = 0
    let validPromoCode = null
    if (promoCode) {
      validPromoCode = await PromoCode.findOne({
        code: promoCode.toUpperCase(),
        isActive: true,
        validFrom: { $lte: new Date() },
        validUntil: { $gte: new Date() },
        $or: [{ isGlobal: true }, { applicableCourses: courseId }],
      })

      if (!validPromoCode) {
        return res.status(400).json({ message: "Invalid or expired promo code" })
      }

      if (validPromoCode.usageLimit && validPromoCode.usedCount >= validPromoCode.usageLimit) {
        return res.status(400).json({ message: "Promo code usage limit exceeded" })
      }

      // Calculate discount
      if (validPromoCode.discountType === "percentage") {
        discount = (course.price * validPromoCode.discountValue) / 100
      } else {
        discount = validPromoCode.discountValue
      }
    }

    const finalAmount = Math.max(0, (amount || course.price) - discount)

    // Create Razorpay order
    const options = {
      amount: Math.round(finalAmount * 100), // amount in paise
      currency: "INR",
      receipt: `order_${Date.now()}`,
      notes: {
        courseId,
        userId,
        promoCode: validPromoCode?.code || "",
      },
    }

    const order = await razorpay.orders.create(options)

    // Create payment record
    const payment = new Payment({
      user: userId,
      course: courseId,
      razorpay_order_id: order.id,
      amount: finalAmount,
      promoCode: validPromoCode?.code,
      discount: discount,
      billingInfo,
      status: "pending",
    })

    await payment.save()

    res.json({
      orderId: order.id,
      amount: finalAmount,
      currency: "INR",
      key: process.env.RAZORPAY_KEY_ID,
      paymentId: payment._id,
    })
  } catch (error) {
    res.status(500).json({ message: "Failed to create payment order" })
  }
})

// Verify payment and create enrollment
router.post("/verify", auth, async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;
    const userId = req.user.id;

    // Compute expected signature
    const body = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(body.toString())
      .digest("hex");

    // Compare signatures
    if (expectedSignature !== razorpay_signature) {
      return res.status(400).json({
        message: "Payment verification failed"
      });
    }

    // Find the payment record
    const payment = await Payment.findOne({
      razorpay_order_id,
      user: userId,
    }).populate("course");

    if (!payment) {
      return res.status(404).json({ message: "Payment record not found" });
    }

    if (payment.status === "completed") {
      const enrollment = await Enrollment.findOne({
        user: userId,
        course: payment.course._id,
      });

      return res.json({
        status: "success",
        payment,
        course: payment.course,
        enrollment,
      });
    }

    // Update payment status
    payment.status = "completed";
    payment.razorpay_payment_id = razorpay_payment_id;
    payment.razorpay_signature = razorpay_signature;
    payment.completedAt = new Date();
    await payment.save();

    // Create enrollment
    const enrollment = new Enrollment({
      user: userId,
      course: payment.course._id,
      payment: payment._id,
      status: "active",
      progress: {
        totalLessons: 10, // This should be calculated based on actual course content
        completionPercentage: 0,
        lastAccessedAt: new Date(),
      },
    });
    await enrollment.save();

    // Update course enrollment count
    await Course.findByIdAndUpdate(payment.course._id, {
      $inc: { enrollmentCount: 1 },
    });

    res.json({
      status: "success",
      payment,
      course: payment.course,
      enrollment,
    });

  } catch (error) {
    res.status(500).json({ message: "Failed to verify payment" });
  }
})


// Get available offers for a course
router.get("/available-offers", auth, async (req, res) => {
  try {
    const { courseId } = req.query

    if (!courseId) {
      return res.status(400).json({ message: "Course ID is required" })
    }

    // Fetch valid promo codes for the course
    const offers = await PromoCode.find({
      isActive: true,
      validFrom: { $lte: new Date() },
      validUntil: { $gte: new Date() },
      $or: [
        { isGlobal: true },
        { applicableCourses: courseId }
      ],
      excludedCourses: { $ne: courseId },
      $or: [
        { usageLimit: { $exists: false } },
        { $expr: { $lt: ["$usedCount", "$usageLimit"] } }
      ]
    }).select('code description discountType discountValue minimumAmount maximumDiscount').sort({ discountValue: -1 })

    res.json({
      offers: offers.map(offer => ({
        code: offer.code,
        description: offer.description,
        discountType: offer.discountType,
        discountValue: offer.discountValue,
        minimumAmount: offer.minimumAmount || 0,
        maximumDiscount: offer.maximumDiscount || null,
      }))
    })
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch available offers" })
  }
})

// Validate promo code
router.post("/validate-promo", auth, async (req, res) => {
  try {
    const { code, courseId } = req.body

    const promoCode = await PromoCode.findOne({
      code: code.toUpperCase(),
      isActive: true,
      validFrom: { $lte: new Date() },
      validUntil: { $gte: new Date() },
      $or: [{ isGlobal: true }, { applicableCourses: courseId }],
    })

    if (!promoCode) {
      return res.status(400).json({ message: "Invalid or expired promo code" })
    }

    if (promoCode.usageLimit && promoCode.usedCount >= promoCode.usageLimit) {
      return res.status(400).json({ message: "Promo code usage limit exceeded" })
    }

    res.json({
      code: promoCode.code,
      discount: promoCode.discountValue,
      discountType: promoCode.discountType,
      description: promoCode.description,
    })
  } catch (error) {
    res.status(500).json({ message: "Failed to validate promo code" })
  }
})

// Get payment history
router.get("/history", auth, async (req, res) => {
  try {
    const userId = req.user.id

    const payments = await Payment.find({ user: userId })
      .populate("course", "title instructor thumbnail")
      .sort({ createdAt: -1 })

    res.json(payments)
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch payment history" })
  }
})

// Request refund
router.post("/refund", auth, async (req, res) => {
  try {
    const { paymentId, reason } = req.body
    const userId = req.user.id

    const payment = await Payment.findOne({
      _id: paymentId,
      user: userId,
      status: "completed",
    })

    if (!payment) {
      return res.status(404).json({ message: "Payment not found or not eligible for refund" })
    }

    // Check if refund is within 30 days
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

    if (payment.completedAt < thirtyDaysAgo) {
      return res.status(400).json({ message: "Refund period has expired (30 days)" })
    }

    // Create refund in Razorpay
    const refund = await razorpay.payments.refund(payment.razorpay_payment_id, {
      amount: Math.round(payment.amount * 100), // amount in paise
      speed: "normal",
      notes: {
        reason: reason,
        refund_from: "dashboard",
      },
    })

    // Update payment record
    payment.status = "refunded"
    payment.refundId = refund.id
    payment.refundReason = reason
    await payment.save()

    // Remove enrollment
    await Enrollment.findOneAndDelete({
      user: userId,
      course: payment.course,
    })

    // Update course enrollment count
    await Course.findByIdAndUpdate(payment.course, {
      $inc: { enrollmentCount: -1 },
    })

    res.json({
      message: "Refund processed successfully",
      refundId: refund.id,
    })
  } catch (error) {
    res.status(500).json({ message: "Failed to process refund" })
  }
})

// Razorpay webhook handler
router.post("/webhook", express.raw({ type: "application/json" }), async (req, res) => {
  const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET
  const webhookSignature = req.headers["x-razorpay-signature"]

  if (webhookSecret) {
    const expectedSignature = crypto.createHmac("sha256", webhookSecret).update(JSON.stringify(req.body)).digest("hex")

    if (expectedSignature !== webhookSignature) {
      return res.status(400).send("Webhook signature verification failed")
    }
  }

  const event = req.body.event
  const paymentEntity = req.body.payload.payment.entity

  try {
    switch (event) {
      case "payment.captured":
        await handleSuccessfulPayment(paymentEntity)
        break
      case "payment.failed":
        await handleFailedPayment(paymentEntity)
        break
      default:
    }

    res.json({ received: true })
  } catch (error) {
    res.status(500).json({ error: "Webhook processing failed" })
  }
})

// Helper function to handle successful payment
async function handleSuccessfulPayment(paymentEntity) {
  try {
    const payment = await Payment.findOne({
      razorpay_order_id: paymentEntity.order_id,
    })

    if (!payment || payment.status === "completed") {
      return // Already processed
    }

    // Update payment status
    payment.status = "completed";
    payment.razorpay_payment_id = paymentEntity.id;
    payment.completedAt = new Date();
    await payment.save();

    // Process referral reward if user was referred
    const user = await User.findById(payment.user);
    if (user.referredBy) {
      const referral = await Referral.findOne({ referrer: user.referredBy });
      if (referral) {
        const referredRecord = referral.referred.find(r => r.user.toString() === user._id.toString());
        if (referredRecord && referredRecord.status === "pending") {
          // Calculate reward amount (10% of course price)
          const rewardAmount = Math.round(payment.amount * 0.10);
          
          // Update referral record
          referredRecord.status = "completed";
          referredRecord.reward = rewardAmount;
          await referral.save();

          // Update referrer's rewards
          await User.findByIdAndUpdate(user.referredBy, {
            $inc: {
              "referralRewards.earned": rewardAmount
            }
          });
        }
      }
    }

    // Create enrollment if not exists
    const existingEnrollment = await Enrollment.findOne({
      user: payment.user,
      course: payment.course,
    })

    if (!existingEnrollment) {
      const enrollment = new Enrollment({
        user: payment.user,
        course: payment.course,
        payment: payment._id,
        status: "active",
        progress: {
          totalLessons: payment.course.lessons.length,
          completionPercentage: 0,
          lastAccessedAt: new Date(),
        },
      })

      await enrollment.save()

      // Update course enrollment count
      await Course.findByIdAndUpdate(payment.course, {
        $inc: { enrollmentCount: 1 },
      })

      // Update promo code usage if applicable
      if (payment.promoCode) {
        await PromoCode.findOneAndUpdate({ code: payment.promoCode }, { $inc: { usedCount: 1 } })
      }
    }
  } catch (error) {
    // Silently fail as this is a background process
  }
}

// Helper function to handle failed payment
async function handleFailedPayment(paymentEntity) {
  try {
    const payment = await Payment.findOne({
      razorpay_order_id: paymentEntity.order_id,
    })

    if (payment) {
      payment.status = "failed"
      await payment.save()
    }
  } catch (error) {
    // Silently fail as this is a background process
  }
}

module.exports = router
