import React, { useState, useEffect, useRef } from "react";
import { Camera, X, RefreshCw, AlertCircle, Sparkles } from "lucide-react";
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

  // Start camera stream
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
          width: { ideal: 1920, min: 720 },
          height: { ideal: 1080, min: 720 },
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

  const handleSnap = () => {
    const video = videoRef.current;
    if (!video || !isReady) return;

    // Ambil resolusi penuh dari kamera perangkat
    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth || 1920;
    canvas.height = video.videoHeight || 1080;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
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
              <p className="text-[10px] text-slate-400">Panduan batas foto 3:4 (960 × 1280)</p>
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

        {/* Viewfinder Area */}
        <div className="relative flex items-center justify-center bg-black min-h-[360px] overflow-hidden select-none">
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
            <>
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

              {/* 3:4 Target Viewfinder Guide Frame */}
              <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                {/* 3:4 Crop Box with guide corners */}
                <div
                  className="relative border-2 border-white/80 shadow-2xl rounded-xl"
                  style={{
                    height: "320px",
                    width: `${Math.round(320 * (3 / 4))}px`,
                  }}
                >
                  {/* Outer dimmed borders created by box shadow */}
                  <div className="absolute -inset-[1000px] border-[1000px] border-black/55 pointer-events-none" />

                  {/* Corner Accent marks */}
                  <div className="absolute -top-1 -left-1 w-4 h-4 border-t-3 border-l-3 border-sky-400 rounded-tl-sm" />
                  <div className="absolute -top-1 -right-1 w-4 h-4 border-t-3 border-r-3 border-sky-400 rounded-tr-sm" />
                  <div className="absolute -bottom-1 -left-1 w-4 h-4 border-b-3 border-l-3 border-sky-400 rounded-bl-sm" />
                  <div className="absolute -bottom-1 -right-1 w-4 h-4 border-b-3 border-r-3 border-sky-400 rounded-br-sm" />

                  {/* Badge */}
                  <div className="absolute top-2 left-1/2 -translate-x-1/2 bg-slate-900/80 px-2.5 py-0.5 rounded-full text-[9px] font-bold text-sky-400 border border-sky-500/30 whitespace-nowrap">
                    Batas 3:4 (960×1280)
                  </div>
                </div>
              </div>
            </>
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
