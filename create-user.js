require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/user.model');

const MONGODB_URI = process.env.MONGODB_URI;

const createUsers = async () => {
  try {
    console.log('🔗 Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');

    // Clear existing users
    console.log('🗑️  Clearing existing users...');
    await User.deleteMany({});
    console.log('✅ Cleared existing users\n');

    // Create admin
    console.log('👤 Creating users...');
    const admin = new User({
      name: 'Admin User',
      email: 'admin@test.com',
      password: 'pass123',
      role: 'admin',
      isActive: true
    });
    await admin.save();
    console.log('✅ Admin: admin@test.com / pass123');

    // Create institution
    const institution = new User({
      name: 'Test University',
      email: 'institution@test.com',
      password: 'pass123',
      role: 'institution',
      isActive: true
    });
    await institution.save();
    console.log('✅ Institution: institution@test.com / pass123');

    // Create student
    const student = new User({
      name: 'John Student',
      email: 'student@test.com',
      password: 'pass123',
      role: 'student',
      isActive: true
    });
    await student.save();
    console.log('✅ Student: student@test.com / pass123');

    console.log('\n' + '='.repeat(50));
    console.log('🎉 ALL TEST USERS CREATED SUCCESSFULLY!');
    console.log('='.repeat(50));
    console.log('\nYou can now login with:');
    console.log('  • admin@test.com / pass123');
    console.log('  • institution@test.com / pass123');
    console.log('  • student@test.com / pass123');
    console.log('='.repeat(50) + '\n');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
};

createUsers();