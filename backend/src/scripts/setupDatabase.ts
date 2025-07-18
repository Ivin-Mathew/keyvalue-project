import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import { initializeFirebase, collections, firestoreHelpers } from '../services/firebase';

// Load environment variables
dotenv.config();

const setupDatabase = async () => {
  try {
    console.log('🚀 Starting database setup...');

    // Initialize Firebase
    initializeFirebase();

    // Create admin user
    console.log('👤 Creating admin user...');
    const adminPassword = await bcrypt.hash('admin123', 12);
    
    const adminRef = collections.users().doc();
    await adminRef.set({
      email: 'admin@canteen.com',
      name: 'Admin User',
      password: adminPassword,
      role: 'admin',
      createdAt: firestoreHelpers.now()
    });

    console.log('✅ Admin user created with email: admin@canteen.com, password: admin123');

    // Create sample food items
    console.log('🍽️ Creating sample food items...');
    
    const sampleFoodItems = [
      {
        name: 'Chicken Biryani',
        description: 'Aromatic basmati rice with tender chicken pieces and traditional spices',
        price: 120,
        category: 'lunch',
        totalCount: 50,
        remainingCount: 50,
        imageUrl: 'https://images.unsplash.com/photo-1563379091339-03246963d96c?w=400',
        isAvailable: true
      },
      {
        name: 'Vegetable Sandwich',
        description: 'Fresh vegetables with cheese and mayo in toasted bread',
        price: 60,
        category: 'snacks',
        totalCount: 30,
        remainingCount: 30,
        imageUrl: 'https://images.unsplash.com/photo-1553909489-cd47e0ef937f?w=400',
        isAvailable: true
      },
      {
        name: 'Masala Chai',
        description: 'Traditional Indian spiced tea with milk',
        price: 15,
        category: 'beverages',
        totalCount: 100,
        remainingCount: 100,
        imageUrl: 'https://images.unsplash.com/photo-1571934811356-5cc061b6821f?w=400',
        isAvailable: true
      },
      {
        name: 'Paneer Butter Masala',
        description: 'Creamy tomato-based curry with cottage cheese cubes',
        price: 100,
        category: 'lunch',
        totalCount: 25,
        remainingCount: 25,
        imageUrl: 'https://images.unsplash.com/photo-1631452180519-c014fe946bc7?w=400',
        isAvailable: true
      },
      {
        name: 'Samosa',
        description: 'Crispy fried pastry with spiced potato filling',
        price: 20,
        category: 'snacks',
        totalCount: 40,
        remainingCount: 40,
        imageUrl: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?w=400',
        isAvailable: true
      },
      {
        name: 'Fresh Lime Soda',
        description: 'Refreshing lime juice with soda water',
        price: 25,
        category: 'beverages',
        totalCount: 60,
        remainingCount: 60,
        imageUrl: 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?w=400',
        isAvailable: true
      },
      {
        name: 'Aloo Paratha',
        description: 'Stuffed flatbread with spiced potato filling, served with curd',
        price: 80,
        category: 'breakfast',
        totalCount: 20,
        remainingCount: 20,
        imageUrl: 'https://images.unsplash.com/photo-1606491956689-2ea866880c84?w=400',
        isAvailable: true
      },
      {
        name: 'Gulab Jamun',
        description: 'Sweet milk dumplings in sugar syrup',
        price: 40,
        category: 'desserts',
        totalCount: 35,
        remainingCount: 35,
        imageUrl: 'https://images.unsplash.com/photo-1571115764595-644a1f56a55c?w=400',
        isAvailable: true
      }
    ];

    const now = firestoreHelpers.now();
    
    for (const item of sampleFoodItems) {
      const foodItemRef = collections.foodItems().doc();
      await foodItemRef.set({
        ...item,
        createdAt: now,
        updatedAt: now
      });
    }

    console.log(`✅ Created ${sampleFoodItems.length} sample food items`);

    // Create a sample regular user
    console.log('👤 Creating sample user...');
    const userPassword = await bcrypt.hash('user123', 12);
    
    const userRef = collections.users().doc();
    await userRef.set({
      email: 'user@canteen.com',
      name: 'John Doe',
      password: userPassword,
      role: 'user',
      createdAt: firestoreHelpers.now()
    });

    console.log('✅ Sample user created with email: user@canteen.com, password: user123');

    console.log('🎉 Database setup completed successfully!');
    console.log('\n📋 Summary:');
    console.log('- Admin user: admin@canteen.com (password: admin123)');
    console.log('- Sample user: user@canteen.com (password: user123)');
    console.log(`- ${sampleFoodItems.length} food items created`);
    console.log('\n🚀 You can now start the backend server with: npm run dev');

  } catch (error) {
    console.error('❌ Database setup failed:', error);
    process.exit(1);
  }
};

// Run the setup
setupDatabase();
