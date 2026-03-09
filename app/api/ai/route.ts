import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const { prompt } = await req.json();

    if (!prompt || typeof prompt !== 'string') {
      return NextResponse.json({ error: 'Invalid prompt' }, { status: 400 });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.error('[/api/ai] GEMINI_API_KEY is not set in .env.local');
      return NextResponse.json({ error: 'Gemini API key not configured' }, { status: 500 });
    }

    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 1024,
          },
        }),
      }
    );

    const data = await res.json();

    if (!res.ok) {
      console.error('[Gemini API error]', JSON.stringify(data));
      return NextResponse.json(
        { error: data?.error?.message ?? 'Gemini request failed' },
        { status: 502 }
      );
    }

    const result = data?.candidates?.[0]?.content?.parts?.[0]?.text ?? '';
    return NextResponse.json({ result });

  } catch (err) {
    console.error('[/api/ai] Unexpected error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}