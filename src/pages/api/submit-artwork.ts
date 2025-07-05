import type { APIRoute } from "astro";
import { writeFile } from "fs/promises";
import { join } from "path";
import { v4 as uuidv4 } from "uuid";

export const prerender = false;

export const POST: APIRoute = async ({ request }) => {
  try {
    const formData = await request.formData();
    const file = formData.get("artwork-image") as File;
    const title = formData.get("title") as string;
    const description = formData.get("description") as string;
    const tags = formData.get("tags") as string;
    const category = formData.get("category") as string;
    const inspirations = formData.get("inspirations") as string;
    const userId = formData.get("userId") as string;

    if (!file || !title || !category || !userId) {
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
    const uploadsDir = join(process.cwd(), "public", "uploads", "artworks");
    await createDirectoryIfNotExists(uploadsDir);

    // Save file
    const filePath = join(uploadsDir, fileName);
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    await writeFile(filePath, buffer);

    // Create artwork object
    const artwork = {
      id: uuidv4(),
      title,
      description,
      tags: tags ? tags.split(",").map((tag: string) => tag.trim()) : [],
      category,
      inspirations,
      imageUrl: `/uploads/artworks/${fileName}`,
      userId,
      createdAt: new Date().toISOString(),
      likes: 0,
      comments: []
    };
    
    return new Response(
      JSON.stringify({
        success: true,
        artwork,
        message: "Artwork submitted successfully",
      }),
      { status: 200 }
    );
  } catch (error) {
    console.error("Error submitting artwork:", error);
    return new Response(
      JSON.stringify({
        error: "Failed to submit artwork",
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