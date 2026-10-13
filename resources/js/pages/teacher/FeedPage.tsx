import { useState, useEffect } from "react";
import { useClasses } from "../../hooks/use-classes";
import { usePendingLogbook, useClassLogbook, useVerifyLogbook, useRejectLogbook, useBatchVerifyLogbook } from "../../hooks/use-logbook";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { Badge } from "../../components/ui/Badge";
import { Dialog } from "../../components/ui/Dialog";
import { PhotoPreviewModal } from "../../components/PhotoPreviewModal";
import { formatDateIndo } from "../../lib/utils";
import { ClipboardCheck, CheckCircle, XCircle, Sparkles, MessageSquare, AlertCircle, ZoomIn } from "lucide-react";
import confetti from "canvas-confetti";

const STICKERS = ["⭐ Hebat!", "🌟 Luar Biasa!", "🏆 Juara!", "🚀 Terus Semangat!", "👏 Bangga Padamu!", "💪 Tangguh!"];

export function FeedPage() {
  const { data: classes, isLoading: classesLoading } = useClasses();
  const [selectedClassId, setSelectedClassId] = useState<number | null>(null);

  useEffect(() => {
    if (classes && classes.length > 0 && !selectedClassId) {
      setSelectedClassId(classes[0].id);
    }
  }, [classes, selectedClassId]);

  const classId = selectedClassId ?? 0;
  const { data: pendingEntries, isLoading: pendingLoading } = usePendingLogbook(classId);
  const { data: allEntries, isLoading: allLoading } = useClassLogbook(classId);

  const verifyMutation = useVerifyLogbook(classId);
  const rejectMutation = useRejectLogbook(classId);
  const batchVerifyMutation = useBatchVerifyLogbook(classId);

  // Modal feedback state
  const [feedbackModalOpen, setFeedbackModalOpen] = useState(false);
  const [activeEntryId, setActiveEntryId] = useState<number | null>(null);
  const [feedbackComment, setFeedbackComment] = useState("");
  const [selectedSticker, setSelectedSticker] = useState<string>(STICKERS[0]);

  // Selected for batch verify
  const [selectedIds, setSelectedIds] = useState<number[]>([]);

  // Photo preview modal state
  const [viewingPhoto, setViewingPhoto] = useState<{
    url: string;
    title: string;
    subtitle?: string;
    caption?: string;
  } | null>(null);

  const handleQuickVerify = async (entryId: number) => {
    try {
      await verifyMutation.mutateAsync({ entryId, sticker: "⭐ Hebat!" });
      confetti({ particleCount: 40, spread: 50, origin: { y: 0.6 } });
    } catch {
      // ignore
    }
  };

  const handleOpenFeedbackModal = (entryId: number) => {
    setActiveEntryId(entryId);
    setFeedbackComment("");
    setSelectedSticker(STICKERS[0]);
    setFeedbackModalOpen(true);
  };

  const handleCustomVerify = async () => {
    if (!activeEntryId) return;
    try {
      await verifyMutation.mutateAsync({
        entryId: activeEntryId,
        comment: feedbackComment || undefined,
        sticker: selectedSticker,
      });
      setFeedbackModalOpen(false);
      confetti({ particleCount: 50, spread: 60, origin: { y: 0.6 } });
    } catch {
      // ignore
    }
  };

  const handleReject = async (entryId: number) => {
    const comment = prompt("Catatan perbaikan untuk siswa (wajib diisi):");
    if (comment === null) return;
    if (!comment.trim()) {
      alert("Harap berikan catatan perbaikan agar siswa memahami apa yang perlu diperbaiki.");
      return;
    }
    try {
      await rejectMutation.mutateAsync({ entryId, comment: comment.trim() });
    } catch {
      // ignore
    }
  };

  const toggleSelect = (id: number) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    if (!pendingEntries) return;
    if (selectedIds.length === pendingEntries.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(pendingEntries.map((e) => e.id));
    }
  };

  const handleBatchVerify = async () => {
    if (selectedIds.length === 0) return;
    try {
      await batchVerifyMutation.mutateAsync({
        entryIds: selectedIds,
        sticker: "👍",
        comment: "Bagus, Kapten! Lanjutkan!",
      });
      setSelectedIds([]);
      confetti({ particleCount: 80, spread: 70, origin: { y: 0.6 } });
    } catch {
      // ignore
    }
  };

  return (
    <div className="space-y-6">
      {/* Header section with class selector */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="font-display text-2xl font-bold text-slate-800">Verifikasi Jurnal Karakter</h2>
          <p className="text-xs text-slate-500">Tinjau foto bukti kegiatan harian siswa dan berikan apresiasi</p>
        </div>

        {/* Class selector */}
        {classes && classes.length > 0 && (
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-600">Pilih Kelas:</span>
            <select
              value={selectedClassId ?? ""}
              onChange={(e) => setSelectedClassId(Number(e.target.value))}
              className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 shadow-xs focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500"
            >
              {classes.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.classCode} — {c.shipName}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Pending verification queue card */}
      <Card className="border-sky-100 shadow-md">
        <CardHeader className="flex flex-row items-center justify-between pb-3">
          <div className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-amber-100 text-amber-700">
              <ClipboardCheck className="h-4 w-4" />
            </span>
            <div>
              <CardTitle className="text-base text-slate-800">Antrean Verifikasi</CardTitle>
              <CardDescription className="text-xs">
                Jurnal siswa yang menunggu persetujuan ({pendingEntries?.length ?? 0} entri)
              </CardDescription>
            </div>
          </div>

          {pendingEntries && pendingEntries.length > 0 && (
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={handleSelectAll}
                className="text-xs"
              >
                {selectedIds.length === pendingEntries.length ? "Batal Pilih" : "Pilih Semua"}
              </Button>
              {selectedIds.length > 0 && (
                <Button
                  size="sm"
                  variant="gold"
                  onClick={handleBatchVerify}
                  disabled={batchVerifyMutation.isPending}
                  className="text-xs"
                >
                  <Sparkles className="h-3.5 w-3.5" />
                  <span>Verifikasi Sekaligus ({selectedIds.length})</span>
                </Button>
              )}
            </div>
          )}
        </CardHeader>

        <CardContent>
          {pendingLoading ? (
            <p className="text-center py-8 text-xs text-slate-400">Memuat antrean jurnal...</p>
          ) : !pendingEntries || pendingEntries.length === 0 ? (
            <div className="text-center py-8 text-slate-500">
              <span className="text-3xl block mb-2">🎉</span>
              <p className="text-xs font-semibold">Semua jurnal siswa sudah selesai diverifikasi!</p>
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2">
              {pendingEntries.map((entry) => {
                const isSelected = selectedIds.includes(entry.id);

                return (
                  <Card
                    key={entry.id}
                    className={`overflow-hidden border transition-all ${
                      isSelected ? "border-sky-400 ring-2 ring-sky-200 bg-sky-50/20" : "border-slate-200 bg-white"
                    }`}
                  >
                    {/* Header info */}
                    <div className="flex items-center justify-between p-3 border-b border-slate-100 bg-slate-50/50">
                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => toggleSelect(entry.id)}
                          className="h-4 w-4 rounded text-sky-600 focus:ring-sky-500 cursor-pointer"
                        />
                        <span className="text-lg">{entry.studentAvatar || "🧑"}</span>
                        <div>
                          <p className="font-bold text-xs text-slate-800">{entry.studentName}</p>
                          <p className="text-[10px] text-slate-400">{formatDateIndo(entry.date)}</p>
                        </div>
                      </div>
                      <Badge variant="outline" className="text-[10px]">
                        {entry.habitIcon} {entry.habitName}
                      </Badge>
                    </div>

                    {/* Photo proof - Mengikuti Rasio 3:4 Portrait (960 x 1280 px) */}
                    {entry.photoUrl && (
                      <div className="relative w-full bg-slate-950/5 p-3 sm:p-4 flex items-center justify-center border-b border-slate-100">
                        <div
                          className="relative w-full max-w-[240px] aspect-[3/4] rounded-2xl overflow-hidden shadow-md border border-slate-200/80 bg-slate-900 group cursor-pointer hover:shadow-xl hover:border-sky-300 transition-all"
                          onClick={() =>
                            setViewingPhoto({
                              url: entry.photoUrl!,
                              title: `Jurnal Foto: ${entry.habitName || "Kegiatan"}`,
                              subtitle: `${entry.studentName} • ${formatDateIndo(entry.date)}`,
                              caption: entry.caption,
                            })
                          }
                        >
                          <img
                            src={entry.photoUrl}
                            alt={`Bukti kegiatan ${entry.studentName}`}
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

                    {/* Caption */}
                    <div className="p-3.5 space-y-3">
                      <p className="text-xs text-slate-600 bg-slate-50 p-2.5 rounded-xl italic">
                        "{entry.caption}"
                      </p>

                      {/* Action buttons */}
                      <div className="flex items-center gap-2 pt-1">
                        <Button
                          size="sm"
                          variant="emerald"
                          onClick={() => handleQuickVerify(entry.id)}
                          disabled={verifyMutation.isPending}
                          className="flex-1 text-xs"
                        >
                          <CheckCircle className="h-3.5 w-3.5" />
                          <span>Verifikasi</span>
                        </Button>
                        <Button
                          size="sm"
                          variant="gold"
                          onClick={() => handleOpenFeedbackModal(entry.id)}
                          className="text-xs"
                          title="Beri Stiker & Pesan"
                        >
                          <Sparkles className="h-3.5 w-3.5" />
                          <span>Stiker</span>
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleReject(entry.id)}
                          className="text-xs text-rose-600 hover:bg-rose-50"
                          title="Tolak / Revisi"
                        >
                          <XCircle className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Modal to give sticker and encouragement message */}
      <Dialog
        open={feedbackModalOpen}
        onClose={() => setFeedbackModalOpen(false)}
        title="Apresiasi & Verifikasi Jurnal"
        description="Pilih stiker motivasi dan tuliskan catatan penguatan untuk siswa"
      >
        <div className="space-y-4 pt-2">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-2">
              Pilih Stiker Apresiasi
            </label>
            <div className="grid grid-cols-3 gap-2">
              {STICKERS.map((stk) => (
                <button
                  key={stk}
                  type="button"
                  onClick={() => setSelectedSticker(stk)}
                  className={`rounded-xl p-2 text-xs font-bold transition-all cursor-pointer ${
                    selectedSticker === stk
                      ? "bg-amber-400 text-amber-950 shadow-md scale-102"
                      : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                  }`}
                >
                  {stk}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
              Catatan untuk Siswa (Opsional)
            </label>
            <textarea
              value={feedbackComment}
              onChange={(e) => setFeedbackComment(e.target.value)}
              placeholder="Contoh: Sangat bagus Budi! Kebiasaan bangun pagimu sudah sangat teratur."
              rows={3}
              className="w-full rounded-xl border border-slate-200 p-2.5 text-xs focus:ring-2 focus:ring-sky-500 focus:outline-none"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" size="sm" onClick={() => setFeedbackModalOpen(false)}>
              Batal
            </Button>
            <Button variant="gold" size="sm" onClick={handleCustomVerify} disabled={verifyMutation.isPending}>
              Kirim Apresiasi & Verifikasi ✨
            </Button>
          </div>
        </div>
      </Dialog>

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
