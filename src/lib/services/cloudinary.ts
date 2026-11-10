import { v2 as cloudinary } from "cloudinary";

// Configure Cloudinary fallback from Env variables
if (
  process.env.CLOUDINARY_URL &&
  !process.env.CLOUDINARY_URL.includes("api_key:api_secret")
) {
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
 * Server Action/API upload:
 * 1. Uses ImageKit.io (Primary — best for India CDN & unlimited free transformations) when IMAGEKIT_PRIVATE_KEY is set.
 * 2. Falls back to Cloudinary if CLOUDINARY_API_KEY is set.
 * 3. Falls back to compressed base64 data URL in local dev if neither is configured yet.
 */
export async function uploadImage(fileBase64: string): Promise<string> {
  // 1. Primary: ImageKit.io Upload API
  const rawKey = process.env.IMAGEKIT_PRIVATE_KEY?.trim().replace(/^["']|["']$/g, "");
  if (rawKey && rawKey !== "mock-key") {
    try {
      // Normalize private key (ImageKit keys end with '=' which frequently gets omitted during copy-paste)
      let imagekitPrivateKey = rawKey;
      if (imagekitPrivateKey.startsWith("private_") && !imagekitPrivateKey.endsWith("=")) {
        imagekitPrivateKey = `${imagekitPrivateKey}=`;
      }

      const formData = new FormData();
      formData.append("file", fileBase64);
      formData.append("fileName", `ghar_${Date.now()}.jpg`);
      formData.append("folder", "/ghar_foundation_rentals");
      formData.append("useUniqueFileName", "true");

      const basicAuth = Buffer.from(`${imagekitPrivateKey}:`).toString("base64");
      const res = await fetch("https://upload.imagekit.io/api/v1/files/upload", {
        method: "POST",
        headers: {
          Authorization: `Basic ${basicAuth}`,
        },
        body: formData,
      });

      if (!res.ok) {
        const errText = await res.text();
        console.error("[ImageKit Upload Error]:", errText);
        throw new Error("ImageKit upload failed");
      }

      const data = await res.json();
      return data.url as string;
    } catch (error) {
      console.error("ImageKit upload failed:", error);
      throw new Error("Failed to upload image to ImageKit. Please check your keys.");
    }
  }

  // 2. Secondary: Cloudinary Upload API
  const isCloudinaryConfigured =
    process.env.CLOUDINARY_API_KEY &&
    process.env.CLOUDINARY_API_KEY !== "mock-key";

  if (isCloudinaryConfigured) {
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

  // 3. Local dev fallback
  console.warn("Neither ImageKit nor Cloudinary configured. Using compressed data URL fallback.");
  return fileBase64;
}
