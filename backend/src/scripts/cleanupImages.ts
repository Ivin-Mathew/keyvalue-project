import dotenv from 'dotenv';
import { initializeFirebase, collections } from '../services/firebase';

// Load environment variables
dotenv.config();

const cleanupImages = async () => {
  try {
    console.log('🧹 Starting image cleanup...');

    // Initialize Firebase
    initializeFirebase();

    // Get all food items
    const foodItemsSnapshot = await collections.foodItems().get();
    
    let updatedCount = 0;
    const batch = collections.foodItems().firestore.batch();

    foodItemsSnapshot.docs.forEach(doc => {
      const data = doc.data();
      
      // Check if the imageUrl contains unsplash
      if (data.imageUrl && data.imageUrl.includes('unsplash.com')) {
        console.log(`🔄 Updating ${data.name} - removing Unsplash URL`);
        
        // Update the document to use placeholder image
        batch.update(doc.ref, {
          imageUrl: '/images/placeholder-food.svg',
          updatedAt: new Date()
        });
        
        updatedCount++;
      }
    });

    if (updatedCount > 0) {
      await batch.commit();
      console.log(`✅ Updated ${updatedCount} food items with placeholder images`);
    } else {
      console.log('✅ No food items with Unsplash URLs found');
    }

    console.log('🎉 Image cleanup completed successfully!');

  } catch (error) {
    console.error('❌ Image cleanup failed:', error);
    process.exit(1);
  }
};

// Run the cleanup
cleanupImages();
