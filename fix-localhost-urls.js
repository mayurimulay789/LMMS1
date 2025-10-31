#!/usr/bin/env node

// Script to fix all hardcoded localhost URLs in React components
const fs = require('fs');
const path = require('path');

const clientSrcPath = './client/src';

// Files that need to be updated
const filesToUpdate = [
  'Pages/PaymentModal.jsx',
  'Pages/PaymentFailedPage.jsx', 
  'Pages/LearnPage.jsx',
  'Pages/InstructorDashboardPage.jsx',
  'Pages/DashboardPage_updated.jsx',
  'Pages/DashboardPage_backup.jsx',
  'Pages/DashboardPage.jsx',
  'Pages/CourseDetailPage_backup.jsx'
];

console.log('🔧 Fixing hardcoded localhost URLs...\n');

filesToUpdate.forEach(filePath => {
  const fullPath = path.join(clientSrcPath, filePath);
  
  if (!fs.existsSync(fullPath)) {
    console.log(`⚠️  File not found: ${filePath}`);
    return;
  }
  
  try {
    let content = fs.readFileSync(fullPath, 'utf8');
    let modified = false;
    
    // Replace hardcoded localhost URLs with apiRequest calls
    const localhostRegex = /fetch\(\s*["`]http:\/\/localhost:2000\/api\/([^"`]+)["`]/g;
    
    if (content.match(localhostRegex)) {
      // Add apiRequest import if not present
      if (!content.includes('import { apiRequest }')) {
        const importLineRegex = /import.*from\s+["`].*["`]/;
        const importMatch = content.match(importLineRegex);
        if (importMatch) {
          const insertIndex = content.indexOf(importMatch[0]) + importMatch[0].length;
          content = content.slice(0, insertIndex) + 
                   '\nimport { apiRequest } from "../config/api"' + 
                   content.slice(insertIndex);
          modified = true;
        }
      }
      
      // Replace fetch calls with apiRequest
      content = content.replace(localhostRegex, (match, endpoint) => {
        modified = true;
        return `apiRequest("${endpoint}"`;
      });
      
      console.log(`✅ Updated: ${filePath}`);
    } else {
      console.log(`ℹ️  No changes needed: ${filePath}`);
    }
    
    if (modified) {
      fs.writeFileSync(fullPath, content, 'utf8');
    }
    
  } catch (error) {
    console.error(`❌ Error processing ${filePath}:`, error.message);
  }
});

console.log('\n🎉 URL fix completed!');
console.log('\n📋 Next steps:');
console.log('1. Build the client: npm run build:production');
console.log('2. Test the checkout page');
console.log('3. Deploy to production server');