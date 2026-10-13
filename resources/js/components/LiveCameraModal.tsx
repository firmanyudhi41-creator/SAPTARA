import React, { useState, useEffect, useRef } from "react";
import { Camera, X, RefreshCw, AlertCircle } from "lucide-react";
import { Button } from "./ui/Button";

interface LiveCameraModalProps {
  isOpen: boolean;
  onCapture: (dataUrl: string) => void;
  onClose: () => void;
  onFallbackToFile: () => void;
}

export function LiveCameraModal({
  isOpen,
  onCapture,
  onClose,
  onFallbackToFile,
}: LiveCameraModalProps) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const [facingMode, setFacingMode] = useState<"environment" | "user">("environment");
  const [hasMultipleCameras, setHasMultipleCameras] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isReady, setIsReady] = useState<boolean>(false);

  // Stop current active stream
  const stopStream = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setIsReady(false);
  };

  // Start camera stream with highest possible resolution
  const startCamera = async (mode: "environment" | "user") => {
    stopStream();
    setErrorMsg(null);

    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setErrorMsg("Perangkat atau peramban ini tidak mendukung akses kamera langsung.");
      return;
    }

    try {
      // Check for available devices
      try {
        const devices = await navigator.mediaDevices.enumerateDevices();
        const videoDevices = devices.filter((d) => d.kind === "videoinput");
        setHasMultipleCameras(videoDevices.length > 1);
      } catch {
        // Ignore device enumeration error
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: { ideal: mode },
          width: { ideal: 2560, min: 720 },
          height: { ideal: 1440, min: 720 },
        },
        audio: false,
      });

      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.onloadedmetadata = () => {
          videoRef.current?.play();
          setIsReady(true);
        };
      }
    } catch (err: any) {
      console.warn("Gagal membuka kamera:", err);
      let message = "Tidak dapat mengakses kamera.";
      if (err.name === "NotAllowedError" || err.name === "PermissionDeniedError") {
        message = "Izin akses kamera ditolak. Silakan izinkan kamera di browser atau pilih foto dari file.";
      } else if (err.name === "NotFoundError" || err.name === "DevicesNotFoundError") {
        message = "Kamera tidak ditemukan pada perangkat ini.";
      }
      setErrorMsg(message);
    }
  };

  useEffect(() => {
    if (isOpen) {
      startCamera(facingMode);
    } else {
      stopStream();
    }
    return () => {
      stopStream();
    };
  }, [isOpen, facingMode]);

  const toggleFacingMode = () => {
    setFacingMode((prev) => (prev === "environment" ? "user" : "environment"));
  };

  /**
   * Menjepret foto dari kamera:
   * Mengambil pemotongan maksimal dari sensor kamera dengan mempertahankan rasio 3:4.
   * Tidak melakukan resize/downscale saat pengambilan ini agar kualitas tetap maksimal.
   * Proses resize ke ukuran target (960 x 1280) dilakukan setelah foto berhasil diambil.
   */
  const handleSnap = () => {
    const video = videoRef.current;
    if (!video || !isReady) return;

    const vW = video.videoWidth || 1920;
    const vH = video.videoHeight || 1080;
    const targetRatio = 3 / 4; // 0.75
    const currentRatio = vW / vH;

    // Hitung area pemotongan maksimal sesuai rasio 3:4
    let cropW: number;
    let cropH: number;
    let cropX: number;
    let cropY: number;

    if (currentRatio > targetRatio) {
      // Frame lebih lebar (misal: landscape 16:9 atau 4:3)
      // Gunakan tinggi maksimal sensor, hitung lebar sesuai 3:4
      cropH = vH;
      cropW = Math.round(vH * targetRatio);
      cropX = Math.round((vW - cropW) / 2);
      cropY = 0;
    } else {
      // Frame lebih tinggi (misal: portrait 9:16)
      // Gunakan lebar maksimal sensor, hitung tinggi sesuai 3:4
      cropW = vW;
      cropH = Math.round(vW / targetRatio);
      cropX = 0;
      cropY = Math.round((vH - cropH) / 2);
    }

    // Buat canvas dengan resolusi maksimal yang didapat dari sensor (tanpa resize prematur)
    const canvas = document.createElement("canvas");
    canvas.width = cropW;
    canvas.height = cropH;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = "high";

    if (facingMode === "user") {
      // Mirror horizontal untuk kamera depan agar sesuai dengan preview
      ctx.translate(cropW, 0);
      ctx.scale(-1, 1);
    }

    ctx.drawImage(video, cropX, cropY, cropW, cropH, 0, 0, cropW, cropH);
    const dataUrl = canvas.toDataURL("image/jpeg", 0.95);

    stopStream();
    onCapture(dataUrl);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-slate-950/85 backdrop-blur-sm transition-opacity" onClick={onClose} />

      {/* Modal Container */}
      <div className="relative z-50 w-full max-w-md rounded-3xl bg-slate-900 shadow-2xl overflow-hidden flex flex-col border border-slate-800 text-white animate-in zoom-in-95">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-800 bg-slate-900/90">
          <div className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-sky-500/20 text-sky-400">
              <Camera className="h-4 w-4" />
            </span>
            <div>
              <h3 className="font-display font-bold text-sm text-white">Ambil Foto Langsung</h3>
              <p className="text-[10px] text-slate-400">Rasio 3:4 Portrait (Ukuran Maksimal Kamera)</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white transition-colors cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Viewfinder Area: Frame 3:4 Maksimal yang responsif */}
        <div className="relative flex items-center justify-center bg-black p-3 sm:p-4 overflow-hidden select-none">
          {errorMsg ? (
            <div className="p-6 text-center max-w-xs space-y-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-rose-500/20 text-rose-400 mx-auto">
                <AlertCircle className="h-6 w-6" />
              </div>
              <p className="text-xs text-rose-200 font-semibold">{errorMsg}</p>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={onFallbackToFile}
                className="bg-white/10 hover:bg-white/20 text-white border-white/20 text-xs w-full"
              >
                📁 Pilih Gambar dari File / Galeri
              </Button>
            </div>
          ) : (
            <div className="relative w-full max-w-[340px] aspect-[3/4] max-h-[65vh] rounded-2xl overflow-hidden bg-slate-950 border-2 border-white/40 shadow-2xl flex items-center justify-center">
              {/* Video Element */}
              <video
                ref={videoRef}
                playsInline
                autoPlay
                muted
                className={`w-full h-full object-cover transition-opacity duration-300 ${
                  isReady ? "opacity-100" : "opacity-0"
                } ${facingMode === "user" ? "scale-x-[-1]" : ""}`}
              />

              {/* Viewfinder Guide Overlay */}
              <div className="absolute inset-0 pointer-events-none">
                {/* Corner Accent marks */}
                <div className="absolute top-3 left-3 w-5 h-5 border-t-3 border-l-3 border-sky-400 rounded-tl-md shadow-sm" />
                <div className="absolute top-3 right-3 w-5 h-5 border-t-3 border-r-3 border-sky-400 rounded-tr-md shadow-sm" />
                <div className="absolute bottom-3 left-3 w-5 h-5 border-b-3 border-l-3 border-sky-400 rounded-bl-md shadow-sm" />
                <div className="absolute bottom-3 right-3 w-5 h-5 border-b-3 border-r-3 border-sky-400 rounded-br-md shadow-sm" />

                {/* Subtle Rule of Thirds Grid */}
                <div className="absolute inset-0 grid grid-cols-3 grid-rows-3 opacity-20 pointer-events-none">
                  <div className="border-r border-b border-white" />
                  <div className="border-r border-b border-white" />
                  <div className="border-b border-white" />
                  <div className="border-r border-b border-white" />
                  <div className="border-r border-b border-white" />
                  <div className="border-b border-white" />
                  <div className="border-r border-white" />
                  <div className="border-r border-white" />
                  <div />
                </div>

                {/* Badge Penanda Rasio 3:4 */}
                <div className="absolute top-3 left-1/2 -translate-x-1/2 bg-slate-900/80 backdrop-blur-xs px-3 py-1 rounded-full text-[10px] font-semibold text-sky-300 border border-sky-500/30 shadow-md whitespace-nowrap">
                  Rasio 3:4 (Portrait)
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Shutter & Controls Footer */}
        <div className="flex items-center justify-between px-6 py-4 bg-slate-900 border-t border-slate-800">
          {/* Switch Camera */}
          {hasMultipleCameras ? (
            <button
              type="button"
              onClick={toggleFacingMode}
              disabled={!isReady}
              className="p-3 rounded-full bg-slate-800 hover:bg-slate-700 text-white transition-all cursor-pointer shadow-md"
              title="Ganti Kamera Depan/Belakang"
            >
              <RefreshCw className="h-5 w-5" />
            </button>
          ) : (
            <div className="w-11" />
          )}

          {/* Shutter Button */}
          <button
            type="button"
            onClick={handleSnap}
            disabled={!isReady}
            className="flex h-16 w-16 items-center justify-center rounded-full bg-white text-sky-600 hover:bg-sky-50 active:scale-95 transition-all shadow-lg shadow-white/10 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed border-4 border-slate-700"
            title="Jepret Foto"
          >
            <div className="h-11 w-11 rounded-full bg-sky-500 flex items-center justify-center text-white">
              <Camera className="h-6 w-6" />
            </div>
          </button>

          {/* Fallback to File Button */}
          <button
            type="button"
            onClick={onFallbackToFile}
            className="text-[11px] font-semibold text-slate-400 hover:text-white transition-colors cursor-pointer text-right max-w-[80px]"
          >
            Pilih File
          </button>
        </div>
      </div>
    </div>
  );
}
