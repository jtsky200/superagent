-- Vehicle Options Seed Data
-- Common options available for CADILLAC EV models

INSERT INTO vehicle_options (
    name,
    description,
    price_chf,
    category,
    is_active
) VALUES

-- EXTERIOR OPTIONS
('Panorama-Glasdach', 'Elektrisch öffnbares Panorama-Glasdach mit Sonnenschutz', 2500.00, 'exterior', true),
('20" Leichtmetallfelgen', 'Exklusive 20-Zoll Leichtmetallfelgen in Schwarz glänzend', 1800.00, 'exterior', true),
('21" Leichtmetallfelgen', 'Premium 21-Zoll Leichtmetallfelgen in Silber', 2400.00, 'exterior', true),
('22" Leichtmetallfelgen', 'Sport 22-Zoll Leichtmetallfelgen in Anthrazit', 3200.00, 'exterior', true),
('Metallic-Lackierung', 'Hochwertige Metallic-Lackierung in verschiedenen Farben', 1200.00, 'exterior', true),
('Perleffekt-Lackierung', 'Exklusive Perleffekt-Lackierung', 2000.00, 'exterior', true),
('LED-Matrix-Scheinwerfer', 'Adaptive LED-Matrix-Scheinwerfer mit Tagfahrlicht', 1500.00, 'exterior', true),
('Anhängerkupplung', 'Elektrisch schwenkbare Anhängerkupplung', 1800.00, 'exterior', true),

-- INTERIOR OPTIONS
('Leder-Ausstattung Premium', 'Volleder-Ausstattung in Premium-Qualität', 3500.00, 'interior', true),
('Leder-Ausstattung Luxury', 'Exklusive Leder-Ausstattung mit Perforation', 5000.00, 'interior', true),
('Massagesitze vorne', 'Elektrische Massagefunktion für Vordersitze', 2200.00, 'interior', true),
('Belüftete Sitze', 'Belüftete Vorder- und Rücksitze', 1800.00, 'interior', true),
('Sitzheizung hinten', 'Sitzheizung für die Rücksitze', 800.00, 'interior', true),
('Ambientebeleuchtung', '64-Farben Ambientebeleuchtung im Innenraum', 1200.00, 'interior', true),
('Head-Up Display', 'Farbiges Head-Up Display mit Augmented Reality', 1500.00, 'interior', true),
('Wireless Charging', 'Induktive Ladestation für Smartphones', 600.00, 'interior', true),

-- TECHNOLOGY OPTIONS
('Super Cruise', 'Halbautonomes Fahrsystem für Autobahnen', 3500.00, 'technology', true),
('Enhanced Autopilot', 'Erweiterte Autopilot-Funktionen', 2800.00, 'technology', true),
('360° Kamera-System', 'Rundum-Kamera-System mit Vogelperspektive', 1200.00, 'technology', true),
('Nachtsicht-Assistent', 'Infrarot-Nachtsicht mit Fußgänger-Erkennung', 2000.00, 'technology', true),
('Digitaler Rückspiegel', 'Kamera-basierter digitaler Rückspiegel', 800.00, 'technology', true),
('Smartphone-Integration Plus', 'Erweiterte Apple CarPlay und Android Auto Integration', 500.00, 'technology', true),
('OTA-Updates Premium', 'Premium Over-the-Air Software-Updates', 1000.00, 'technology', true),

-- PERFORMANCE OPTIONS
('Adaptive Luftfederung', 'Adaptive Luftfederung mit verschiedenen Fahrmodi', 2800.00, 'performance', true),
('Sport-Fahrwerk', 'Sportlich abgestimmtes Fahrwerk', 1500.00, 'performance', true),
('Brembo-Bremsen', 'Hochleistungs-Bremssystem von Brembo', 2200.00, 'performance', true),
('Torque Vectoring', 'Elektronisches Torque Vectoring System', 1800.00, 'performance', true),
('Launch Control', 'Launch Control für optimale Beschleunigung', 800.00, 'performance', true),
('Track Mode', 'Rennstrecken-Modus mit Performance-Optimierung', 1200.00, 'performance', true),

-- SAFETY OPTIONS
('Adaptive Cruise Control', 'Adaptiver Tempomat mit Stop&Go-Funktion', 1500.00, 'safety', true),
('Spurhalte-Assistent Plus', 'Erweiterter Spurhalte-Assistent mit Lenkunterstützung', 1200.00, 'safety', true),
('Totwinkel-Assistent', 'Totwinkel-Überwachung mit Spurwechsel-Assistent', 800.00, 'safety', true),
('Verkehrszeichen-Erkennung', 'Automatische Verkehrszeichen-Erkennung', 600.00, 'safety', true),
('Notbrems-Assistent', 'Automatischer Notbrems-Assistent mit Fußgänger-Erkennung', 1000.00, 'safety', true),
('Müdigkeits-Erkennung', 'Fahrer-Müdigkeits-Erkennungssystem', 500.00, 'safety', true),

-- COMFORT OPTIONS
('Klimaautomatik 4-Zonen', '4-Zonen Klimaautomatik mit individueller Regelung', 1800.00, 'comfort', true),
('Luftreinigungssystem', 'HEPA-Luftfilter mit Ionisierung', 1200.00, 'comfort', true),
('Elektrische Heckklappe', 'Elektrisch öffnende Heckklappe mit Sensor', 1000.00, 'comfort', true),
('Memory-Sitze', 'Memory-Funktion für Fahrer- und Beifahrersitz', 800.00, 'comfort', true),
('Beheiztes Lenkrad', 'Lenkradheizung für kalte Tage', 400.00, 'comfort', true),
('Sonnenschutz hinten', 'Elektrische Sonnenschutz-Rollos für Rücksitze', 600.00, 'comfort', true),
('Premium-Soundsystem', 'AKG Premium-Soundsystem mit 19 Lautsprechern', 2500.00, 'comfort', true),
('Bose-Soundsystem', 'Bose Performance Series Soundsystem', 3500.00, 'comfort', true);

-- Update timestamps
UPDATE vehicle_options SET created_at = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP;

