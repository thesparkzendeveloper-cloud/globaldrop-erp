import mongoose from 'mongoose';
import dotenv from 'dotenv';
import dns from 'dns';

try {
  dns.setServers(['8.8.8.8', '1.1.1.1']);
} catch (e) {}

import { Order } from './models.js';

dotenv.config();
dotenv.config({ path: '../.env' });

const MONGODB_URI = process.env.MONGO_URI || process.env.MONGODB_URI;

async function fixOrderIds() {
  try {
    console.log('Connecting to MongoDB Atlas...');
    if (!MONGODB_URI) throw new Error('MONGO_URI is missing');
    await mongoose.connect(MONGODB_URI, { dbName: 'globalERP' });
    console.log('Connected to MongoDB Atlas.');

    const orders = await Order.find().sort({ createdAt: 1 });
    console.log(`Found ${orders.length} orders.`);

    for (let i = 0; i < orders.length; i++) {
      const order = orders[i];
      const newId = `Order No ${i + 1}`;
      console.log(`Updating order ${order._id} (old id: ${order.id}) -> new id: ${newId}`);
      await Order.findByIdAndUpdate(order._id, { id: newId });
    }

    console.log('✅ All order IDs updated to Order No 1, Order No 2 format successfully.');
    process.exit(0);
  } catch (err) {
    console.error('❌ Error updating order IDs:', err);
    process.exit(1);
  }
}

fixOrderIds();
