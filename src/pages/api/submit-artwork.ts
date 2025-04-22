import type { APIRoute } from 'astro';
import { writeFile } from 'node:fs/promises';
import { join } from 'node:path';

export const POST: APIRoute = async ({ request }) => {
  console.log('Received request');
  
  try {
    // Check if the request is multipart/form-data
    const contentType = request.headers.get('content-type') || '';
    if (!contentType.includes('multipart/form-data')) {
      throw new Error('Content type must be multipart/form-data');
    }

    const formData = await request.formData();
    console.log('Form data received');

    // Get the file from form data
    const file = formData.get('artwork-image');
    if (!file || !(file instanceof File)) {
      throw new Error('No file uploaded');
    }

    // Read the file
    const buffer = Buffer.from(await file.arrayBuffer());
    
    // Generate unique filename
    const ext = file.name.split('.').pop() || 'png';
    const filename = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
    
    // Save to public/uploads
    const uploadPath = join(process.cwd(), 'public', 'uploads', filename);
    console.log('Saving to:', uploadPath);
    
    await writeFile(uploadPath, buffer);
    console.log('File saved successfully');

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Upload successful',
        path: `/uploads/${filename}`
      }),
      { 
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  } catch (error) {
    console.error('Error:', error);
    return new Response(
      JSON.stringify({ 
        error: 'Upload failed', 
        details: error instanceof Error ? error.message : String(error)
      }),
      { 
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
}; 