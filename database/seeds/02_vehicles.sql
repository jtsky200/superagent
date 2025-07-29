-- CADILLAC EV Models Seed Data
-- Based on official Swiss market specifications and pricing

INSERT INTO vehicles (
    model_name,
    model_year,
    model_variant,
    battery_capacity_kwh,
    wltp_range_km,
    power_kw,
    power_ps,
    torque_nm,
    weight_kg,
    base_price_chf,
    energy_consumption_kwh_100km,
    charging_power_ac_kw,
    charging_power_dc_kw,
    acceleration_0_100_sec,
    top_speed_kmh,
    cargo_capacity_liters,
    is_active
) VALUES
-- CADILLAC LYRIQ Luxury
(
    'CADILLAC LYRIQ',
    2024,
    'Luxury',
    100.0,
    502,
    250,
    340,
    440,
    2235,
    82900.00,
    19.8,
    11.5,
    190.0,
    6.0,
    190,
    793,
    true
),

-- CADILLAC LYRIQ Premium
(
    'CADILLAC LYRIQ',
    2024,
    'Premium',
    100.0,
    500,
    250,
    340,
    440,
    2245,
    89900.00,
    20.0,
    11.5,
    190.0,
    6.0,
    190,
    793,
    true
),

-- CADILLAC LYRIQ Sport
(
    'CADILLAC LYRIQ',
    2024,
    'Sport',
    100.0,
    495,
    280,
    380,
    460,
    2255,
    96900.00,
    20.2,
    11.5,
    190.0,
    5.7,
    200,
    793,
    true
),

-- CADILLAC CELESTIQ
(
    'CADILLAC CELESTIQ',
    2024,
    'Standard',
    111.0,
    480,
    447,
    608,
    785,
    2745,
    340000.00,
    23.1,
    11.5,
    200.0,
    3.8,
    250,
    410,
    true
),

-- CADILLAC OPTIQ
(
    'CADILLAC OPTIQ',
    2024,
    'Standard',
    85.0,
    480,
    220,
    299,
    365,
    2050,
    72900.00,
    17.7,
    11.5,
    150.0,
    7.0,
    180,
    635,
    true
),

-- CADILLAC ESCALADE IQ
(
    'CADILLAC ESCALADE IQ',
    2024,
    'Standard',
    200.0,
    724,
    560,
    762,
    1064,
    4103,
    179000.00,
    27.6,
    19.2,
    350.0,
    4.9,
    200,
    3374,
    true
);

-- Update timestamps
UPDATE vehicles SET created_at = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP;

