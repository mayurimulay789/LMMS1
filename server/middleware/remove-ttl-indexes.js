// remove-ttl-indexes.js
const mongoose = require('mongoose');
const User = require('./models/User');       // adjust path
const Referral = require('./models/Referral'); // adjust path

async function removeTTLIndexes() {
  await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/yourdb');

  // ---------- User collection ----------
  console.log('\n🔍 Checking User indexes...');
  const userIndexes = await User.collection.indexes();
  for (const idx of userIndexes) {
    if (idx.expireAfterSeconds) {
      console.log(`⚠️  Found TTL index: ${idx.name} (expires after ${idx.expireAfterSeconds}s). Dropping...`);
      await User.collection.dropIndex(idx.name);
      console.log(`✅ Dropped index ${idx.name}`);
    } else {
      console.log(`✅ Non‑TTL index: ${idx.name}`);
    }
  }

  // ---------- Referral collection ----------
  console.log('\n🔍 Checking Referral indexes...');
  const referralIndexes = await Referral.collection.indexes();
  for (const idx of referralIndexes) {
    if (idx.expireAfterSeconds) {
      console.log(`⚠️  Found TTL index: ${idx.name}. Dropping...`);
      await Referral.collection.dropIndex(idx.name);
      console.log(`✅ Dropped index ${idx.name}`);
    } else {
      console.log(`✅ Non‑TTL index: ${idx.name}`);
    }
  }

  await mongoose.disconnect();
  console.log('\n✅ All TTL indexes removed. Data will no longer be auto‑deleted.');
}

removeTTLIndexes().catch(err => {
  console.error('❌ Error:', err);
  process.exit(1);
});