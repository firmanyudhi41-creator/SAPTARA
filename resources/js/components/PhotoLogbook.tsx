import React, { useState, useRef, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import confetti from "canvas-confetti";
import {
  Camera,
  Upload,
  CheckCircle2,
  Clock,
  AlertCircle,
  Sparkles,
  MessageCircle,
  Loader2,
  Crop,
  Smartphone,
  RefreshCw,
  X,
  ZoomIn,
} from "lucide-react";
import { useHabits } from "../hooks/use-habits";
import { useStudentLogbook, useSubmitLogbook } from "../hooks/use-logbook";
import { Button } from "./ui/Button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "./ui/Card";
import { Badge } from "./ui/Badge";
import { formatDateIndo } from "../lib/utils";
import { PhotoCropModal } from "./PhotoCropModal";
import { LiveCameraModal } from "./LiveCameraModal";
import { PhotoPreviewModal } from "./PhotoPreviewModal";

interface PhotoLogbookProps {
  studentId: number;
}

export function PhotoLogbook({ studentId }: PhotoLogbookProps) {
  const [searchParams] = useSearchParams();
  const preselectedHabitId = searchParams.get("habitId");

  const { data: habits } = useHabits();
  const { data: entries, isLoading: entriesLoading } = useStudentLogbook(studentId);
  const submitMutation = useSubmitLogbook(studentId);

  const [selectedHabitId, setSelectedHabitId] = useState<number | null>(null);
  const [caption, setCaption] = useState("");

  // Foto dan State Crop Preview (Target 3:4 Portrait 960 x 1280 px)
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [rawImageSrc, setRawImageSrc] = useState<string | null>(null);
  const [rawFile, setRawFile] = useState<File | null>(null);

  const [isCropModalOpen, setIsCropModalOpen] = useState(false);
  const [isCameraModalOpen, setIsCameraModalOpen] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Full Photo preview modal state
  const [viewingPhoto, setViewingPhoto] = useState<{
    url: string;
    title: string;
    subtitle?: string;
    caption?: string;
  } | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (preselectedHabitId) {
      setSelectedHabitId(Number(preselectedHabitId));
    } else if (habits && habits.length > 0 && !selectedHabitId) {
      setSelectedHabitId(habits[0].id);
    }
  }, [preselectedHabitId, habits]);

  // Handler saat user memilih file dari galeri / kamera perangkat
  const handlePhotoFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        const dataUrl = reader.result as string;
        setRawFile(file);
        setRawImageSrc(dataUrl);
        setIsCropModalOpen(true);
      };
      reader.readAsDataURL(file);
    }
  };

  // Handler saat user mengambil foto via live camera modal
  const handleCameraCapture = (dataUrl: string) => {
    setRawImageSrc(dataUrl);
    setRawFile(null);
    setIsCameraModalOpen(false);
    setIsCropModalOpen(true);
  };

  // Handler saat crop modal dikonfirmasi (hasil akhir tepat 960x1280)
  const handleCropConfirm = (croppedFile: File, previewUrl: string) => {
    setPhotoFile(croppedFile);
    setPhotoPreview(previewUrl);
    setIsCropModalOpen(false);
  };

  // Bersihkan foto yang dipilih
  const clearPhoto = () => {
    setPhotoFile(null);
    setPhotoPreview(null);
    setRawImageSrc(null);
    setRawFile(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  // Buka kembali modal crop jika user ingin mengatur ulang batas foto
  const handleReCrop = () => {
    if (rawImageSrc) {
      setIsCropModalOpen(true);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedHabitId) {
      setFeedbackMsg({ type: "error", text: "Silakan pilih salah satu dari 7 kebiasaan." });
      return;
    }
    if (!caption.trim()) {
      setFeedbackMsg({ type: "error", text: "Tuliskan cerita singkat atau refleksi kebiasaanmu." });
      return;
    }

    try {
      await submitMutation.mutateAsync({
        habitId: selectedHabitId,
        caption,
        photo: photoFile || undefined,
      });

      // Launch joyful celebration confetti
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ["#0ea5e9", "#f59e0b", "#10b981", "#ec4899"],
      });

      setFeedbackMsg({ type: "success", text: "Jurnal berhasil dikirim! Menunggu verifikasi guru." });
      setCaption("");
      clearPhoto();
    } catch (err: any) {
      setFeedbackMsg({ type: "error", text: err.message || "Gagal mengirim jurnal." });
    }
  };

  return (
    <div className="space-y-8">
      {/* Upload / Form Card */}
      <Card className="border-sky-100 shadow-md">
        <CardHeader>
          <div className="flex items-center gap-2">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-sky-100 text-xl">📸</span>
            <div>
              <CardTitle className="font-display text-sky-900">Catat Jurnal Kebiasaan</CardTitle>
              <CardDescription>Unggah foto kegiatan dengan rasio 3:4 (960 × 1280 px) dan ceritakan pembiasaan positifmu hari ini</CardDescription>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          {feedbackMsg && (
            <div
              className={`mb-4 rounded-xl p-3 text-xs font-semibold flex items-center gap-2 ${
                feedbackMsg.type === "success"
                  ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                  : "bg-rose-50 text-rose-700 border border-rose-200"
              }`}
            >
              {feedbackMsg.type === "success" ? <Sparkles className="h-4 w-4 shrink-0" /> : <AlertCircle className="h-4 w-4 shrink-0" />}
              <span>{feedbackMsg.text}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Habit selector chips */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                Pilih Kebiasaan (7 Kebiasaan Anak Indonesia Hebat)
              </label>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                {habits?.map((habit) => {
                  const isSelected = selectedHabitId === habit.id;
                  return (
                    <button
                      key={habit.id}
                      type="button"
                      onClick={() => setSelectedHabitId(habit.id)}
                      className={`flex items-center gap-2 rounded-xl p-2.5 text-left text-xs font-semibold transition-all cursor-pointer ${
                        isSelected
                          ? "bg-sky-500 text-white shadow-md shadow-sky-500/20 scale-102"
                          : "bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200"
                      }`}
                    >
                      <span className="text-xl">{habit.icon}</span>
                      <span className="line-clamp-1">{habit.name}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Photo upload field with 3:4 (960 x 1280) preview crop */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Foto Bukti Kegiatan (Standar 960 × 1280 px)
                </label>
                <span className="text-[11px] font-semibold text-sky-600 bg-sky-50 px-2 py-0.5 rounded-full border border-sky-200">
                  Rasio 3:4 Portrait
                </span>
              </div>

              {photoPreview ? (
                <div className="space-y-2">
                  {/* Preview Box - 3:4 Portrait Aspect */}
                  <div className="relative w-48 sm:w-56 aspect-[3/4] rounded-2xl overflow-hidden border-2 border-sky-300 shadow-xl bg-slate-900 mx-auto group">
                    <img
                      src={photoPreview}
                      alt="Preview Foto 960x1280"
                      className="w-full h-full object-cover cursor-pointer"
                      onClick={() =>
                        setViewingPhoto({
                          url: photoPreview,
                          title: "Pratinjau Foto Kegiatan",
                          subtitle: "Format standar 960 × 1280 px (3:4)",
                          caption,
                        })
                      }
                    />

                    {/* Badge Resolusi 960 x 1280 */}
                    <div className="absolute top-2 left-2 bg-emerald-600 text-white text-[9px] font-bold px-2 py-0.5 rounded-full shadow-md flex items-center gap-1">
                      <CheckCircle2 className="h-3 w-3" />
                      960 × 1280 px (3:4)
                    </div>

                    {/* Tombol Hapus Foto */}
                    <button
                      type="button"
                      onClick={clearPhoto}
                      className="absolute top-2 right-2 rounded-full bg-rose-500 p-1 text-white shadow-md hover:bg-rose-600 transition-colors cursor-pointer"
                      title="Hapus foto"
                    >
                      <X className="h-4 w-4" />
                    </button>

                    {/* Tombol Potong Ulang (Overlay bottom) */}
                    <div className="absolute inset-x-0 bottom-0 p-2 bg-gradient-to-t from-slate-950/90 via-slate-950/60 to-transparent flex justify-center">
                      <button
                        type="button"
                        onClick={handleReCrop}
                        className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-white/95 hover:bg-white text-slate-800 text-xs font-bold shadow-md transition-all cursor-pointer hover:scale-105 active:scale-95"
                      >
                        <Crop className="h-3.5 w-3.5 text-sky-600" />
                        <span>Potong Ulang</span>
                      </button>
                    </div>
                  </div>

                  <p className="text-center text-[11px] text-emerald-600 font-semibold flex items-center justify-center gap-1">
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    Foto berhasil disesuaikan ke ukuran 960 × 1280 px (rasio 3:4, siap diunggah).
                  </p>
                </div>
              ) : (
                /* Choice cards when no photo selected yet */
                <div className="rounded-2xl border-2 border-dashed border-slate-300 bg-slate-50/60 p-5 text-center space-y-3">
                  <div className="flex items-center justify-center gap-3">
                    {/* Live Camera Button */}
                    <button
                      type="button"
                      onClick={() => setIsCameraModalOpen(true)}
                      className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-sky-500 hover:bg-sky-600 text-white text-xs font-bold shadow-sm shadow-sky-500/30 transition-all cursor-pointer hover:scale-102 active:scale-98"
                    >
                      <Camera className="h-4 w-4" />
                      <span>Ambil Foto (Kamera)</span>
                    </button>

                    {/* File / Gallery Picker Button */}
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 text-xs font-bold shadow-xs transition-all cursor-pointer hover:scale-102 active:scale-98"
                    >
                      <Upload className="h-4 w-4 text-slate-500" />
                      <span>Pilih dari Galeri / File</span>
                    </button>
                  </div>

                  <div className="text-[11px] text-slate-500 space-y-0.5">
                    <p className="font-semibold text-slate-700">
                      Otomatis disesuaikan ke <strong>960 × 1280 px (Rasio 3:4)</strong>
                    </p>
                    <p className="text-slate-400">
                      Mendukung kamera langsung maupun galeri dengan panduan batas pratinjau 3:4 sebelum di-upload.
                    </p>
                  </div>
                </div>
              )}

              {/* Hidden File Input */}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handlePhotoFileChange}
                className="hidden"
              />
            </div>

            {/* Reflection caption */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Catatan Refleksi / Cerita Singkat
              </label>
              <textarea
                value={caption}
                onChange={(e) => setCaption(e.target.value)}
                placeholder="Contoh: Hari ini saya bangun jam 05.00 pagi, sholat subuh, dan merapikan tempat tidur sendiri..."
                rows={3}
                className="w-full rounded-xl border border-slate-200 p-3 text-sm placeholder:text-slate-400 focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-500 transition-all"
              />
            </div>

            {/* Submit button */}
            <div className="flex justify-end pt-2">
              <Button
                type="submit"
                disabled={submitMutation.isPending}
                variant="gold"
                size="lg"
                className="w-full sm:w-auto"
              >
                {submitMutation.isPending ? "Mengirim Jurnal..." : "✨ Kirim Jurnal Kebiasaan"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* History Logbook Entries */}
      <div>
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h3 className="font-display text-lg font-bold text-slate-800">Riwayat Jurnal Foto</h3>
            <p className="text-xs text-slate-500">Semua catatan dan verifikasi dari guru serta orang tua</p>
          </div>
          <Badge variant="outline">{entries?.length ?? 0} Catatan</Badge>
        </div>

        {entriesLoading ? (
          <p className="text-center text-xs text-slate-400 py-8">Memuat riwayat...</p>
        ) : !entries || entries.length === 0 ? (
          <Card className="text-center py-10 bg-slate-50/50">
            <span className="text-4xl block mb-2">📖</span>
            <p className="text-sm font-semibold text-slate-700">Belum ada jurnal yang tercatat</p>
            <p className="text-xs text-slate-400 mt-1">Yuk mulai unggah kegiatan pertamamu hari ini!</p>
          </Card>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            {entries.map((entry) => (
              <Card key={entry.id} className="overflow-hidden border-slate-200/80 hover:border-sky-200 transition-all">
                {/* Photo if present - Mengikuti Rasio 960 x 1280 (3:4 Portrait) */}
                {entry.photoUrl && (
                  <div className="relative w-full bg-slate-950/5 p-3 sm:p-4 flex items-center justify-center border-b border-slate-100">
                    <div
                      className="relative w-full max-w-[240px] aspect-[3/4] rounded-2xl overflow-hidden shadow-md border border-slate-200/80 bg-slate-900 group cursor-pointer hover:shadow-xl hover:border-sky-300 transition-all"
                      onClick={() =>
                        setViewingPhoto({
                          url: entry.photoUrl!,
                          title: `Jurnal Foto: ${entry.habitName || "Kegiatan"}`,
                          subtitle: `${formatDateIndo(entry.date)} • ${entry.time?.slice(0, 5) || ""} WIB`,
                          caption: entry.caption,
                        })
                      }
                    >
                      <img
                        src={entry.photoUrl}
                        alt={entry.habitName || "Foto Jurnal"}
                        className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
                        loading="lazy"
                      />
                      <div className="absolute top-2 left-2 bg-slate-950/75 text-slate-200 text-[9px] font-bold px-2 py-0.5 rounded-full backdrop-blur-xs flex items-center gap-1 border border-white/10 shadow-sm">
                        <span>960 × 1280</span>
                      </div>
                      <div className="absolute inset-0 bg-slate-950/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <span className="bg-white/95 text-slate-800 text-xs font-bold px-3 py-1.5 rounded-xl shadow-lg flex items-center gap-1.5 backdrop-blur-xs transform group-hover:scale-100 scale-95 transition-all">
                          <ZoomIn className="h-3.5 w-3.5 text-sky-600" />
                          <span>Lihat Penuh</span>
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                <div className="p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <span className="text-xl">
                        {entry.caption === "Pesan dari Guru" ? "🍾" : (entry.habitIcon || "⭐")}
                      </span>
                      <span className="font-bold text-xs text-slate-800">
                        {entry.caption === "Pesan dari Guru" ? "Surat & Pesan Botol Guru" : entry.habitName}
                      </span>
                    </div>
                    {/* Status Badge */}
                    {entry.caption === "Pesan dari Guru" ? (
                      <Badge variant="gold" className="gap-1">
                        <span>✉️ Pesan Botol</span>
                      </Badge>
                    ) : (
                      <>
                        {entry.status === "verified" && (
                          <Badge variant="success" className="gap-1">
                            <CheckCircle2 className="h-3 w-3" /> Terverifikasi
                          </Badge>
                        )}
                        {entry.status === "pending" && (
                          <Badge variant="warning" className="gap-1">
                            <Clock className="h-3 w-3" /> Menunggu
                          </Badge>
                        )}
                        {entry.status === "needs_revision" && (
                          <Badge variant="danger" className="gap-1">
                            <AlertCircle className="h-3 w-3" /> Perlu Perbaikan
                          </Badge>
                        )}
                      </>
                    )}
                  </div>

                  {entry.caption !== "Pesan dari Guru" && (
                    <p className="text-xs text-slate-600 line-clamp-3 bg-slate-50 p-2.5 rounded-xl italic">
                      "{entry.caption}"
                    </p>
                  )}

                  {/* Date and time */}
                  <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1 border-t border-slate-100">
                    <span>{formatDateIndo(entry.date)}</span>
                    <span>{entry.time?.slice(0, 5)} WIB</span>
                  </div>

                  {/* Teacher Feedback */}
                  {entry.teacherComment && (
                    <div className="rounded-xl bg-sky-50/80 p-2.5 text-xs border border-sky-100">
                      <div className="flex items-center gap-1 font-bold text-sky-800 mb-0.5">
                        <span>{entry.teacherSticker || "⚓"}</span>
                        <span>Catatan Guru Pembina:</span>
                      </div>
                      <p className="text-slate-600 text-[11px]">{entry.teacherComment}</p>
                    </div>
                  )}

                  {/* Parent Comment */}
                  {entry.parentComment && (
                    <div className="rounded-xl bg-amber-50/80 p-2.5 text-xs border border-amber-100">
                      <div className="flex items-center gap-1 font-bold text-amber-800 mb-0.5">
                        <MessageCircle className="h-3.5 w-3.5" />
                        <span>Komentar Orang Tua:</span>
                      </div>
                      <p className="text-slate-600 text-[11px]">{entry.parentComment}</p>
                    </div>
                  )}
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Live Camera Viewfinder Modal */}
      <LiveCameraModal
        isOpen={isCameraModalOpen}
        onCapture={handleCameraCapture}
        onClose={() => setIsCameraModalOpen(false)}
        onFallbackToFile={() => {
          setIsCameraModalOpen(false);
          fileInputRef.current?.click();
        }}
      />

      {/* Interactive Photo Crop Preview Modal (3:4 Portrait 960 x 1280 px) */}
      <PhotoCropModal
        isOpen={isCropModalOpen}
        imageSrc={rawImageSrc}
        originalFile={rawFile}
        onConfirm={handleCropConfirm}
        onCancel={() => {
          setIsCropModalOpen(false);
          if (!photoFile) {
            setRawImageSrc(null);
            setRawFile(null);
            if (fileInputRef.current) fileInputRef.current.value = "";
          }
        }}
      />

      {/* Full Photo Preview Lightbox Modal (3:4 Portrait 960 x 1280 px) */}
      <PhotoPreviewModal
        isOpen={!!viewingPhoto}
        onClose={() => setViewingPhoto(null)}
        photoUrl={viewingPhoto?.url ?? null}
        title={viewingPhoto?.title}
        subtitle={viewingPhoto?.subtitle}
        caption={viewingPhoto?.caption}
      />
    </div>
  );
}
