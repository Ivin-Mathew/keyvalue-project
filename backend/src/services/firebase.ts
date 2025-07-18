import admin from 'firebase-admin';

let db: admin.firestore.Firestore;

export const initializeFirebase = () => {
  try {
    // Check if Firebase is already initialized
    if (admin.apps.length === 0) {
      const serviceAccount = {
        projectId: process.env.FIREBASE_PROJECT_ID,
        privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      };

      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount as admin.ServiceAccount),
        projectId: process.env.FIREBASE_PROJECT_ID,
      });

      console.log('✅ Firebase Admin initialized successfully');
    }

    db = admin.firestore();

    // Set Firestore settings
    db.settings({
      ignoreUndefinedProperties: true,
    });

  } catch (error) {
    console.error('❌ Error initializing Firebase:', error);
    process.exit(1);
  }
};

export const getFirestore = (): admin.firestore.Firestore => {
  if (!db) {
    throw new Error('Firestore not initialized. Call initializeFirebase() first.');
  }
  return db;
};

export const getAuth = (): admin.auth.Auth => {
  return admin.auth();
};

// Collection references
export const collections = {
  users: () => getFirestore().collection('users'),
  foodItems: () => getFirestore().collection('foodItems'),
  orders: () => getFirestore().collection('orders'),
};

// Helper functions for Firestore operations
export const firestoreHelpers = {
  // Convert Firestore timestamp to Date
  timestampToDate: (timestamp: admin.firestore.Timestamp): Date => {
    return timestamp.toDate();
  },

  // Convert Date to Firestore timestamp
  dateToTimestamp: (date: Date): admin.firestore.Timestamp => {
    return admin.firestore.Timestamp.fromDate(date);
  },

  // Get current timestamp
  now: (): admin.firestore.Timestamp => {
    return admin.firestore.Timestamp.now();
  },

  // Batch operations
  batch: () => getFirestore().batch(),

  // Transaction
  runTransaction: <T>(updateFunction: (transaction: admin.firestore.Transaction) => Promise<T>) => {
    return getFirestore().runTransaction(updateFunction);
  },
};
