'use client';

import { useEffect, useState } from 'react';
import { db, auth, analytics } from '../lib/firebase';
import { collection, getDocs } from 'firebase/firestore';

export default function FirebaseTestComponent() {
  const [status, setStatus] = useState<string>('Testing Firebase connection...');
  const [collections, setCollections] = useState<string[]>([]);

  useEffect(() => {
    const testFirebase = async () => {
      try {
        // Test Firestore connection
        await getDocs(collection(db, 'test'));
        setStatus('✅ Firebase connection successful!');
        
        // Get list of collections (this is just for testing)
        console.log('Firebase initialized successfully');
        console.log('Auth:', auth);
        console.log('Analytics:', analytics);
        
        setCollections(['test', 'customers', 'vehicles']);
      } catch (error) {
        console.error('Firebase connection error:', error);
        setStatus('❌ Firebase connection failed: ' + (error as Error).message);
        setCollections([]);
      }
    };

    testFirebase();
  }, []);

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-xl font-semibold mb-4">Connection Status</h2>
      <p className="text-lg mb-4">{status}</p>
      
      {collections.length > 0 && (
        <div>
          <h3 className="text-lg font-medium mb-2">Available Collections:</h3>
          <ul className="list-disc list-inside space-y-1">
            {collections.map((collection, index) => (
              <li key={index} className="text-gray-700">{collection}</li>
            ))}
          </ul>
        </div>
      )}
      
      <div className="mt-6 p-4 bg-blue-50 rounded-md">
        <p className="text-sm font-medium text-blue-700">Firebase Services:</p>
        <ul className="text-sm text-blue-900 mt-2 space-y-1">
          <li>✅ Firestore Database</li>
          <li>✅ Authentication</li>
          <li>✅ Analytics</li>
          <li>✅ Storage</li>
        </ul>
      </div>
      
      <div className="mt-4 p-4 bg-green-50 rounded-md">
        <p className="text-sm font-medium text-green-700">Project Info:</p>
        <ul className="text-sm text-green-900 mt-2 space-y-1">
          <li>Project ID: superagent-ff2fe</li>
          <li>Auth Domain: superagent-ff2fe.firebaseapp.com</li>
          <li>Storage Bucket: superagent-ff2fe.firebasestorage.app</li>
        </ul>
      </div>
    </div>
  );
} 