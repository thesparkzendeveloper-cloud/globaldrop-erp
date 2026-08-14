import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { Employee } from './models.js';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/globaldrop-erp';

async function diagnose() {
  try {
    console.log('Connecting to database...');
    await mongoose.connect(MONGODB_URI);
    console.log('Connected successfully.');

    const employees = await Employee.find();
    console.log(`\nFound ${employees.length} employees:`);
    
    employees.forEach((emp, index) => {
      console.log(`[${index + 1}] ID: "${emp.id}", Name: "${emp.name}", Email: "${emp.email}", Phone: "${emp.phone}", Role: "${emp.role}", Country: "${emp.country}", Branch: "${emp.branch}"`);
    });

    // Check for duplicates or missing crucial fields
    const phoneMap = new Map();
    const emailMap = new Map();
    const idMap = new Map();

    employees.forEach(emp => {
      if (emp.phone) {
        const count = phoneMap.get(emp.phone) || 0;
        phoneMap.set(emp.phone, count + 1);
      }
      if (emp.email) {
        const count = emailMap.get(emp.email) || 0;
        emailMap.set(emp.email, count + 1);
      }
      if (emp.id) {
        const count = idMap.get(emp.id) || 0;
        idMap.set(emp.id, count + 1);
      }
    });

    console.log('\n--- Duplicate Key Checks ---');
    let duplicatesFound = false;
    for (const [phone, count] of phoneMap.entries()) {
      if (count > 1) {
        console.warn(`⚠️ Duplicate Phone: "${phone}" appears ${count} times.`);
        duplicatesFound = true;
      }
    }
    for (const [email, count] of emailMap.entries()) {
      if (count > 1) {
        console.warn(`⚠️ Duplicate Email: "${email}" appears ${count} times.`);
        duplicatesFound = true;
      }
    }
    for (const [id, count] of idMap.entries()) {
      if (count > 1) {
        console.warn(`⚠️ Duplicate ID: "${id}" appears ${count} times.`);
        duplicatesFound = true;
      }
    }

    if (!duplicatesFound) {
      console.log('✅ No duplicates found.');
    }

  } catch (error) {
    console.error('Diagnosis failed:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\nDisconnected.');
  }
}

diagnose();
