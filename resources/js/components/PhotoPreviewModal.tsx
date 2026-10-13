import React from "react";
import { X, ExternalLink } from "lucide-react";
import { Dialog } from "./ui/Dialog";

interface PhotoPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  photoUrl: string | null;
  title?: string;
  subtitle?: string;
  caption?: string;
}

export function PhotoPreviewModal({
  isOpen,
  onClose,
  photoUrl,
  title,
  subtitle,
  caption,
}: PhotoPreviewModalProps) {
  if (!isOpen || !photoUrl) return null;

  return (
    <Dialog
      open={isOpen}
      onClose={onClose}
      className="max-w-md p-0 overflow-hidden bg-slate-950 text-white border border-slate-800 rounded-3xl"
    >
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-800/80 bg-slate-900/90">
        <div>
          {title && <h3 className="font-display font-bold text-sm text-white">{title}</h3>}
          {subtitle && <p className="text-[11px] text-slate-400">{subtitle}</p>}
        </div>
        <div className="flex items-center gap-1">
          <a
            href={photoUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-full p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white transition-colors"
            title="Buka gambar di tab baru"
          >
            <ExternalLink className="h-4 w-4" />
          </a>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white transition-colors cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* 3:4 Portrait Image Frame */}
      <div className="p-4 bg-black flex flex-col items-center justify-center">
        <div className="relative aspect-[3/4] w-full max-w-[280px] max-h-[65vh] rounded-2xl overflow-hidden border-2 border-slate-800 shadow-2xl bg-slate-900">
          <img
            src={photoUrl}
            alt={title || "Foto Bukti"}
            className="w-full h-full object-cover"
          />
          {/* Badge Rasio 3:4 */}
          <div className="absolute top-2.5 left-2.5 bg-slate-950/80 text-sky-400 text-[10px] font-bold px-2 py-0.5 rounded-full border border-sky-500/30 backdrop-blur-xs">
            960 × 1280 px (3:4)
          </div>
        </div>
      </div>

      {/* Caption if provided */}
      {caption && (
        <div className="px-5 py-3.5 bg-slate-900/80 border-t border-slate-800/80 text-xs text-slate-300">
          <p className="italic text-slate-300 bg-slate-800/50 p-2.5 rounded-xl border border-slate-700/50">
            "{caption}"
          </p>
        </div>
      )}
    </Dialog>
  );
}
