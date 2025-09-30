// seed.js
require('dotenv').config();  // Load .env at the very top
const mongoose = require('mongoose');

// Import your models
const User = require('./models/User'); 
;
const Product = require('./models/Product');

async function seed() {
  try {
    // Connect to MongoDB using MONGO_URI from .env
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log('MongoDB connected');

    // Optional: clear collections first
    await User.deleteMany();
    await Product.deleteMany();

    // Seed sample data
    const users = await User.create([
      { name: 'John Doe', email: 'john@example.com', password: '123456' },
      { name: 'Jane Doe', email: 'jane@example.com', password: '123456' }
    ]);

    const products = await Product.create([
      { name: 'Product 1', price: 100 },
      { name: 'Product 2', price: 200 }
    ]);

    console.log('Data seeded successfully!');
    mongoose.disconnect();
  } catch (err) {
    console.error('Seeding error:', err);
  }
}

seed();
