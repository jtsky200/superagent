#!/bin/bash
# Firestore Setup for CADILLAC EV CIS

echo "Setting up Firestore collections..."

# Create collections and indexes
firebase firestore:indexes

# Deploy Firestore rules
firebase deploy --only firestore

echo "Firestore setup complete!"
