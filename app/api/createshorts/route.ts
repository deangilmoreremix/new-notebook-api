import { NextResponse } from 'next/server';

const API_URL = process.env.NEXT_PUBLIC_API_URL;
const API_KEY = process.env.NEXT_PUBLIC_API_KEY;

export async function POST(request: Request) {
  if (!API_KEY) {
    return NextResponse.json({ error: 'API key not configured' }, { status: 500 });
  }

  try {
    const body = await request.json();
    const { audioUrl, prompt, avatar1, avatar2, callbackData } = body;

    if (!audioUrl) {
      return NextResponse.json({ error: 'Audio URL is required' }, { status: 400 });
    }

    const requestBody = {
      audioUrl,
      prompt,
      avatar1: avatar1 || 'M',
      avatar2: avatar2 || 'F',
      callbackData
    };

    console.log('Sending request to API:', requestBody);

    const response = await fetch(`${API_URL}/video/CreateShorts`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_KEY}`
      },
      body: JSON.stringify(requestBody)
    });

    const data = await response.json();
    console.log('API Response:', data);

    if (!response.ok) {
      throw new Error(data.error || 'Failed to create short');
    }

    if (!data.requestId) {
      return NextResponse.json({ error: 'No request ID received' }, { status: 400 });
    }

    return NextResponse.json({ request_id: data.requestId });

  } catch (error) {
    console.error('Error creating short:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to create short' },
      { status: 500 }
    );
  }
}
