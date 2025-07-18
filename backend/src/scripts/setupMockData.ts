import bcrypt from 'bcryptjs';
import { collections, firestoreHelpers } from '../services/firebase';

export const setupMockData = async () => {
  try {
    console.log('🚀 Setting up mock data for local testing...');

    // Create admin user
    console.log('👤 Creating admin user...');
    const adminPassword = await bcrypt.hash('admin123', 12);
    
    const adminRef = collections.users().doc('admin-user-id');
    await adminRef.set({
      email: 'admin@canteen.com',
      name: 'Admin User',
      password: adminPassword,
      role: 'admin',
      createdAt: firestoreHelpers.now()
    });

    console.log('✅ Admin user created: admin@canteen.com / admin123');

    // Create regular user
    console.log('👤 Creating regular user...');
    const userPassword = await bcrypt.hash('user123', 12);
    
    const userRef = collections.users().doc('regular-user-id');
    await userRef.set({
      email: 'user@canteen.com',
      name: 'John Doe',
      password: userPassword,
      role: 'user',
      createdAt: firestoreHelpers.now()
    });

    console.log('✅ Regular user created: user@canteen.com / user123');
    console.log('🎉 Mock data setup completed successfully!');

  } catch (error) {
    console.error('❌ Mock data setup failed:', error);
  }
};
