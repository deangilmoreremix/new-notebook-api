import { NextRequest, NextResponse } from 'next/server';
import { API_URL, API_KEY } from '@/lib/constants';
import { z } from 'zod';
import logger from '@/lib/logger';

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

const contentRequestSchema = z.object({
  text: z.string().min(1).max(10000),
  outputType: z.enum(['text', 'audio', 'deep_dive']),
  resources: z.array(z.string()).optional(),
  customization: z.object({
    host1: z.string().optional(),
    host2: z.string().optional(),
    format: z.string().optional(),
  }).optional(),
});

async function checkStatusWithPolling(requestId: string) {
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
      
      // Check if more than 25 minutes have elapsed
      if (Date.now() - startTime > 1500000) {
        return {
          status: data.status,
          message: "Your request has been pending for over 25 minutes. Please check back later."
        };
      }
    } catch (error) {
      logger.error('Error checking status:', { error, requestId });
    }
    await delay(5000); // Wait for 5 seconds before next check
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedBody = contentRequestSchema.parse(body);

    const outputType = validatedBody.outputType === 'deep_dive' ? 'audio' : 'text';

    const requestBody: any = {
      text: validatedBody.text,
      outputType,
      resources: validatedBody.resources || [],
      includeCitations: outputType !== 'audio',
    };

    if (outputType !== 'audio' && validatedBody.customization) {
      requestBody.customization = validatedBody.customization;
    }

    const response = await fetch(`${API_URL}/content/create`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_KEY}`,
      },
      body: JSON.stringify(requestBody),
    });

    let data = await response.json();
    
    if (!data.request_id) {
      return NextResponse.json({ errorMessage: "No request ID received." }, { status: 400 });
    }

    // Poll for the status until complete or 3 minutes have elapsed
    const finalResult = await checkStatusWithPolling(data.request_id);

    return NextResponse.json({
      status: "success",
      initialResponse: data,
      finalResult
    }, { status: 200 });

  } catch (error) {
    logger.error('Content creation error:', { error });
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}
