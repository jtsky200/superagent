-- Swiss Cantons Seed Data
-- Based on real Swiss motor vehicle tax data and EV incentives

INSERT INTO cantons (
    name, 
    abbreviation, 
    vehicle_tax_calculation_method,
    vehicle_tax_factor_power,
    vehicle_tax_factor_weight,
    vehicle_tax_base_fee,
    ev_tax_discount,
    ev_tax_discount_years,
    registration_fee,
    license_plate_fee,
    average_electricity_price_per_kwh
) VALUES
-- Zürich - 100% EV discount for 8 years
('Zürich', 'ZH', 'COMBINED', 1.5, 0.05, 0, 100, 8, 50, 25, 0.21),

-- Bern - 90% EV discount for 5 years
('Bern', 'BE', 'WEIGHT', 0, 0.11, 0, 90, 5, 45, 30, 0.19),

-- Luzern - 50% EV discount permanent
('Luzern', 'LU', 'POWER', 2.32, 0, 0, 50, NULL, 40, 25, 0.18),

-- Basel-Stadt - 100% EV discount for 5 years
('Basel-Stadt', 'BS', 'COMBINED', 1.5, 0.05, 0, 100, 5, 55, 35, 0.22),

-- Basel-Landschaft - 75% EV discount permanent
('Basel-Landschaft', 'BL', 'COMBINED', 1.4, 0.06, 0, 75, NULL, 45, 30, 0.20),

-- Genf - 75% EV discount permanent
('Genf', 'GE', 'COMBINED', 1.2, 0.08, 0, 75, NULL, 60, 40, 0.20),

-- Waadt - 80% EV discount permanent
('Waadt', 'VD', 'COMBINED', 1.4, 0.07, 0, 80, NULL, 50, 30, 0.19),

-- Tessin - 50% EV discount permanent
('Tessin', 'TI', 'COMBINED', 1.8, 0.06, 0, 50, NULL, 35, 20, 0.17),

-- St. Gallen - 60% EV discount permanent
('St. Gallen', 'SG', 'POWER', 2.0, 0, 0, 60, NULL, 40, 25, 0.18),

-- Aargau - 50% EV discount for 3 years
('Aargau', 'AG', 'COMBINED', 1.6, 0.04, 0, 50, 3, 45, 25, 0.19),

-- Freiburg - 70% EV discount permanent
('Freiburg', 'FR', 'WEIGHT', 0, 0.12, 0, 70, NULL, 40, 25, 0.18),

-- Solothurn - 60% EV discount permanent
('Solothurn', 'SO', 'COMBINED', 1.5, 0.05, 0, 60, NULL, 40, 25, 0.19),

-- Schaffhausen - 80% EV discount for 5 years
('Schaffhausen', 'SH', 'POWER', 2.1, 0, 0, 80, 5, 35, 20, 0.18),

-- Appenzell Ausserrhoden - 40% EV discount permanent
('Appenzell Ausserrhoden', 'AR', 'FLAT_RATE', 0, 0, 300, 40, NULL, 30, 20, 0.17),

-- Appenzell Innerrhoden - 40% EV discount permanent
('Appenzell Innerrhoden', 'AI', 'FLAT_RATE', 0, 0, 250, 40, NULL, 30, 20, 0.17),

-- Thurgau - 55% EV discount permanent
('Thurgau', 'TG', 'COMBINED', 1.7, 0.04, 0, 55, NULL, 35, 25, 0.18),

-- Graubünden - 30% EV discount permanent
('Graubünden', 'GR', 'POWER', 2.5, 0, 0, 30, NULL, 40, 25, 0.16),

-- Neuenburg - 85% EV discount for 5 years
('Neuenburg', 'NE', 'COMBINED', 1.3, 0.07, 0, 85, 5, 45, 30, 0.19),

-- Jura - 70% EV discount permanent
('Jura', 'JU', 'WEIGHT', 0, 0.10, 0, 70, NULL, 35, 25, 0.18),

-- Wallis - 60% EV discount permanent
('Wallis', 'VS', 'COMBINED', 1.6, 0.05, 0, 60, NULL, 40, 25, 0.17),

-- Zug - 90% EV discount for 5 years
('Zug', 'ZG', 'COMBINED', 1.2, 0.06, 0, 90, 5, 60, 35, 0.20),

-- Schwyz - 50% EV discount permanent
('Schwyz', 'SZ', 'COMBINED', 1.8, 0.04, 0, 50, NULL, 35, 25, 0.18),

-- Nidwalden - 60% EV discount permanent
('Nidwalden', 'NW', 'FLAT_RATE', 0, 0, 400, 60, NULL, 30, 20, 0.17),

-- Obwalden - 60% EV discount permanent
('Obwalden', 'OW', 'FLAT_RATE', 0, 0, 350, 60, NULL, 30, 20, 0.17),

-- Uri - 50% EV discount permanent
('Uri', 'UR', 'FLAT_RATE', 0, 0, 300, 50, NULL, 30, 20, 0.16),

-- Glarus - 70% EV discount permanent
('Glarus', 'GL', 'COMBINED', 1.9, 0.03, 0, 70, NULL, 35, 25, 0.17);

-- Update timestamps
UPDATE cantons SET created_at = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP;

