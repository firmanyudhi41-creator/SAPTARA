import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  X,
  ZoomIn,
  ZoomOut,
  RotateCw,
  RotateCcw,
  Crop,
  Check,
  Smartphone,
  Monitor,
  Loader2,
} from "lucide-react";
import {
  TARGET_ASPECT_RATIO,
  cropAndExportTo960x1280,
  ImageMeta,
} from "../lib/image";
import { Button } from "./ui/Button";

interface PhotoCropModalProps {
  isOpen: boolean;
  imageSrc: string | null;
  originalFile?: File | null;
  onConfirm: (croppedFile: File, previewUrl: string) => void;
  onCancel: () => void;
}

export function PhotoCropModal({
  isOpen,
  imageSrc,
  originalFile,
  onConfirm,
  onCancel,
}: PhotoCropModalProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const imageRef = useRef<HTMLImageElement | null>(null);

  const [meta, setMeta] = useState<ImageMeta | null>(null);
  const [zoom, setZoom] = useState<number>(1.0);
  const [pan, setPan] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [rotation, setRotation] = useState<number>(0);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [dragStart, setDragStart] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [initialPinchDist, setInitialPinchDist] = useState<number | null>(null);
  const [initialPinchZoom, setInitialPinchZoom] = useState<number>(1.0);
  const [isExporting, setIsExporting] = useState<boolean>(false);
  const [imageLoaded, setImageLoaded] = useState<boolean>(false);

  // Responsive stage dimensions
  // Crop box has aspect ratio 3:4 (0.75)
  const STAGE_HEIGHT = 384;
  const CROP_BOX_HEIGHT = 352;
  const CROP_BOX_WIDTH = Math.round(CROP_BOX_HEIGHT * TARGET_ASPECT_RATIO); // 352 * 0.75 = 264px
  const STAGE_WIDTH = Math.max(340, CROP_BOX_WIDTH + 64); // 340px+

  // Load image whenever imageSrc changes
  useEffect(() => {
    if (!isOpen || !imageSrc) {
      setImageLoaded(false);
      setMeta(null);
      return;
    }

    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      imageRef.current = img;
      const w = img.naturalWidth || img.width;
      const h = img.naturalHeight || img.height;
      const isLandscape = w > h;

      setMeta({
        width: w,
        height: h,
        aspectRatio: w / h,
        isLandscape,
        orientationLabel: isLandscape ? "Landscape" : "Portrait",
      });

      // Reset transforms
      setZoom(1.0);
      setPan({ x: 0, y: 0 });
      setRotation(0);
      setImageLoaded(true);
    };
    img.onerror = () => {
      setImageLoaded(false);
      console.error("Gagal memuat gambar untuk crop preview");
    };
    img.src = imageSrc;
  }, [isOpen, imageSrc]);

  // Compute maximum allowed pan offsets to keep the crop box filled
  const getMaxPan = useCallback(
    (currentZoom: number, currentRotation: number) => {
      const img = imageRef.current;
      if (!img) return { maxX: 0, maxY: 0 };

      const isSwapped = (currentRotation % 180 !== 0);
      const effW = isSwapped ? (img.naturalHeight || img.height) : (img.naturalWidth || img.width);
      const effH = isSwapped ? (img.naturalWidth || img.width) : (img.naturalHeight || img.height);

      const baseScale = Math.max(CROP_BOX_WIDTH / effW, CROP_BOX_HEIGHT / effH);
      const rendW = effW * baseScale * currentZoom;
      const rendH = effH * baseScale * currentZoom;

      const maxX = Math.max(0, (rendW - CROP_BOX_WIDTH) / 2);
      const maxY = Math.max(0, (rendH - CROP_BOX_HEIGHT) / 2);

      return { maxX, maxY };
    },
    [CROP_BOX_WIDTH, CROP_BOX_HEIGHT]
  );

  // Redraw preview canvas
  const drawCanvas = useCallback(() => {
    try {
      const canvas = canvasRef.current;
      const img = imageRef.current;
      if (!canvas || !img || !imageLoaded) return;

      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      const width = canvas.width;
      const height = canvas.height;

      // Clear background
      ctx.clearRect(0, 0, width, height);
      ctx.fillStyle = "#0f172a"; // slate-900
      ctx.fillRect(0, 0, width, height);

      const isSwapped = (rotation % 180 !== 0);
      const effW = isSwapped ? (img.naturalHeight || img.height) : (img.naturalWidth || img.width);
      const effH = isSwapped ? (img.naturalWidth || img.width) : (img.naturalHeight || img.height);

      if (!effW || !effH) return;

      const baseScale = Math.max(CROP_BOX_WIDTH / effW, CROP_BOX_HEIGHT / effH);
      const rendW = effW * baseScale * zoom;
      const rendH = effH * baseScale * zoom;

      const cropBoxX = (width - CROP_BOX_WIDTH) / 2;
      const cropBoxY = (height - CROP_BOX_HEIGHT) / 2;

      const centerX = cropBoxX + (CROP_BOX_WIDTH / 2) + pan.x;
      const centerY = cropBoxY + (CROP_BOX_HEIGHT / 2) + pan.y;

      const drawW = isSwapped ? rendH : rendW;
      const drawH = isSwapped ? rendW : rendH;

      // 1. Draw entire image dimmed outside the crop box
      ctx.save();
      ctx.globalAlpha = 0.32;
      ctx.translate(centerX, centerY);
      ctx.rotate((rotation * Math.PI) / 180);
      ctx.drawImage(img, -drawW / 2, -drawH / 2, drawW, drawH);
      ctx.restore();

      // 2. Draw sharp, full-brightness image clipped strictly inside 3:4 crop box
      ctx.save();
      ctx.beginPath();
      ctx.rect(cropBoxX, cropBoxY, CROP_BOX_WIDTH, CROP_BOX_HEIGHT);
      ctx.clip();

      ctx.translate(centerX, centerY);
      ctx.rotate((rotation * Math.PI) / 180);
      ctx.drawImage(img, -drawW / 2, -drawH / 2, drawW, drawH);
      ctx.restore();

      // 3. Draw Rule-of-Thirds Grid inside crop box
      ctx.save();
      ctx.strokeStyle = "rgba(255, 255, 255, 0.35)";
      ctx.lineWidth = 1;
      ctx.setLineDash([4, 4]);

      const thirdW = CROP_BOX_WIDTH / 3;
      const thirdH = CROP_BOX_HEIGHT / 3;

      // Vertical grid lines
      ctx.beginPath();
      ctx.moveTo(cropBoxX + thirdW, cropBoxY);
      ctx.lineTo(cropBoxX + thirdW, cropBoxY + CROP_BOX_HEIGHT);
      ctx.moveTo(cropBoxX + thirdW * 2, cropBoxY);
      ctx.lineTo(cropBoxX + thirdW * 2, cropBoxY + CROP_BOX_HEIGHT);
      // Horizontal grid lines
      ctx.moveTo(cropBoxX, cropBoxY + thirdH);
      ctx.lineTo(cropBoxX + CROP_BOX_WIDTH, cropBoxY + thirdH);
      ctx.moveTo(cropBoxX, cropBoxY + thirdH * 2);
      ctx.lineTo(cropBoxX + CROP_BOX_WIDTH, cropBoxY + thirdH * 2);
      ctx.stroke();
      ctx.restore();

      // 4. Draw outer border of the crop box
      ctx.save();
      ctx.strokeStyle = "rgba(255, 255, 255, 0.85)";
      ctx.lineWidth = 2;
      ctx.strokeRect(cropBoxX, cropBoxY, CROP_BOX_WIDTH, CROP_BOX_HEIGHT);

      // 5. Draw prominent corner accents (Sky-400 / Cyan)
      const cornerSize = 18;
      ctx.strokeStyle = "#38bdf8"; // sky-400
      ctx.lineWidth = 3.5;
      ctx.lineCap = "round";

      // Top-Left
      ctx.beginPath();
      ctx.moveTo(cropBoxX, cropBoxY + cornerSize);
      ctx.lineTo(cropBoxX, cropBoxY);
      ctx.lineTo(cropBoxX + cornerSize, cropBoxY);
      ctx.stroke();

      // Top-Right
      ctx.beginPath();
      ctx.moveTo(cropBoxX + CROP_BOX_WIDTH - cornerSize, cropBoxY);
      ctx.lineTo(cropBoxX + CROP_BOX_WIDTH, cropBoxY);
      ctx.lineTo(cropBoxX + CROP_BOX_WIDTH, cropBoxY + cornerSize);
      ctx.stroke();

      // Bottom-Left
      ctx.beginPath();
      ctx.moveTo(cropBoxX, cropBoxY + CROP_BOX_HEIGHT - cornerSize);
      ctx.lineTo(cropBoxX, cropBoxY + CROP_BOX_HEIGHT);
      ctx.lineTo(cropBoxX + cornerSize, cropBoxY + CROP_BOX_HEIGHT);
      ctx.stroke();

      // Bottom-Right
      ctx.beginPath();
      ctx.moveTo(cropBoxX + CROP_BOX_WIDTH - cornerSize, cropBoxY + CROP_BOX_HEIGHT);
      ctx.lineTo(cropBoxX + CROP_BOX_WIDTH, cropBoxY + CROP_BOX_HEIGHT);
      ctx.lineTo(cropBoxX + CROP_BOX_WIDTH, cropBoxY + CROP_BOX_HEIGHT - cornerSize);
      ctx.stroke();

      // 6. Badge label indicating target ratio inside preview
      ctx.fillStyle = "rgba(15, 23, 42, 0.75)";
      ctx.beginPath();
      const badgeW = 96;
      const badgeH = 20;
      const badgeX = cropBoxX + (CROP_BOX_WIDTH - badgeW) / 2;
      const badgeY = cropBoxY + 8;
      if (typeof (ctx as any).roundRect === "function") {
        (ctx as any).roundRect(badgeX, badgeY, badgeW, badgeH, 10);
      } else {
        ctx.rect(badgeX, badgeY, badgeW, badgeH);
      }
      ctx.fill();

      ctx.fillStyle = "#38bdf8";
      ctx.font = "bold 10px sans-serif";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText("960 × 1280 (3:4)", cropBoxX + CROP_BOX_WIDTH / 2, badgeY + badgeH / 2);

      ctx.restore();
    } catch (err) {
      console.error("Gagal menggambar preview canvas:", err);
    }
  }, [pan, zoom, rotation, imageLoaded, CROP_BOX_WIDTH, CROP_BOX_HEIGHT]);

  useEffect(() => {
    drawCanvas();
  }, [drawCanvas]);

  // Mouse drag handlers
  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    setIsDragging(true);
    setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDragging) return;
    const newX = e.clientX - dragStart.x;
    const newY = e.clientY - dragStart.y;
    const { maxX, maxY } = getMaxPan(zoom, rotation);

    setPan({
      x: Math.min(maxX, Math.max(-maxX, newX)),
      y: Math.min(maxY, Math.max(-maxY, newY)),
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Mouse wheel zoom
  const handleWheel = (e: React.WheelEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    const delta = e.deltaY < 0 ? 0.1 : -0.1;
    const nextZoom = Math.min(3.0, Math.max(1.0, Number((zoom + delta).toFixed(2))));
    setZoom(nextZoom);

    // Clamp pan with new zoom
    const { maxX, maxY } = getMaxPan(nextZoom, rotation);
    setPan((prev) => ({
      x: Math.min(maxX, Math.max(-maxX, prev.x)),
      y: Math.min(maxY, Math.max(-maxY, prev.y)),
    }));
  };

  // Touch handlers (pan and pinch-to-zoom)
  const handleTouchStart = (e: React.TouchEvent<HTMLCanvasElement>) => {
    if (e.touches.length === 1) {
      setIsDragging(true);
      setDragStart({
        x: e.touches[0].clientX - pan.x,
        y: e.touches[0].clientY - pan.y,
      });
      setInitialPinchDist(null);
    } else if (e.touches.length === 2) {
      setIsDragging(false);
      const dist = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
      );
      setInitialPinchDist(dist);
      setInitialPinchZoom(zoom);
    }
  };

  const handleTouchMove = (e: React.TouchEvent<HTMLCanvasElement>) => {
    if (e.touches.length === 1 && isDragging) {
      const newX = e.touches[0].clientX - dragStart.x;
      const newY = e.touches[0].clientY - dragStart.y;
      const { maxX, maxY } = getMaxPan(zoom, rotation);

      setPan({
        x: Math.min(maxX, Math.max(-maxX, newX)),
        y: Math.min(maxY, Math.max(-maxY, newY)),
      });
    } else if (e.touches.length === 2 && initialPinchDist) {
      const dist = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
      );
      const scaleChange = dist / initialPinchDist;
      const nextZoom = Math.min(3.0, Math.max(1.0, Number((initialPinchZoom * scaleChange).toFixed(2))));
      setZoom(nextZoom);

      const { maxX, maxY } = getMaxPan(nextZoom, rotation);
      setPan((prev) => ({
        x: Math.min(maxX, Math.max(-maxX, prev.x)),
        y: Math.min(maxY, Math.max(-maxY, prev.y)),
      }));
    }
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
    setInitialPinchDist(null);
  };

  // Zoom slider change
  const handleZoomChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const nextZoom = parseFloat(e.target.value);
    setZoom(nextZoom);

    const { maxX, maxY } = getMaxPan(nextZoom, rotation);
    setPan((prev) => ({
      x: Math.min(maxX, Math.max(-maxX, prev.x)),
      y: Math.min(maxY, Math.max(-maxY, prev.y)),
    }));
  };

  // Rotate 90 degrees clockwise
  const handleRotate = () => {
    const nextRotation = (rotation + 90) % 360;
    setRotation(nextRotation);
    setPan({ x: 0, y: 0 }); // Reset pan on rotate to avoid out of bounds
  };

  // Reset transforms
  const handleReset = () => {
    setZoom(1.0);
    setPan({ x: 0, y: 0 });
    setRotation(0);
  };

  // Confirm crop and export to 960 x 1280 px
  const handleConfirm = async () => {
    if (!imageRef.current) return;
    setIsExporting(true);

    try {
      const fileName = originalFile?.name || "jurnal_saptara_960x1280.jpg";
      const result = await cropAndExportTo960x1280(
        imageRef.current,
        {
          panX: pan.x,
          panY: pan.y,
          zoom,
          rotation,
          cropBoxWidth: CROP_BOX_WIDTH,
          cropBoxHeight: CROP_BOX_HEIGHT,
        },
        fileName,
        0.88
      );

      onConfirm(result.file, result.dataUrl);
    } catch (err) {
      console.error("Gagal melakukan crop foto:", err);
      alert("Terjadi kesalahan saat memotong foto. Silakan coba kembali.");
    } finally {
      setIsExporting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm transition-opacity"
        onClick={onCancel}
      />

      {/* Modal Container */}
      <div className="relative z-50 w-full max-w-md rounded-3xl bg-white shadow-2xl overflow-hidden flex flex-col border border-slate-200 animate-in zoom-in-95">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 bg-gradient-to-r from-sky-50 to-blue-50">
          <div className="flex items-center gap-2.5">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-sky-500 text-white shadow-sm shadow-sky-500/30">
              <Crop className="h-5 w-5" />
            </span>
            <div>
              <h3 className="font-display font-bold text-base text-slate-800">
                Pratinjau Batas Foto
              </h3>
              <p className="text-[11px] text-slate-500">
                Format upload: <strong className="text-sky-700">960 × 1280 px (3:4 Portrait)</strong>
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onCancel}
            className="rounded-full p-1.5 text-slate-400 hover:bg-white hover:text-slate-600 transition-colors cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Informative Orientation & Framing Banner */}
        {meta && (
          <div className="px-5 py-2.5 bg-slate-50 border-b border-slate-100 flex items-center justify-between text-xs">
            <div className="flex items-center gap-1.5 font-semibold text-slate-700">
              {meta.isLandscape ? (
                <>
                  <Monitor className="h-3.5 w-3.5 text-amber-500" />
                  <span>Mode Landscape ({meta.width} × {meta.height})</span>
                </>
              ) : (
                <>
                  <Smartphone className="h-3.5 w-3.5 text-emerald-500" />
                  <span>Mode Portrait ({meta.width} × {meta.height})</span>
                </>
              )}
            </div>
            <span className="text-[11px] text-slate-500 italic">
              {meta.isLandscape
                ? "Geser foto ke samping untuk memilih area 3:4"
                : "Geser foto ke atas/bawah untuk memusatkan area 3:4"}
            </span>
          </div>
        )}

        {/* Canvas Stage Area */}
        <div className="relative flex flex-col items-center justify-center p-3 bg-slate-900 overflow-hidden select-none">
          {!imageLoaded ? (
            <div className="flex flex-col items-center justify-center h-80 text-white gap-2">
              <Loader2 className="h-8 w-8 animate-spin text-sky-400" />
              <p className="text-xs text-slate-300">Menyiapkan pratinjau foto...</p>
            </div>
          ) : (
            <div className="relative cursor-grab active:cursor-grabbing touch-none">
              <canvas
                ref={canvasRef}
                width={STAGE_WIDTH}
                height={STAGE_HEIGHT}
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
                onWheel={handleWheel}
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
                className="rounded-2xl shadow-inner max-w-full"
              />
            </div>
          )}
        </div>

        {/* Interactive Controls (Zoom, Rotate, Reset) */}
        <div className="px-5 py-3 bg-slate-50/80 border-t border-slate-100 space-y-2.5">
          <div className="flex items-center justify-between gap-3">
            {/* Zoom Slider */}
            <div className="flex items-center gap-2 flex-1">
              <button
                type="button"
                onClick={() => {
                  const z = Math.max(1.0, Number((zoom - 0.2).toFixed(2)));
                  setZoom(z);
                  const { maxX, maxY } = getMaxPan(z, rotation);
                  setPan((p) => ({ x: Math.min(maxX, Math.max(-maxX, p.x)), y: Math.min(maxY, Math.max(-maxY, p.y)) }));
                }}
                className="p-1 rounded-lg text-slate-500 hover:bg-slate-200 transition-colors"
                title="Perkecil"
              >
                <ZoomOut className="h-4 w-4" />
              </button>
              <input
                type="range"
                min="1.0"
                max="3.0"
                step="0.05"
                value={zoom}
                onChange={handleZoomChange}
                className="w-full accent-sky-500 h-1.5 bg-slate-200 rounded-lg cursor-pointer"
              />
              <button
                type="button"
                onClick={() => {
                  const z = Math.min(3.0, Number((zoom + 0.2).toFixed(2)));
                  setZoom(z);
                  const { maxX, maxY } = getMaxPan(z, rotation);
                  setPan((p) => ({ x: Math.min(maxX, Math.max(-maxX, p.x)), y: Math.min(maxY, Math.max(-maxY, p.y)) }));
                }}
                className="p-1 rounded-lg text-slate-500 hover:bg-slate-200 transition-colors"
                title="Perbesar"
              >
                <ZoomIn className="h-4 w-4" />
              </button>
              <span className="text-[11px] font-bold text-slate-600 min-w-[36px] text-right">
                {Math.round(zoom * 100)}%
              </span>
            </div>

            {/* Quick action buttons (Rotate, Reset) */}
            <div className="flex items-center gap-1.5 shrink-0 pl-2 border-l border-slate-200">
              <button
                type="button"
                onClick={handleRotate}
                className="p-1.5 rounded-xl border border-slate-200 bg-white text-slate-700 hover:bg-sky-50 hover:text-sky-600 transition-all shadow-xs"
                title="Putar 90° Searah Jarum Jam"
              >
                <RotateCw className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={handleReset}
                className="p-1.5 rounded-xl border border-slate-200 bg-white text-slate-700 hover:bg-slate-100 transition-all shadow-xs text-xs font-semibold"
                title="Reset Posisi & Zoom"
              >
                <RotateCcw className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between text-[11px] text-slate-500">
            <span>💡 <em>Area di dalam garis kotak adalah bagian foto 3:4 yang akan tersimpan.</em></span>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-end gap-2.5 px-5 py-3.5 bg-white border-t border-slate-100">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onCancel}
            disabled={isExporting}
          >
            Batal
          </Button>

          <Button
            type="button"
            variant="gold"
            size="sm"
            onClick={handleConfirm}
            disabled={!imageLoaded || isExporting}
            className="gap-1.5 shadow-md shadow-amber-500/20"
          >
            {isExporting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Memproses 960×1280...</span>
              </>
            ) : (
              <>
                <Check className="h-4 w-4" />
                <span>Gunakan Foto (960 × 1280)</span>
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
