#!/usr/bin/env node

// Environment Check Script
console.log('=== Environment Configuration Check ===\n')

// Check Node.js version
console.log('Node.js Version:', process.version)
console.log('Environment:', process.env.NODE_ENV || 'development')

// Check if running from client or server directory
const isClient = process.cwd().includes('client')
const isServer = process.cwd().includes('server')

if (isClient) {
  console.log('\n📱 Client Environment Variables:')
  console.log('VITE_API_URL:', process.env.VITE_API_URL || 'Not set')
  console.log('VITE_BACKEND_URL:', process.env.VITE_BACKEND_URL || 'Not set')
  console.log('VITE_APP_NAME:', process.env.VITE_APP_NAME || 'Not set')
  console.log('VITE_RAZORPAY_KEY_ID:', process.env.VITE_RAZORPAY_KEY_ID ? 'Set' : 'Not set')
} else if (isServer) {
  console.log('\n🖥️  Server Environment Variables:')
  console.log('PORT:', process.env.PORT || 'Not set (will default to 2000)')
  console.log('MONGODB_URI:', process.env.MONGODB_URI ? 'Set' : 'Not set')
  console.log('JWT_SECRET:', process.env.JWT_SECRET ? 'Set' : 'Not set')
  console.log('CLIENT_URL:', process.env.CLIENT_URL || 'Not set')
  console.log('RAZORPAY_KEY_ID:', process.env.RAZORPAY_KEY_ID ? 'Set' : 'Not set')
}

console.log('\n✅ Environment check completed!')

// Check for common issues
const warnings = []

if (isClient) {
  if (!process.env.VITE_API_URL && !process.env.VITE_BACKEND_URL) {
    warnings.push('❌ No API URL configured for client')
  }
}

if (isServer) {
  if (!process.env.MONGODB_URI) {
    warnings.push('❌ No MongoDB URI configured')
  }
  if (!process.env.JWT_SECRET) {
    warnings.push('❌ No JWT secret configured')
  }
}

if (warnings.length > 0) {
  console.log('\n⚠️  Warnings:')
  warnings.forEach(warning => console.log(warning))
} else {
  console.log('\n🎉 All required environment variables appear to be set!')
}