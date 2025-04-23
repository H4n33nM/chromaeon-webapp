import type { APIRoute } from 'astro';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';

// Define the POST endpoint
export const POST: APIRoute = async ({ request }) => {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const type = formData.get('type') as string; // 'avatar' or 'banner'
    
    if (!file || !type) {
      return new Response(JSON.stringify({ error: 'Missing file or type' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Determine the correct upload directory based on type
    const baseDir = join(process.cwd(), 'public', 'uploads', 'profiles');
    const uploadDir = type === 'avatar' ? join(baseDir, 'avatars') : join(baseDir, 'banners');

    // Create directories if they don't exist
    if (!existsSync(baseDir)) {
      await mkdir(baseDir, { recursive: true });
    }
    if (!existsSync(uploadDir)) {
      await mkdir(uploadDir, { recursive: true });
    }

    // Create a unique filename
    const timestamp = Date.now();
    const extension = file.name.split('.').pop();
    const filename = `${type}-${timestamp}.${extension}`;
    
    // Get the file data as an ArrayBuffer
    const arrayBuffer = await file.arrayBuffer();
    // Convert ArrayBuffer to Buffer
    const buffer = Buffer.from(arrayBuffer);
    
    // Save file to the appropriate directory
    const filePath = join(uploadDir, filename);
    await writeFile(filePath, buffer);

    // Return the public URL path
    return new Response(JSON.stringify({ 
      success: true, 
      filename: `/uploads/profiles/${type === 'avatar' ? 'avatars' : 'banners'}/${filename}` 
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Upload error:', error);
    return new Response(JSON.stringify({ 
      error: 'Failed to upload file',
      details: error instanceof Error ? error.message : String(error)
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}; 