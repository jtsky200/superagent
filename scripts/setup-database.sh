#!/bin/bash
# PostgreSQL Setup for CADILLAC EV CIS

echo "Setting up PostgreSQL database..."

# Create database
psql -h localhost -U postgres -d postgres -c "CREATE DATABASE cadillac_ev_cis;"

# Run migrations
cd backend && npm run migration:run

# Seed data
cd ../database/seeds && psql -h localhost -U postgres -d cadillac_ev_cis -f 01_cantons.sql
psql -h localhost -U postgres -d cadillac_ev_cis -f 02_vehicles.sql
psql -h localhost -U postgres -d cadillac_ev_cis -f 03_vehicle_options.sql
psql -h localhost -U postgres -d cadillac_ev_cis -f 04_users.sql

echo "Database setup complete!"
