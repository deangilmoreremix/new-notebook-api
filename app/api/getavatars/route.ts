import { NextResponse } from 'next/server';
import { API_URL, API_KEY } from '@/lib/constants';

export async function GET() {
  try {
    const response = await fetch(`${API_URL}/video/GetAvatars`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${API_KEY}`,
        'Accept': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error('Failed to fetch avatars');
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching avatars:', error);
    return NextResponse.json({ error: 'Failed to fetch avatars' }, { status: 500 });
  }
} 