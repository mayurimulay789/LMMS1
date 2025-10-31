const express = require("express")
const router = express.Router()
const Referral = require("../models/Referral")
const User = require("../models/User")
const auth = require("../middleware/auth")

// Get user's referral code or generate a new one
router.get("/code", auth, async (req, res) => {
  try {
    let referral = await Referral.findOne({ referrer: req.user.id })
    
    if (!referral) {
      const user = await User.findById(req.user.id)
      const referralCode = await Referral.generateReferralCode(user.name)
      
      referral = new Referral({
        referralCode,
        referrer: req.user.id,
      })
      await referral.save()
    }
    
    res.json({
      referralCode: referral.referralCode,
      referralLink: `${process.env.CLIENT_URL}/signup?ref=${referral.referralCode}`,
      totalReferred: referral.referred.length,
      totalRewardsEarned: referral.totalRewardsEarned
    })
  } catch (error) {
    res.status(500).json({ message: "Failed to get referral code" })
  }
})

// Apply referral code during signup
router.post("/apply", async (req, res) => {
  try {
    const { referralCode, userId } = req.body
    
    // Find the referral
    const referral = await Referral.findOne({ 
      referralCode,
      isActive: true 
    })

    if (!referral) {
      return res.status(400).json({ message: "Invalid referral code" })
    }

    // Check if user already used a referral code
    const existingReferral = await Referral.findOne({
      "referred.user": userId
    })

    if (existingReferral) {
      return res.status(400).json({ message: "You have already used a referral code" })
    }

    // Add the referred user
    referral.referred.push({
      user: userId,
      status: "pending" // Will be updated to 'completed' after first course purchase
    })
    await referral.save()

    res.json({ 
      message: "Referral code applied successfully",
      rewardAmount: referral.rewardAmount 
    })
  } catch (error) {
    res.status(500).json({ message: "Failed to apply referral code" })
  }
})

// Get referral statistics and history
router.get("/stats", auth, async (req, res) => {
  try {
    const referral = await Referral.findOne({ referrer: req.user.id })
      .populate("referred.user", "name email avatar createdAt")
    
    if (!referral) {
      return res.status(404).json({ message: "No referral found" })
    }

    // Calculate statistics
    const stats = {
      totalReferred: referral.referred.length,
      pendingReferrals: referral.referred.filter(r => r.status === "pending").length,
      completedReferrals: referral.referred.filter(r => r.status === "completed").length,
      totalRewardsEarned: referral.totalRewardsEarned,
      referralHistory: referral.referred.map(ref => ({
        user: {
          name: ref.user.name,
          email: ref.user.email,
          avatar: ref.user.avatar,
        },
        joinedAt: ref.joinedAt,
        status: ref.status,
        reward: ref.reward
      }))
    }

    res.json(stats)
  } catch (error) {
    res.status(500).json({ message: "Failed to get referral statistics" })
  }
})

module.exports = router