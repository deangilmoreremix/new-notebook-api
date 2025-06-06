import { NextResponse } from 'next/server';
import { API_URL, API_KEY } from '@/lib/constants';
import { promises as fs } from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';

export async function POST(req: Request) {
  try {
    // Parse the incoming form data
    const formData = await req.formData();
    const audioFile = formData.get('audio');
    const name = formData.get('name');

    if (!audioFile || !name) {
      return NextResponse.json(
        { error: 'Missing audio file or name' },
        { status: 400 }
      );
    }

    if (!(audioFile instanceof File)) {
      return NextResponse.json(
        { error: 'Invalid file format' },
        { status: 400 }
      );
    }

    // Create a unique filename
    const fileExtension = path.extname(audioFile.name);
    const uniqueFileName = `${uuidv4()}${fileExtension}`;
    
    // Save the audio file locally
    const publicPath = path.join(process.cwd(), 'public', 'media');
    await fs.mkdir(publicPath, { recursive: true });
    const filePath = path.join(publicPath, uniqueFileName);
    
    // Convert the file to a Buffer and write it to disk
    const buffer = Buffer.from(await audioFile.arrayBuffer());
    await fs.writeFile(filePath, buffer);

    // Get the base URL from environment or use a default
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
    const audioUrl = `${baseUrl}/media/${uniqueFileName}`;

    // Prepare the payload for the voice cloning API
    const payload = {
      audioUrl,
      name,
    };

    // Call the external API
    const response = await fetch(`${API_URL}/content/clonevoice`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${API_KEY}`,
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorData = await response.text();
      // Clean up the uploaded file if the API call fails
      try {
        await fs.unlink(filePath);
      } catch (cleanupError) {
        console.error('Failed to clean up file:', cleanupError);
      }
      throw new Error(`Voice cloning failed: ${errorData}`);
    }

    const result = await response.json();
    return NextResponse.json(result);
  } catch (error) {
    console.error('Voice cloning error:', {
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString(),
    });
    return NextResponse.json(
      { error: 'Failed to clone voice' },
      { status: 500 }
    );
  }
}

async function saveFileLocally(file: FormDataEntryValue): Promise<string> {
  if (!(file instanceof File)) {
    throw new Error('Invalid file');
  }

  // Define the local path to the media folder within the public directory.
  const publicPath = path.join(process.cwd(), 'public', 'media');
  await fs.mkdir(publicPath, { recursive: true });

  // Create a unique file name (you might want to sanitize the original file name)
  const fileName = `${Date.now()}-${file.name}`;
  const filePath = path.join(publicPath, fileName);

  // Convert the file to a Buffer and write it to disk
  const buffer = Buffer.from(await file.arrayBuffer());
  await fs.writeFile(filePath, buffer);

  // Construct the public URL.
  // IMPORTANT: Ensure that your domain (or localhost during development) is accessible to the external API.
  return `http://167.71.188.184:1340/media/${fileName}`;
}
