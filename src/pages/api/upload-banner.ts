import type { APIRoute } from "astro";
import { writeFile } from "fs/promises";
import { join } from "path";
import { v4 as uuidv4 } from "uuid";

export const prerender = false;

export const POST: APIRoute = async ({ request }) => {
  try {
    const formData = await request.formData();
    const file = formData.get("banner") as File;
    const userId = formData.get("userId") as string;

    if (!file || !userId) {
      return new Response(
        JSON.stringify({
          error: "Missing required fields",
        }),
        { status: 400 }
      );
    }

    // Validate file type
    if (!file.type.startsWith("image/")) {
      return new Response(
        JSON.stringify({
          error: "File must be an image",
        }),
        { status: 400 }
      );
    }

    // Create unique filename
    const fileExtension = file.name.split(".").pop();
    const fileName = `${uuidv4()}.${fileExtension}`;
    
    // Create uploads directory if it doesn't exist
    const uploadsDir = join(process.cwd(), "public", "uploads", "banners");
    await createDirectoryIfNotExists(uploadsDir);

    // Save file
    const filePath = join(uploadsDir, fileName);
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    await writeFile(filePath, buffer);

    // Return the URL of the uploaded file
    const bannerUrl = `/uploads/banners/${fileName}`;
    
    return new Response(
      JSON.stringify({
        bannerUrl,
        message: "Banner uploaded successfully",
      }),
      { status: 200 }
    );
  } catch (error) {
    console.error("Error uploading banner:", error);
    return new Response(
      JSON.stringify({
        error: "Failed to upload banner",
      }),
      { status: 500 }
    );
  }
};

async function createDirectoryIfNotExists(dir: string) {
  try {
    await import("fs/promises").then((fs) => fs.mkdir(dir, { recursive: true }));
  } catch (error) {
    console.error("Error creating directory:", error);
  }
} 