#!/usr/bin/env node

/**
 * Firestore Seeding Script
 * Seeds the Firestore database with initial data for CADILLAC EV CIS
 */

const admin = require('firebase-admin');
const serviceAccount = require('../firebase-service-account.json');

// Initialize Firebase Admin
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

// Swiss Cantons Data
const cantons = [
  { id: 'ZH', name: 'Zürich', code: 'ZH' },
  { id: 'BE', name: 'Bern', code: 'BE' },
  { id: 'LU', name: 'Luzern', code: 'LU' },
  { id: 'UR', name: 'Uri', code: 'UR' },
  { id: 'SZ', name: 'Schwyz', code: 'SZ' },
  { id: 'OW', name: 'Obwalden', code: 'OW' },
  { id: 'NW', name: 'Nidwalden', code: 'NW' },
  { id: 'GL', name: 'Glarus', code: 'GL' },
  { id: 'ZG', name: 'Zug', code: 'ZG' },
  { id: 'FR', name: 'Freiburg', code: 'FR' },
  { id: 'SO', name: 'Solothurn', code: 'SO' },
  { id: 'BS', name: 'Basel-Stadt', code: 'BS' },
  { id: 'BL', name: 'Basel-Landschaft', code: 'BL' },
  { id: 'SH', name: 'Schaffhausen', code: 'SH' },
  { id: 'AR', name: 'Appenzell Ausserrhoden', code: 'AR' },
  { id: 'AI', name: 'Appenzell Innerrhoden', code: 'AI' },
  { id: 'SG', name: 'St. Gallen', code: 'SG' },
  { id: 'GR', name: 'Graubünden', code: 'GR' },
  { id: 'AG', name: 'Aargau', code: 'AG' },
  { id: 'TG', name: 'Thurgau', code: 'TG' },
  { id: 'TI', name: 'Tessin', code: 'TI' },
  { id: 'VD', name: 'Waadt', code: 'VD' },
  { id: 'VS', name: 'Wallis', code: 'VS' },
  { id: 'NE', name: 'Neuenburg', code: 'NE' },
  { id: 'GE', name: 'Genf', code: 'GE' },
  { id: 'JU', name: 'Jura', code: 'JU' }
];

// CADILLAC EV Models
const vehicles = [
  {
    id: 'lyriq-2024',
    name: 'CADILLAC LYRIQ',
    model: 'LYRIQ',
    year: 2024,
    type: 'SUV',
    category: 'Luxury Electric',
    basePriceChf: 82900,
    batteryCapacity: 100,
    rangeKm: 502,
    powerKw: 255,
    acceleration: 6.2,
    maxSpeed: 200,
    chargingTime: 10,
    features: [
      'Super Cruise',
      '33-inch LED Display',
      'AKG Studio Audio',
      'Panoramic Sunroof',
      'Wireless Charging'
    ],
    colors: [
      'Crystal White',
      'Stellar Black',
      'Argent Silver',
      'Satin Steel'
    ],
    images: [
      'https://example.com/lyriq-front.jpg',
      'https://example.com/lyriq-side.jpg',
      'https://example.com/lyriq-interior.jpg'
    ],
    description: 'Der CADILLAC LYRIQ kombiniert luxuriöses Design mit fortschrittlicher Elektrotechnologie für das Schweizer Markt.',
    available: true,
    createdAt: admin.firestore.FieldValue.serverTimestamp()
  },
  {
    id: 'vistiq-2024',
    name: 'CADILLAC VISTIQ',
    model: 'VISTIQ',
    year: 2024,
    type: 'SUV',
    category: 'Ultra Luxury Electric',
    basePriceChf: 120000,
    batteryCapacity: 120,
    rangeKm: 600,
    powerKw: 300,
    acceleration: 4.8,
    maxSpeed: 220,
    chargingTime: 12,
    features: [
      'Super Cruise Pro',
      '55-inch Curved Display',
      'AKG Studio Reference Audio',
      'Executive Seating',
      'Advanced Driver Assistance'
    ],
    colors: [
      'Crystal White',
      'Stellar Black',
      'Argent Silver',
      'Satin Steel',
      'Exclusive Blue'
    ],
    images: [
      'https://example.com/vistiq-front.jpg',
      'https://example.com/vistiq-side.jpg',
      'https://example.com/vistiq-interior.jpg'
    ],
    description: 'Der CADILLAC VISTIQ setzt neue Maßstäbe für Luxus-Elektrofahrzeuge in der Schweiz.',
    available: true,
    createdAt: admin.firestore.FieldValue.serverTimestamp()
  }
];

// Vehicle Options
const vehicleOptions = [
  {
    id: 'premium-package',
    name: 'Premium Package',
    description: 'Erweiterte Luxusausstattung mit Premium-Audio und erweiterten Assistenzsystemen',
    priceChf: 8500,
    category: 'Package',
    applicableModels: ['lyriq-2024', 'vistiq-2024'],
    features: [
      'AKG Studio Reference Audio System',
      'Panoramic Sunroof',
      'Ambient Lighting',
      'Heated/Cooled Seats'
    ]
  },
  {
    id: 'technology-package',
    name: 'Technology Package',
    description: 'Erweiterte Technologie-Features für maximale Konnektivität',
    priceChf: 6500,
    category: 'Package',
    applicableModels: ['lyriq-2024', 'vistiq-2024'],
    features: [
      'Super Cruise Driver Assistance',
      'Wireless Charging',
      '5G Connectivity',
      'Advanced Navigation'
    ]
  },
  {
    id: 'sport-package',
    name: 'Sport Package',
    description: 'Sportliche Ausstattung für dynamisches Fahrverhalten',
    priceChf: 7200,
    category: 'Package',
    applicableModels: ['lyriq-2024', 'vistiq-2024'],
    features: [
      'Sport Suspension',
      'Performance Brakes',
      'Sport Seats',
      'Sport Steering Wheel'
    ]
  }
];

// Sample Users
const users = [
  {
    id: 'admin-user',
    email: 'admin@cadillac-ev.ch',
    firstName: 'Admin',
    lastName: 'User',
    role: 'admin',
    phone: '+41 44 123 45 67',
    canton: 'ZH',
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
    lastLogin: admin.firestore.FieldValue.serverTimestamp()
  },
  {
    id: 'sales-user',
    email: 'sales@cadillac-ev.ch',
    firstName: 'Sales',
    lastName: 'Representative',
    role: 'sales',
    phone: '+41 44 123 45 68',
    canton: 'ZH',
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
    lastLogin: admin.firestore.FieldValue.serverTimestamp()
  }
];

async function seedCantons() {
  console.log('🌍 Seeding cantons...');
  const batch = db.batch();
  
  cantons.forEach(canton => {
    const docRef = db.collection('cantons').doc(canton.id);
    batch.set(docRef, canton);
  });
  
  await batch.commit();
  console.log(`✅ Seeded ${cantons.length} cantons`);
}

async function seedVehicles() {
  console.log('🚗 Seeding vehicles...');
  const batch = db.batch();
  
  vehicles.forEach(vehicle => {
    const docRef = db.collection('vehicles').doc(vehicle.id);
    batch.set(docRef, vehicle);
  });
  
  await batch.commit();
  console.log(`✅ Seeded ${vehicles.length} vehicles`);
}

async function seedVehicleOptions() {
  console.log('🔧 Seeding vehicle options...');
  const batch = db.batch();
  
  vehicleOptions.forEach(option => {
    const docRef = db.collection('vehicle_options').doc(option.id);
    batch.set(docRef, option);
  });
  
  await batch.commit();
  console.log(`✅ Seeded ${vehicleOptions.length} vehicle options`);
}

async function seedUsers() {
  console.log('👥 Seeding users...');
  const batch = db.batch();
  
  users.forEach(user => {
    const docRef = db.collection('users').doc(user.id);
    batch.set(docRef, user);
  });
  
  await batch.commit();
  console.log(`✅ Seeded ${users.length} users`);
}

async function main() {
  console.log('🚀 Starting Firestore seeding...');
  
  try {
    await seedCantons();
    await seedVehicles();
    await seedVehicleOptions();
    await seedUsers();
    
    console.log('🎉 Firestore seeding completed successfully!');
  } catch (error) {
    console.error('❌ Error during seeding:', error);
    process.exit(1);
  }
  
  process.exit(0);
}

// Run the seeding
if (require.main === module) {
  main();
}

module.exports = {
  seedCantons,
  seedVehicles,
  seedVehicleOptions,
  seedUsers
}; 