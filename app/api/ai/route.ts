import { NextRequest, NextResponse } from 'next/server';
import { getAuth } from 'firebase-admin/auth';
import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { GoogleGenerativeAI } from "@google/generative-ai";

// Initialize Firebase Admin (server-side) once
if (!getApps().length) {
  initializeApp({
    credential: cert({
      projectId: process.env.FIREBASE_ADMIN_PROJECT_ID,
      clientEmail: process.env.FIREBASE_ADMIN_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_ADMIN_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    }),
  });
}
// ... (Firebase init stays the same)
export async function POST(req: NextRequest) {
  try {
    const { prompt } = await req.json();
    
    // Auth & Validation (Keep your existing Firebase code here)
    // ...

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
    
    // Aligning with your Python snippet: Using the 3.1 model
    const model = genAI.getGenerativeModel({ 
      model: "gemini-3.1-flash-lite-preview" 
    });

    const result = await model.generateContent({
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      generationConfig: {
        maxOutputTokens: 2000,
        temperature: 0.7,
      },
    });

    const response = await result.response;
    const text = response.text();

    return NextResponse.json({ result: text });

  } catch (err: any) {
    console.error(err);
    // Handle the Quota/429 specifically
    if (err.status === 429 || err.message?.includes('429')) {
      return NextResponse.json({ error: 'Quota exceeded. Please wait.' }, { status: 429 });
    }
    return NextResponse.json({ error: 'AI Error' }, { status: 500 });
  }
}