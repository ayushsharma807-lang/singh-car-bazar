"use client";

const IMAGE_EXTENSIONS = [".jpg", ".jpeg", ".png", ".webp", ".heic", ".heif"];

function getLowerName(file: File) {
  return file.name.toLowerCase();
}

export function isImageLikeUpload(file: File) {
  const lowerName = getLowerName(file);
  const lowerType = file.type.toLowerCase();

  return (
    lowerType.startsWith("image/") ||
    IMAGE_EXTENSIONS.some((extension) => lowerName.endsWith(extension))
  );
}

export function isHeicLikeUpload(file: File) {
  const lowerName = getLowerName(file);
  const lowerType = file.type.toLowerCase();

  return (
    lowerType === "image/heic" ||
    lowerType === "image/heif" ||
    lowerName.endsWith(".heic") ||
    lowerName.endsWith(".heif")
  );
}

async function loadImageFromFile(file: File) {
  const objectUrl = URL.createObjectURL(file);

  try {
    const image = await new Promise<HTMLImageElement>((resolve, reject) => {
      const nextImage = new window.Image();
      nextImage.onload = () => resolve(nextImage);
      nextImage.onerror = () => reject(new Error("Image could not be read."));
      nextImage.src = objectUrl;
    });

    return image;
  } finally {
    URL.revokeObjectURL(objectUrl);
  }
}

async function convertHeicLikeUpload(file: File) {
  const heic2anyModule = await import("heic2any");
  const heic2any = (heic2anyModule.default ?? heic2anyModule) as (options: {
    blob: Blob;
    toType: string;
    quality?: number;
  }) => Promise<Blob | Blob[]>;

  const converted = await heic2any({
    blob: file,
    toType: "image/jpeg",
    quality: 0.86,
  });
  const nextBlob = Array.isArray(converted) ? converted[0] : converted;

  if (!nextBlob) {
    throw new Error("Photo could not be converted. Please use JPG or PNG.");
  }

  const nextName = file.name.replace(/\.[^.]+$/, "") || "photo";
  return new File([nextBlob], `${nextName}.jpg`, {
    type: "image/jpeg",
    lastModified: Date.now(),
  });
}

async function compressImageUpload(
  file: File,
  {
    maxWidth,
    quality,
  }: {
    maxWidth: number;
    quality: number;
  },
) {
  const canCompress = ["image/jpeg", "image/jpg", "image/png", "image/webp"].includes(
    file.type.toLowerCase(),
  );

  if (!canCompress) {
    return file;
  }

  try {
    const image = await loadImageFromFile(file);
    const scale = Math.min(1, maxWidth / image.width);
    const targetWidth = Math.max(1, Math.round(image.width * scale));
    const targetHeight = Math.max(1, Math.round(image.height * scale));

    const canvas = document.createElement("canvas");
    canvas.width = targetWidth;
    canvas.height = targetHeight;

    const context = canvas.getContext("2d");

    if (!context) {
      return file;
    }

    context.fillStyle = "#f8fafc";
    context.fillRect(0, 0, targetWidth, targetHeight);
    context.drawImage(image, 0, 0, targetWidth, targetHeight);

    const blob = await new Promise<Blob | null>((resolve) => {
      canvas.toBlob(resolve, "image/jpeg", quality);
    });

    if (!blob || blob.size >= file.size) {
      return file;
    }

    const nextName = file.name.replace(/\.[^.]+$/, "") || "photo";
    return new File([blob], `${nextName}.jpg`, {
      type: "image/jpeg",
      lastModified: Date.now(),
    });
  } catch (error) {
    console.error("Image compression failed", error);
    return file;
  }
}

async function normalizeImageUpload(
  file: File,
  options: {
    maxWidth: number;
    quality: number;
  },
) {
  const convertedFile = isHeicLikeUpload(file) ? await convertHeicLikeUpload(file) : file;
  return compressImageUpload(convertedFile, options);
}

export async function normalizeCarPhotoUpload(file: File) {
  if (!isImageLikeUpload(file)) {
    return file;
  }

  return normalizeImageUpload(file, {
    maxWidth: 1800,
    quality: 0.82,
  });
}

export async function normalizeDocumentUpload(file: File) {
  if (!isImageLikeUpload(file)) {
    return file;
  }

  return normalizeImageUpload(file, {
    maxWidth: 1600,
    quality: 0.76,
  });
}
