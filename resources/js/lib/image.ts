/**
 * Utility functions for handling and resizing image files on the frontend.
 */

export interface ResizeImageOptions {
  maxWidth?: number;
  maxHeight?: number;
  quality?: number;
}

/**
 * Resize an image file so that its dimensions do not exceed maxWidth x maxHeight,
 * maintaining the original aspect ratio (proportional scaling).
 *
 * - Does not upscale images that are already smaller than maxWidth and maxHeight.
 * - Skips non-raster or vector formats (such as SVG).
 * - Preserves transparency for PNG files.
 * - Gracefully falls back to the original file if canvas manipulation is not supported or fails.
 *
 * @param file The original image File object
 * @param maxWidth Maximum width in pixels (default: 800)
 * @param maxHeight Maximum height in pixels (default: 800)
 * @param quality Compression quality for JPEG/WebP between 0 and 1 (default: 0.85)
 * @returns Promise<File> Resized File object
 */
export async function resizeImage(
  file: File,
  maxWidth = 800,
  maxHeight = 800,
  quality = 0.85
): Promise<File> {
  // Return original file if it's not an image or if it's an SVG (vector graphic)
  if (!file.type.startsWith("image/") || file.type === "image/svg+xml") {
    return file;
  }

  return new Promise((resolve) => {
    const objectUrl = URL.createObjectURL(file);
    const img = new Image();

    img.onload = () => {
      URL.revokeObjectURL(objectUrl);

      const width = img.naturalWidth || img.width;
      const height = img.naturalHeight || img.height;

      // If dimensions are invalid or already within bounds, return original file
      if (!width || !height || (width <= maxWidth && height <= maxHeight)) {
        resolve(file);
        return;
      }

      // Calculate proportional dimensions maintaining aspect ratio
      const ratio = Math.min(maxWidth / width, maxHeight / height);
      const targetWidth = Math.round(width * ratio);
      const targetHeight = Math.round(height * ratio);

      const canvas = document.createElement("canvas");
      canvas.width = targetWidth;
      canvas.height = targetHeight;

      const ctx = canvas.getContext("2d");
      if (!ctx) {
        resolve(file);
        return;
      }

      // High-quality downsampling
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = "high";
      ctx.drawImage(img, 0, 0, targetWidth, targetHeight);

      // Determine output mime type (preserve PNG transparency)
      const isPng = file.type === "image/png" || file.name.toLowerCase().endsWith(".png");
      const isWebp = file.type === "image/webp" || file.name.toLowerCase().endsWith(".webp");
      const mimeType = isPng ? "image/png" : (isWebp ? "image/webp" : "image/jpeg");

      canvas.toBlob(
        (blob) => {
          if (!blob) {
            resolve(file);
            return;
          }

          const resizedFile = new File([blob], file.name, {
            type: mimeType,
            lastModified: Date.now(),
          });

          resolve(resizedFile);
        },
        mimeType,
        mimeType === "image/png" ? undefined : quality
      );
    };

    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      // Fallback to original file on failure
      resolve(file);
    };

    img.src = objectUrl;
  });
}
