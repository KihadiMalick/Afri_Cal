/**
 * Client-side image compression utility for food scanning.
 *
 * Features:
 * - Resize to max 1024px (longest side)
 * - Convert to JPEG quality 0.75
 * - Strip EXIF/metadata via canvas redraw
 * - Optional: center crop on highest-contrast region
 */

interface CompressedImage {
  base64: string;
  mimeType: "image/jpeg";
  width: number;
  height: number;
  originalSizeKB: number;
  compressedSizeKB: number;
}

interface CompressOptions {
  maxSize?: number;       // max dimension in px (default 1024)
  quality?: number;       // JPEG quality 0-1 (default 0.75)
  contrastCrop?: boolean; // crop to high-contrast region (default false)
  cropRatio?: number;     // crop to this ratio of original (default 0.85)
}

/**
 * Load an image from a File into an HTMLImageElement.
 */
function loadImage(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve(img);
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Impossible de lire l'image"));
    };
    img.src = url;
  });
}

/**
 * Find the center of the highest-contrast region in an image.
 * Divides image into a grid and picks the cell with highest luminance variance.
 */
function findContrastCenter(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number
): { cx: number; cy: number } {
  const gridSize = 4;
  const cellW = Math.floor(width / gridSize);
  const cellH = Math.floor(height / gridSize);

  let bestVariance = -1;
  let bestCx = width / 2;
  let bestCy = height / 2;

  for (let gy = 0; gy < gridSize; gy++) {
    for (let gx = 0; gx < gridSize; gx++) {
      const sx = gx * cellW;
      const sy = gy * cellH;
      const data = ctx.getImageData(sx, sy, cellW, cellH).data;

      // Compute luminance variance (sample every 4th pixel for speed)
      let sum = 0;
      let sumSq = 0;
      let count = 0;

      for (let i = 0; i < data.length; i += 16) {
        const lum = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
        sum += lum;
        sumSq += lum * lum;
        count++;
      }

      if (count > 0) {
        const mean = sum / count;
        const variance = sumSq / count - mean * mean;
        if (variance > bestVariance) {
          bestVariance = variance;
          bestCx = sx + cellW / 2;
          bestCy = sy + cellH / 2;
        }
      }
    }
  }

  return { cx: bestCx, cy: bestCy };
}

/**
 * Compress an image file for upload to the scan API.
 *
 * - Resizes to max 1024px (longest side)
 * - Converts to JPEG quality 0.75
 * - Strips all EXIF/metadata (canvas redraw)
 * - Optionally crops to the highest-contrast region
 */
export async function compressImageForScan(
  file: File,
  options: CompressOptions = {}
): Promise<CompressedImage> {
  const {
    maxSize = 1024,
    quality = 0.75,
    contrastCrop = false,
    cropRatio = 0.85,
  } = options;

  const img = await loadImage(file);
  const originalSizeKB = Math.round(file.size / 1024);

  let { width, height } = img;

  // Step 1: Draw full image to temp canvas for contrast analysis
  const tempCanvas = document.createElement("canvas");
  tempCanvas.width = width;
  tempCanvas.height = height;
  const tempCtx = tempCanvas.getContext("2d");
  if (!tempCtx) throw new Error("Canvas non supporte");
  tempCtx.drawImage(img, 0, 0);

  // Step 2: Optional contrast crop
  let srcX = 0;
  let srcY = 0;
  let srcW = width;
  let srcH = height;

  if (contrastCrop && cropRatio < 1) {
    const { cx, cy } = findContrastCenter(tempCtx, width, height);

    const cropW = Math.round(width * cropRatio);
    const cropH = Math.round(height * cropRatio);

    // Center crop on contrast point, clamped to image bounds
    srcX = Math.max(0, Math.min(width - cropW, Math.round(cx - cropW / 2)));
    srcY = Math.max(0, Math.min(height - cropH, Math.round(cy - cropH / 2)));
    srcW = cropW;
    srcH = cropH;
    width = cropW;
    height = cropH;
  }

  // Step 3: Resize (maintain aspect ratio, longest side = maxSize)
  let outW = width;
  let outH = height;

  if (outW > maxSize || outH > maxSize) {
    if (outW > outH) {
      outH = Math.round((outH * maxSize) / outW);
      outW = maxSize;
    } else {
      outW = Math.round((outW * maxSize) / outH);
      outH = maxSize;
    }
  }

  // Step 4: Draw to final canvas (strips all metadata)
  const canvas = document.createElement("canvas");
  canvas.width = outW;
  canvas.height = outH;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas non supporte");

  ctx.drawImage(img, srcX, srcY, srcW, srcH, 0, 0, outW, outH);

  // Step 5: Export as JPEG
  const dataUrl = canvas.toDataURL("image/jpeg", quality);
  const base64 = dataUrl.split(",")[1];
  const compressedSizeKB = Math.round((base64.length * 3) / 4 / 1024);

  return {
    base64,
    mimeType: "image/jpeg",
    width: outW,
    height: outH,
    originalSizeKB,
    compressedSizeKB,
  };
}

/**
 * Generate a simple image hash for grouping similar scan images.
 * Resizes to 8x8, converts to grayscale, and creates a hex hash
 * from the average luminance comparison (similar to aHash).
 */
export function generateImageHash(base64: string): Promise<string> {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = 8;
      canvas.height = 8;
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        resolve("0000000000000000");
        return;
      }

      ctx.drawImage(img, 0, 0, 8, 8);
      const data = ctx.getImageData(0, 0, 8, 8).data;

      // Compute average luminance
      let sum = 0;
      const lums: number[] = [];
      for (let i = 0; i < data.length; i += 4) {
        const lum = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
        lums.push(lum);
        sum += lum;
      }
      const avg = sum / lums.length;

      // Build 64-bit hash: 1 if pixel > avg, 0 otherwise → hex
      let hash = "";
      for (let i = 0; i < lums.length; i += 4) {
        let nibble = 0;
        for (let j = 0; j < 4 && i + j < lums.length; j++) {
          if (lums[i + j] >= avg) nibble |= 1 << (3 - j);
        }
        hash += nibble.toString(16);
      }

      resolve(hash);
    };
    img.onerror = () => resolve("0000000000000000");
    img.src = `data:image/jpeg;base64,${base64}`;
  });
}
