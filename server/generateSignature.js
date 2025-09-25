import crypto from "crypto";

// Actual values from Razorpay checkout
const orderId = "order_RLR2XK6GfAgMNc";
const paymentId = "68d3e0cb1f20d68b1f629c81";
const keySecret = "04SiMIa51Ien9wvFRgJM1UP2";

// Using Buffer and HMAC to generate signature
const hmac = crypto.createHmac("sha256", Buffer.from(keySecret, "utf-8"));
hmac.update(`${orderId}|${paymentId}`);
const signature = hmac.digest("hex");

console.log("Razorpay Signature:", signature);
