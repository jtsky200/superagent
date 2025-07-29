import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import * as express from 'express';
import * as cors from 'cors';
import { OpenAI } from 'openai';

// Initialize Firebase Admin
admin.initializeApp();

const db = admin.firestore();
const app = express();

// Middleware
app.use(cors({ origin: true }));
app.use(express.json());

// Initialize OpenAI
const openai = new OpenAI({
  apiKey: functions.config().openai?.key || process.env.OPENAI_API_KEY,
});

// AI Analysis Function
app.post('/analyze-customer', async (req, res) => {
  try {
    const { customer, vehicle_preferences } = req.body;

    if (!customer || !vehicle_preferences) {
      return res.status(400).json({ error: 'Missing required data' });
    }

    const prompt = `
    Analyze this customer profile for CADILLAC EV recommendations in Switzerland:
    
    CUSTOMER PROFILE:
    - Name: ${customer.firstName || ''} ${customer.lastName || ''}
    - Type: ${customer.customerType || ''}
    - Location: ${customer.city || ''}, ${customer.canton || ''}
    - Age: ${customer.age || 'N/A'}
    
    VEHICLE PREFERENCES:
    - Budget Range: ${vehicle_preferences.budget_min || 'N/A'} - ${vehicle_preferences.budget_max || 'N/A'} CHF
    - Usage: ${vehicle_preferences.usage || 'N/A'}
    - Features: ${vehicle_preferences.features || []}
    
    Please provide recommendations for:
    1. Best CADILLAC EV model (LYRIQ or VISTIQ)
    2. Recommended options and packages
    3. Financing suggestions
    4. Key selling points for this customer
    
    Format as JSON with clear recommendations.
    `;

    const completion = await openai.chat.completions.create({
      model: "gpt-4-turbo-preview",
      messages: [
        {
          role: "system",
          content: "You are a CADILLAC EV sales consultant expert in the Swiss market. Provide detailed, professional analysis and recommendations."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      max_tokens: 2000,
      temperature: 0.7,
    });

    const analysis = completion.choices[0].message.content;

    // Save analysis to Firestore
    const analysisRef = await db.collection('customer_analyses').add({
      customerId: customer.id,
      analysis: analysis,
      customerData: customer,
      vehiclePreferences: vehicle_preferences,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      provider: 'openai',
      model: 'gpt-4-turbo-preview'
    });

    return res.json({
      success: true,
      analysis: analysis,
      analysisId: analysisRef.id
    });

  } catch (error) {
    console.error('Error in analyze-customer:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// TCO Calculation Function
app.post('/calculate-tco', async (req, res) => {
  try {
    const { customerId, vehicleId, canton, durationYears, annualKilometers } = req.body;

    // Get customer and vehicle data
    const customerDoc = await db.collection('customers').doc(customerId).get();
    const vehicleDoc = await db.collection('vehicles').doc(vehicleId).get();

    if (!customerDoc.exists || !vehicleDoc.exists) {
      return res.status(404).json({ error: 'Customer or vehicle not found' });
    }

    const vehicle = vehicleDoc.data();
    
    if (!vehicle) {
      return res.status(404).json({ error: 'Vehicle data not found' });
    }

    // Calculate TCO (simplified version)
    const basePrice = vehicle.basePriceChf || 85000;
    const vat = basePrice * 0.077; // 7.7% Swiss VAT
    const registrationFee = 200; // Simplified
    const annualTax = canton === 'ZH' ? 400 : 300; // Simplified canton-based tax
    const annualInsurance = 1200; // Simplified
    const annualMaintenance = 800; // Simplified
    const energyCostPerKm = 0.15; // CHF per km
    const annualEnergyCost = annualKilometers * energyCostPerKm;

    const oneTimeCosts = basePrice + vat + registrationFee;
    const annualCosts = annualTax + annualInsurance + annualMaintenance + annualEnergyCost;
    const totalCosts = oneTimeCosts + (annualCosts * durationYears);
    const monthlyCost = totalCosts / (durationYears * 12);
    const costPerKm = totalCosts / (durationYears * annualKilometers);

    const tcoCalculation = {
      customerId,
      vehicleId,
      canton,
      durationYears,
      annualKilometers,
      oneTimeCosts: {
        basePrice,
        vat,
        registrationFee,
        total: oneTimeCosts
      },
      annualCosts: {
        tax: annualTax,
        insurance: annualInsurance,
        maintenance: annualMaintenance,
        energy: annualEnergyCost,
        total: annualCosts
      },
      totalCosts,
      monthlyCost,
      costPerKm,
      calculationDate: admin.firestore.FieldValue.serverTimestamp()
    };

    // Save to Firestore
    const tcoRef = await db.collection('tco_calculations').add(tcoCalculation);

    return res.json({
      success: true,
      tcoCalculation: {
        ...tcoCalculation,
        id: tcoRef.id
      }
    });

  } catch (error) {
    console.error('Error in calculate-tco:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// Get Customer Analytics
app.get('/analytics/:customerId', async (req, res) => {
  try {
    const { customerId } = req.params;

    // Get customer analyses
    const analysesSnapshot = await db.collection('customer_analyses')
      .where('customerId', '==', customerId)
      .orderBy('createdAt', 'desc')
      .limit(5)
      .get();

    // Get TCO calculations
    const tcoSnapshot = await db.collection('tco_calculations')
      .where('customerId', '==', customerId)
      .orderBy('calculationDate', 'desc')
      .limit(5)
      .get();

    const analyses = analysesSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    const tcoCalculations = tcoSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    return res.json({
      success: true,
      analytics: {
        analyses,
        tcoCalculations,
        totalAnalyses: analyses.length,
        totalTcoCalculations: tcoCalculations.length
      }
    });

  } catch (error) {
    console.error('Error in analytics:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// Health check
app.get('/health', (req, res) => {
  return res.json({
    status: 'healthy',
    service: 'CADILLAC EV CIS Firebase Functions',
    timestamp: new Date().toISOString()
  });
});

// Export the Express app as a Firebase Function
export const api = functions.https.onRequest(app);

// Firestore triggers
export const onCustomerCreated = functions.firestore
  .document('customers/{customerId}')
  .onCreate(async (snap: functions.firestore.QueryDocumentSnapshot, context: functions.EventContext) => {
    const customerData = snap.data();
    console.log('New customer created:', customerData);
    
    // You can add additional logic here, like:
    // - Send welcome email
    // - Create initial analysis
    // - Add to marketing lists
  });

export const onTcoCalculationCreated = functions.firestore
  .document('tco_calculations/{calculationId}')
  .onCreate(async (snap: functions.firestore.QueryDocumentSnapshot, context: functions.EventContext) => {
    const tcoData = snap.data();
    console.log('New TCO calculation created:', tcoData);
    
    // You can add additional logic here, like:
    // - Send calculation summary to customer
    // - Update customer analytics
    // - Trigger follow-up actions
  }); 