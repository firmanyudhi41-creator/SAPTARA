/**
 * Utility functions for handling, cropping, and resizing image files on the frontend.
 * Mengikuti standar rasio 3:4 portrait (960 x 1280 px).
 */

export const TARGET_PHOTO_WIDTH = 960;
export const TARGET_PHOTO_HEIGHT = 1280;
export const TARGET_ASPECT_RATIO = TARGET_PHOTO_WIDTH / TARGET_PHOTO_HEIGHT; // 3 / 4 = 0.75

export interface ResizeImageOptions {
  maxWidth?: number;
  maxHeight?: number;
  quality?: number;
}

export interface CropParameters {
  panX: number; // In screen cropBox pixels
  panY: number; // In screen cropBox pixels
  zoom: number; // Multiplier >= 1.0
  rotation: number; // 0, 90, 180, 270 degrees
  cropBoxWidth: number;
  cropBoxHeight: number;
}

export interface ImageMeta {
  width: number;
  height: number;
  aspectRatio: number;
  isLandscape: boolean;
  orientationLabel: "Landscape" | "Portrait";
}

/**
 * Mendeteksi dimensi natural dan orientasi gambar.
 */
export async function getImageMeta(fileOrUrl: File | string): Promise<ImageMeta> {
  const url = typeof fileOrUrl === "string" ? fileOrUrl : URL.createObjectURL(fileOrUrl);
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      if (typeof fileOrUrl !== "string") {
        URL.revokeObjectURL(url);
      }
      const width = img.naturalWidth || img.width;
      const height = img.naturalHeight || img.height;
      const isLandscape = width > height;
      resolve({
        width,
        height,
        aspectRatio: width / height,
        isLandscape,
        orientationLabel: isLandscape ? "Landscape" : "Portrait",
      });
    };
    img.onerror = () => {
      if (typeof fileOrUrl !== "string") {
        URL.revokeObjectURL(url);
      }
      reject(new Error("Gagal membaca metadata gambar"));
    };
    img.src = url;
  });
}

/**
 * Memotong dan mengekspor gambar ke ukuran tepat 960 x 1280 px (rasio 3:4 portrait)
 * berdasarkan parameter crop (pan, zoom, rotasi) dari pratinjau.
 */
export async function cropAndExportTo960x1280(
  image: HTMLImageElement,
  params: CropParameters,
  fileName = "logbook_photo.jpg",
  quality = 0.88
): Promise<{ file: File; dataUrl: string }> {
  const canvas = document.createElement("canvas");
  canvas.width = TARGET_PHOTO_WIDTH;
  canvas.height = TARGET_PHOTO_HEIGHT;

  const ctx = canvas.getContext("2d");
  if (!ctx) {
    throw new Error("Canvas context 2D tidak tersedia");
  }

  const normRotation = ((params.rotation % 360) + 360) % 360;
  const isSwapped = normRotation === 90 || normRotation === 270;

  const effNaturalWidth = isSwapped ? image.naturalHeight : image.naturalWidth;
  const effNaturalHeight = isSwapped ? image.naturalWidth : image.naturalHeight;

  // Skala penyesuaian (cover) di dalam crop box layar
  const baseScale = Math.max(
    params.cropBoxWidth / effNaturalWidth,
    params.cropBoxHeight / effNaturalHeight
  );

  // Ukuran gambar yang dirender di layar
  const renderedWidth = effNaturalWidth * baseScale * params.zoom;
  const renderedHeight = effNaturalHeight * baseScale * params.zoom;

  // Rasio konversi dari crop box layar ke canvas ekspor (960x1280)
  const scaleMultiplier = TARGET_PHOTO_WIDTH / params.cropBoxWidth;

  const exportRenderedWidth = renderedWidth * scaleMultiplier;
  const exportRenderedHeight = renderedHeight * scaleMultiplier;

  // Titik pusat gambar pada canvas ekspor
  const exportCenterX = (TARGET_PHOTO_WIDTH / 2) + (params.panX * scaleMultiplier);
  const exportCenterY = (TARGET_PHOTO_HEIGHT / 2) + (params.panY * scaleMultiplier);

  // Gambar dengan rotasi dan smoothing tingkat tinggi
  ctx.save();
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";

  ctx.translate(exportCenterX, exportCenterY);
  ctx.rotate((normRotation * Math.PI) / 180);

  const drawW = isSwapped ? exportRenderedHeight : exportRenderedWidth;
  const drawH = isSwapped ? exportRenderedWidth : exportRenderedHeight;

  ctx.drawImage(image, -drawW / 2, -drawH / 2, drawW, drawH);
  ctx.restore();

  const dataUrl = canvas.toDataURL("image/jpeg", quality);

  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (!blob) {
          reject(new Error("Gagal mengonversi canvas ke Blob"));
          return;
        }

        const safeFileName = fileName.replace(/\.[^/.]+$/, "") + ".jpg";
        const file = new File([blob], safeFileName, {
          type: "image/jpeg",
          lastModified: Date.now(),
        });

        resolve({ file, dataUrl });
      },
      "image/jpeg",
      quality
    );
  });
}

// Alias untuk kompatibilitas
export const cropAndExportTo720x1280 = cropAndExportTo960x1280;

/**
 * Otomatis memotong gambar ke tengah dengan rasio 3:4 dan ukuran 960 x 1280 px.
 * Digunakan sebagai fallback jika user memilih auto-crop.
 */
export async function autoCropTo960x1280(
  file: File,
  quality = 0.88
): Promise<File> {
  if (!file.type.startsWith("image/")) {
    return file;
  }

  return new Promise((resolve) => {
    const objectUrl = URL.createObjectURL(file);
    const img = new Image();

    img.onload = () => {
      URL.revokeObjectURL(objectUrl);

      const width = img.naturalWidth || img.width;
      const height = img.naturalHeight || img.height;

      if (!width || !height) {
        resolve(file);
        return;
      }

      // Hitung koordinat crop center 3:4
      const currentRatio = width / height;
      let srcX = 0;
      let srcY = 0;
      let srcWidth = width;
      let srcHeight = height;

      if (currentRatio > TARGET_ASPECT_RATIO) {
        // Landscape / lebih lebar -> crop kiri & kanan
        srcWidth = Math.round(height * TARGET_ASPECT_RATIO);
        srcX = Math.round((width - srcWidth) / 2);
      } else {
        // Lebih tinggi -> crop atas & bawah
        srcHeight = Math.round(width / TARGET_ASPECT_RATIO);
        srcY = Math.round((height - srcHeight) / 2);
      }

      const canvas = document.createElement("canvas");
      canvas.width = TARGET_PHOTO_WIDTH;
      canvas.height = TARGET_PHOTO_HEIGHT;

      const ctx = canvas.getContext("2d");
      if (!ctx) {
        resolve(file);
        return;
      }

      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = "high";
      ctx.drawImage(img, srcX, srcY, srcWidth, srcHeight, 0, 0, TARGET_PHOTO_WIDTH, TARGET_PHOTO_HEIGHT);

      canvas.toBlob(
        (blob) => {
          if (!blob) {
            resolve(file);
            return;
          }

          const croppedFile = new File([blob], file.name.replace(/\.[^/.]+$/, "") + ".jpg", {
            type: "image/jpeg",
            lastModified: Date.now(),
          });

          resolve(croppedFile);
        },
        "image/jpeg",
        quality
      );
    };

    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      resolve(file);
    };

    img.src = objectUrl;
  });
}

export const autoCropTo720x1280 = autoCropTo960x1280;

/**
 * Resize an image file so that its dimensions do not exceed maxWidth x maxHeight,
 * maintaining the original aspect ratio (proportional scaling).
 */
export async function resizeImage(
  file: File,
  maxWidth = 800,
  maxHeight = 800,
  quality = 0.85
): Promise<File> {
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

      if (!width || !height || (width <= maxWidth && height <= maxHeight)) {
        resolve(file);
        return;
      }

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

      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = "high";
      ctx.drawImage(img, 0, 0, targetWidth, targetHeight);

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
      resolve(file);
    };

    img.src = objectUrl;
  });
}
