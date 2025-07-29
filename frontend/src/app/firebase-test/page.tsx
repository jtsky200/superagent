'use client';

import dynamic from 'next/dynamic';

// Dynamically import Firebase to avoid SSR issues
const FirebaseTestComponent = dynamic(() => import('../../components/FirebaseTestComponent'), {
  ssr: false,
  loading: () => <div>Loading Firebase test...</div>
});

export default function FirebaseTest() {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">
          Firebase Connection Test
        </h1>
        
        <FirebaseTestComponent />
      </div>
    </div>
  );
} 