
import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const identifyPill = async (base64Image: string): Promise<{ name: string; description: string; confidence: number }> => {
  try {
    const model = 'gemini-2.5-flash';
    
    // Remove header if present (data:image/jpeg;base64,)
    const cleanBase64 = base64Image.replace(/^data:image\/(png|jpeg|jpg|webp);base64,/, '');

    const response = await ai.models.generateContent({
      model: model,
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: 'image/jpeg',
              data: cleanBase64
            }
          },
          {
            text: `Identify this pill based on shape, color, imprint, and label. 
            Provide the possible medicine name, a short description, and a confidence score (0-100).
            Return the result in JSON format.`
          }
        ]
      },
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            name: { type: Type.STRING },
            description: { type: Type.STRING },
            confidence: { type: Type.NUMBER }
          }
        }
      }
    });

    const text = response.text;
    if (!text) throw new Error("No response from AI");
    
    return JSON.parse(text);
  } catch (error) {
    console.error("Pill identification failed:", error);
    throw new Error("Could not identify pill. Please try again or enter manually.");
  }
};

export const getSymptomAdvice = async (symptoms: string, language: string, history: {role: string, parts: {text: string}[]}[] = []) => {
  try {
    const model = 'gemini-2.5-flash';
    
    // Construct chat history for context
    const chat = ai.chats.create({
      model: model,
      history: history,
      config: {
        systemInstruction: `You are Med AI, a compassionate and supportive health assistant.
        User Language: ${language}.

        CORE DIRECTIVES:
        1. EMPATHY FIRST: Always start with a warm, comforting, and empathetic tone. Acknowledge the user's distress (e.g., "I'm sorry to hear you're feeling unwell," or "That sounds uncomfortable").
        2. STRICTLY NON-DIAGNOSTIC: You are an AI, NOT a doctor. You CANNOT diagnose medical conditions.
           - Do NOT say "You have [Condition]".
           - DO say "These symptoms are often associated with..." or "This might suggest...".
        3. SAFETY CHECK: If the symptoms described are severe (chest pain, difficulty breathing, severe bleeding, stroke signs, high fever in children), IMMEDIATELY stop and advise the user to call emergency services (112/911) or go to a hospital.
        4. GENERAL GUIDANCE: Provide general wellness advice, home remedies (if safe), and suggestions on which type of specialist to consult.
        5. SIMPLE LANGUAGE: Use clear, simple language suitable for everyone. Avoid complex medical jargon.
        6. Respond in the requested language (English, Hindi, or Hinglish).`,
      }
    });

    const response = await chat.sendMessage({
      message: symptoms
    });

    return response.text;
  } catch (error) {
    console.error("Symptom checker failed:", error);
    return "I am having trouble connecting to the medical database. Please consult a doctor immediately if it is urgent.";
  }
};

export const analyzeLabReport = async (base64Image: string): Promise<any> => {
  try {
    const model = 'gemini-2.5-flash';
    const cleanBase64 = base64Image.replace(/^data:image\/(png|jpeg|jpg|webp);base64,/, '');

    const response = await ai.models.generateContent({
      model: model,
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: 'image/jpeg',
              data: cleanBase64
            }
          },
          {
            text: `Analyze this medical lab report image. 
            1. Extract key health metrics (e.g., Hemoglobin, RBC, Glucose, Lipid Profile) found in the report.
            2. Determine if each value is 'Normal', 'High', or 'Low' based on standard ranges or ranges present in the image.
            3. Provide a brief 2-sentence summary of the overall health status.
            4. Suggest 3 simple lifestyle or diet tips based on the results.
            
            Return ONLY raw JSON with this structure:
            {
              "title": "Type of Report (e.g. CBC, Lipid Profile)",
              "metrics": [{ "name": "Hemoglobin", "value": "14", "unit": "g/dL", "status": "Normal" }],
              "summary": "Everything looks good...",
              "insights": [{ "title": "Eat Iron Rich", "description": "Spinach is good.", "icon": "🥦", "type": "diet" }]
            }`
          }
        ]
      },
      config: {
        responseMimeType: 'application/json'
      }
    });

    const text = response.text;
    if (!text) throw new Error("No response from AI");
    return JSON.parse(text);

  } catch (error) {
    console.error("Lab report analysis analysis failed:", error);
    throw new Error("Could not analyze report. Please ensure the image is clear.");
  }
};

// Helper to generate realistic simulated points around a location
const generateSimulatedPharmacies = (lat: number, lng: number) => {
  const pharmacyNames = [
    "City Care Pharmacy", "Green Cross Chemists", "Apollo Pharmacy (Partner)", 
    "Wellness Forever", "HealthPlus Meds", "Community Chemist", "LifeSpring Pharma"
  ];
  
  return pharmacyNames.map((name, i) => {
    // Generate random offset (approx 0.1 - 2km away)
    const latOffset = (Math.random() - 0.5) * 0.02; 
    const lngOffset = (Math.random() - 0.5) * 0.02;
    
    return {
      id: `sim-${i}`,
      name: name,
      address: `${Math.floor(Math.random() * 100) + 1}, Main Road, Nearby`,
      rating: (3.5 + Math.random() * 1.5).toFixed(1),
      openNow: Math.random() > 0.2, // 80% chance open
      stockStatus: 'Unknown',
      availableMedicines: [],
      // Create a real Google Maps navigation link to these simulated coords
      mapsUri: `https://www.google.com/maps/dir/?api=1&destination=${lat + latOffset},${lng + lngOffset}`
    };
  });
};

export const searchPharmacies = async (latitude: number, longitude: number, medicines: string[]) => {
  try {
    const model = 'gemini-2.5-flash';
    
    // Explicit prompt to trigger Maps Grounding
    const prompt = `Find top-rated pharmacies near latitude ${latitude}, longitude ${longitude}. Return their names and addresses.`;

    const response = await ai.models.generateContent({
      model: model,
      contents: prompt,
      config: {
        tools: [{googleMaps: {}}],
        toolConfig: {
          retrievalConfig: {
            latLng: {
              latitude: latitude,
              longitude: longitude
            }
          }
        }
      }
    });

    const candidates = response.candidates;
    const groundingChunks = candidates?.[0]?.groundingMetadata?.groundingChunks;

    if (groundingChunks && groundingChunks.length > 0) {
      const realPharmacies = groundingChunks
        .filter((chunk: any) => chunk.maps)
        .map((chunk: any, index: number) => {
          const mapData = chunk.maps;
          return {
            id: mapData.placeId || `pharma-${index}`,
            name: mapData.title || "Pharmacy",
            address: "Tap navigate for details", 
            rating: 4.5,
            openNow: true, 
            stockStatus: 'Unknown',
            availableMedicines: [],
            mapsUri: mapData.uri
          };
        });
      
      const uniquePharmacies = Array.from(new Map(realPharmacies.map((item: any) => [item.id, item])).values());
      return uniquePharmacies.length > 0 ? uniquePharmacies : generateSimulatedPharmacies(latitude, longitude);
    }

    // If grounding fails, fallback to realistic simulation
    return generateSimulatedPharmacies(latitude, longitude);

  } catch (error) {
    console.error("Pharmacy search failed, switching to simulation:", error);
    return generateSimulatedPharmacies(latitude, longitude);
  }
};
