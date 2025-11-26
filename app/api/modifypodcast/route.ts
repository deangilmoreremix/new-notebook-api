import { NextRequest, NextResponse } from 'next/server';
import { API_URL, API_KEY } from '@/lib/constants';

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

async function checkStatusWithPolling(requestId) {
  const startTime = Date.now();
  while (true) {
    try {
      const response = await fetch(`${API_URL}/content/status/${requestId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${API_KEY}`,
          'Accept': 'application/json'
        }
      });
      const data = await response.json();
      
      // If status is complete, return the data
      if (data.status === 100) {
        return data;
      }
      
      // Check if more than 3 minutes have elapsed
      if (Date.now() - startTime > 180000) { // 3 minutes timeout
        return {
          status: data.status,
          message: "Your request has been pending for over 3 minutes. Please check back later."
        };
      }
    } catch (error) {
    }
    await delay(5000); // Wait for 5 seconds before next check
  }
}

export async function POST(request) {
  try {
    const body = await request.json();

    // Validate required fields
    const { audioUrl, voice1, voice2 } = body;
    if (!audioUrl || !voice1 || !voice2) {
      return NextResponse.json(
        { error: "Missing required fields: audioUrl, voice1, and voice2 are mandatory." },
        { status: 400 }
      );
    }

    const requestBody = {
      audioUrl,
      voice1,
      voice2
    };

    const response = await fetch(`${API_URL}/content/modifypodcast`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${API_KEY}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'User-Agent': 'SmartNotebook/1.0'
      },
      body: JSON.stringify(requestBody)
    });

    const data = await response.json();
    
    if (!data.request_id) {
      return NextResponse.json({ errorMessage: "No request ID received." }, { status: 400 });
    }

    // Poll for the status until complete or timeout
    const finalResult = await checkStatusWithPolling(data.request_id);

    return NextResponse.json({
      status: "success",
      initialResponse: data,
      finalResult
    }, { status: 200 });

  } catch (error) {
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}
