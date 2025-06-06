import { NextResponse } from 'next/server';
import { API_URL, API_KEY } from '@/lib/constants';

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

async function checkStatus(requestId: string) {
  const start = Date.now();
  while (true) {
    try {
      const res = await fetch(`${API_URL}/content/status/${requestId}`, {
        headers: {
          Authorization: `Bearer ${API_KEY}`,
          Accept: 'application/json'
        }
      });
      const data = await res.json();
      if (data.status === 100) {
        return data;
      }
      if (Date.now() - start > 180000) {
        return { status: data.status, message: 'Request pending for over 3 minutes' };
      }
    } catch (e) {
      console.error('Polling error', e);
    }
    await delay(5000);
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const response = await fetch(`${API_URL}/content/separatespeakersaudio`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${API_KEY}`,
        'Content-Type': 'application/json',
        Accept: 'application/json',
        'User-Agent': 'SmartNotebook/1.0'
      },
      body: JSON.stringify(body)
    });
    const data = await response.json();
    if (!data.request_id) {
      return NextResponse.json({ error: 'No request ID received' }, { status: 400 });
    }
    const finalResult = await checkStatus(data.request_id);
    return NextResponse.json({ status: 'success', initialResponse: data, finalResult }, { status: 200 });
  } catch (error) {
    console.error('Error separating speakers:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}
