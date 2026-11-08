import { v2 as cloudinary } from "cloudinary";

// Configure Cloudinary from Env variables
if (process.env.CLOUDINARY_URL) {
  cloudinary.config({
    secure: true,
  });
} else {
  cloudinary.config({
    cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || "ghar-cloud",
    api_key: process.env.CLOUDINARY_API_KEY || "mock-key",
    api_secret: process.env.CLOUDINARY_API_SECRET || "mock-secret",
  });
}

/**
 * Compress an image on the client side before triggering uploads.
 * Restricts resolution to standard screens for low-bandwidth optimizations.
 */
export async function compressImageClient(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;
      img.onload = () => {
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");
        
        // Target low-bandwidth size: max 1280px width
        const MAX_WIDTH = 1280;
        let width = img.width;
        let height = img.height;

        if (width > MAX_WIDTH) {
          height = Math.round((height * MAX_WIDTH) / width);
          width = MAX_WIDTH;
        }

        canvas.width = width;
        canvas.height = height;

        ctx?.drawImage(img, 0, 0, width, height);

        // Compress at 75% quality for high density compression
        const compressedBase64 = canvas.toDataURL("image/jpeg", 0.75);
        resolve(compressedBase64);
      };
      img.onerror = (err) => reject(err);
    };
    reader.onerror = (err) => reject(err);
  });
}

/**
 * Server Action/API upload: Upload compressed image to Cloudinary.
 * Fallback to local storage base64 simulation if Cloudinary is not configured.
 */
export async function uploadImage(fileBase64: string): Promise<string> {
  // Check if Cloudinary is fully configured in environment
  const isCloudinaryConfigured =
    process.env.CLOUDINARY_API_KEY &&
    process.env.CLOUDINARY_API_KEY !== "mock-key";

  if (!isCloudinaryConfigured) {
    console.warn("Cloudinary not configured. Simulating base64 upload response.");
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 500));
    // Return base64 string directly as the public url so it displays in cards immediately!
    return fileBase64;
  }

  try {
    const uploadResponse = await cloudinary.uploader.upload(fileBase64, {
      folder: "ghar_foundation_rentals",
      transformation: [{ quality: "auto" }, { fetch_format: "auto" }],
    });
    return uploadResponse.secure_url;
  } catch (error) {
    console.error("Cloudinary upload failed", error);
    throw new Error("Failed to upload image. Please try again.");
  }
}
