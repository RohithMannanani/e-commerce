const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const User = require('../models/User');

async function resetAdminPassword() {
  try {
    if (!process.env.MONGODB_URI) {
      throw new Error('MONGODB_URI is not defined in .env file');
    }

    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');
    
    const newPassword = 'admin@2004';
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    
    const result = await User.updateOne(
      { email: 'farmfoliomini@gmail.com' },
      { 
        $set: { 
          password: hashedPassword,
          role: 'admin'
        }
      }
    );

    if (result.modifiedCount > 0) {
      console.log('Admin password reset successfully');
    } else {
      console.log('Admin user not found');
    }

  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    if (mongoose.connection.readyState === 1) {
      await mongoose.disconnect();
      console.log('Disconnected from MongoDB');
    }
  }
}

resetAdminPassword();