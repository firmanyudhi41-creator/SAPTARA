import { useState } from "react";
import { useParentInfo } from "../../hooks/use-auth";
import { useStudentLogbook, useAddParentComment } from "../../hooks/use-logbook";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";
import { Badge } from "../../components/ui/Badge";
import { Dialog } from "../../components/ui/Dialog";
import { PhotoPreviewModal } from "../../components/PhotoPreviewModal";
import { formatDateIndo } from "../../lib/utils";
import { HeartHandshake, CheckCircle2, MessageCircle, Sparkles, Send, UserPlus, Users, Loader2, ZoomIn } from "lucide-react";
import confetti from "canvas-confetti";
import { authService } from "../../services/auth.service";
import { useQueryClient } from "@tanstack/react-query";
import { logbookKeys } from "../../hooks/use-logbook";

export function ParentFeedPage() {
  const parentInfo = useParentInfo();
  const studentId = parentInfo?.studentId ?? 0;
  const { data: entries, isLoading } = useStudentLogbook(studentId);
  const commentMutation = useAddParentComment(studentId);
  const queryClient = useQueryClient();

  // Comment dialog state
  const [commentModalOpen, setCommentModalOpen] = useState(false);
  const [activeEntryId, setActiveEntryId] = useState<number | null>(null);
  const [commentText, setCommentText] = useState("");

  // Link child dialog state
  const [linkModalOpen, setLinkModalOpen] = useState(false);
  const [linkChildName, setLinkChildName] = useState("");
  const [linkClassCode, setLinkClassCode] = useState("");
  const [linkError, setLinkError] = useState("");
  const [linkLoading, setLinkLoading] = useState(false);

  // Photo preview modal state
  const [viewingPhoto, setViewingPhoto] = useState<{
    url: string;
    title: string;
    subtitle?: string;
    caption?: string;
  } | null>(null);

  const handleOpenComment = (entryId: number) => {
    setActiveEntryId(entryId);
    setCommentText("");
    setCommentModalOpen(true);
  };

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeEntryId || !commentText.trim()) return;

    try {
      await commentMutation.mutateAsync({
        entryId: activeEntryId,
        comment: commentText.trim(),
      });
      setCommentModalOpen(false);
      setCommentText("");
      confetti({
        particleCount: 40,
        spread: 60,
        origin: { y: 0.6 },
      });
    } catch {
      // error handled by query mutation
    }
  };

  const handleLinkChild = async (e: React.FormEvent) => {
    e.preventDefault();
    setLinkError("");
    setLinkLoading(true);

    try {
      await authService.linkChild({
        childName: linkChildName.trim(),
        classCode: linkClassCode.trim(),
      });
      // Invalidate student and logbook queries to refresh active child
      queryClient.invalidateQueries({ queryKey: logbookKeys.all });
      setLinkModalOpen(false);
      setLinkChildName("");
      setLinkClassCode("");
      alert("Profil anak berhasil dihubungkan! Halaman akan memuat data terbaru.");
      window.location.reload();
    } catch (err: any) {
      setLinkError(err?.response?.data?.message || err?.message || "Gagal menghubungkan profil anak. Periksa kembali nama dan kode kelas.");
    } finally {
      setLinkLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Info */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="font-display text-2xl font-bold text-slate-800 flex items-center gap-2">
            <HeartHandshake className="h-6 w-6 text-emerald-600" />
            Jurnal Pelayaran Karakter Ananda
          </h2>
          <p className="text-xs text-slate-500">
            Pantau dan beri apresiasi catatan kebiasaan baik anak tercinta setiap hari
          </p>
        </div>

        {/* Action Button: Hubungkan Anak Lain jika punya lebih dari 1 siswa */}
        <Button
          onClick={() => {
            setLinkError("");
            setLinkModalOpen(true);
          }}
          variant="outline"
          size="sm"
          className="self-start sm:self-auto border-emerald-300 text-emerald-700 hover:bg-emerald-50"
        >
          <UserPlus className="h-4 w-4 mr-1.5" />
          Hubungkan Anak Lain
        </Button>
      </div>

      {/* Main Content: Feed Jurnal */}
      <Card className="border-emerald-100 shadow-md">
        <CardHeader className="pb-3 border-b border-slate-100">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-base text-slate-800">
                Aktivitas Terbaru
              </CardTitle>
              <CardDescription className="text-xs">
                {parentInfo?.studentName ? `Catatan harian ananda ${parentInfo.studentName}` : "Catatan harian siswa"}
              </CardDescription>
            </div>
            <Badge variant="outline" className="text-emerald-700 border-emerald-200 bg-emerald-50 text-[11px]">
              {entries?.length ?? 0} Catatan
            </Badge>
          </div>
        </CardHeader>

        <CardContent className="pt-4">
          {isLoading ? (
            <p className="text-center py-8 text-xs text-slate-400">Memuat jurnal ananda...</p>
          ) : !entries || entries.length === 0 ? (
            <Card className="text-center py-10 bg-slate-50/50">
              <span className="text-4xl block mb-2">🌿</span>
              <p className="text-sm font-semibold text-slate-700">Belum ada jurnal yang tercatat</p>
              <p className="text-xs text-slate-400 mt-1">
                Ajak ananda untuk mencatat kegiatan positifnya hari ini!
              </p>
            </Card>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2">
              {entries.map((entry) => (
                <Card key={entry.id} className="overflow-hidden border-slate-200/80 hover:border-emerald-200 transition-all">
                  {/* Photo proof - Mengikuti Rasio 3:4 Portrait (960 x 1280 px) */}
                  {entry.photoUrl && (
                    <div className="relative w-full bg-slate-950/5 p-3 sm:p-4 flex items-center justify-center border-b border-slate-100">
                      <div
                        className="relative w-full max-w-[240px] aspect-[3/4] rounded-2xl overflow-hidden shadow-md border border-slate-200/80 bg-slate-900 group cursor-pointer hover:shadow-xl hover:border-emerald-300 transition-all"
                        onClick={() =>
                          setViewingPhoto({
                            url: entry.photoUrl!,
                            title: `Jurnal Foto: ${entry.habitName || "Kegiatan"}`,
                            subtitle: `${parentInfo?.studentName || "Ananda"} • ${formatDateIndo(entry.date)}`,
                            caption: entry.caption,
                          })
                        }
                      >
                        <img
                          src={entry.photoUrl}
                          alt={entry.habitName}
                          className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
                          loading="lazy"
                        />
                        <div className="absolute top-2 left-2 bg-slate-950/75 text-slate-200 text-[9px] font-bold px-2 py-0.5 rounded-full backdrop-blur-xs flex items-center gap-1 border border-white/10 shadow-sm">
                          <span>960 × 1280</span>
                        </div>
                        <div className="absolute inset-0 bg-slate-950/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <span className="bg-white/95 text-slate-800 text-xs font-bold px-3 py-1.5 rounded-xl shadow-lg flex items-center gap-1.5 backdrop-blur-xs transform group-hover:scale-100 scale-95 transition-all">
                            <ZoomIn className="h-3.5 w-3.5 text-emerald-600" />
                            <span>Lihat Penuh</span>
                          </span>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <span className="text-xl">{entry.habitIcon || "⭐"}</span>
                        <span className="font-bold text-xs text-slate-800">{entry.habitName}</span>
                      </div>
                      {entry.status === "verified" ? (
                        <Badge variant="success" className="gap-1">
                          <CheckCircle2 className="h-3 w-3" /> Disetujui Guru
                        </Badge>
                      ) : (
                        <Badge variant="warning" className="gap-1">
                          Menunggu Guru
                        </Badge>
                      )}
                    </div>

                    <p className="text-xs text-slate-600 bg-slate-50 p-2.5 rounded-xl">
                      "{entry.caption}"
                    </p>

                    <div className="flex items-center justify-between text-[11px] text-slate-400">
                      <span>📅 {formatDateIndo(entry.date)}</span>
                      <span className="font-semibold text-emerald-600">+{entry.xpEarned} mil</span>
                    </div>

                    {/* Teacher Feedback if any */}
                    {entry.teacherComment && (
                      <div className="rounded-xl bg-sky-50/70 p-2.5 text-xs border border-sky-100">
                        <div className="flex items-center gap-1 font-bold text-sky-800 mb-0.5">
                          <span>{entry.teacherSticker || "⚓"}</span>
                          <span>Apresiasi Guru:</span>
                        </div>
                        <p className="text-slate-600 text-[11px]">{entry.teacherComment}</p>
                      </div>
                    )}

                    {/* Parent Comment Section */}
                    {entry.parentComment ? (
                      <div className="rounded-xl bg-emerald-50/70 p-2.5 text-xs border border-emerald-100">
                        <div className="flex items-center gap-1 font-bold text-emerald-800 mb-0.5">
                          <MessageCircle className="h-3.5 w-3.5" />
                          <span>Pesan Anda:</span>
                        </div>
                        <p className="text-slate-600 text-[11px]">{entry.parentComment}</p>
                      </div>
                    ) : (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleOpenComment(entry.id)}
                        className="w-full text-xs border-emerald-200 text-emerald-700 hover:bg-emerald-50"
                      >
                        <MessageCircle className="h-3.5 w-3.5 mr-1" />
                        Beri Kata Penyemangat
                      </Button>
                    )}
                  </div>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Modal Beri Komentar */}
      <Dialog
        isOpen={commentModalOpen}
        onClose={() => setCommentModalOpen(false)}
        title="Beri Kata Penyemangat untuk Ananda 🌿"
        description="Dukungan dan apresiasi dari orang tua adalah motivasi terbesar untuk pembentukan karakter anak."
      >
        <form onSubmit={handleSubmitComment} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Pesan / Komentar Anda
            </label>
            <textarea
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              placeholder="Contoh: Hebat sekali nak! Terus pertahankan ya sayang, Ayah dan Ibu bangga."
              rows={4}
              required
              className="w-full rounded-2xl border border-slate-200 p-3 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setCommentModalOpen(false)}
            >
              Batal
            </Button>
            <Button
              type="submit"
              disabled={commentMutation.isPending}
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold"
            >
              <Send className="h-3.5 w-3.5 mr-1" />
              {commentMutation.isPending ? "Mengirim..." : "Kirim Penyemangat"}
            </Button>
          </div>
        </form>
      </Dialog>

      {/* Modal Hubungkan Anak Tambahan */}
      <Dialog
        isOpen={linkModalOpen}
        onClose={() => setLinkModalOpen(false)}
        title="Hubungkan Profil Anak Lain 🧑"
        description="Masukkan nama lengkap dan kode akses kelas anak Anda untuk dipantau dalam satu akun orang tua."
      >
        <form onSubmit={handleLinkChild} className="space-y-4">
          {linkError && (
            <div className="rounded-xl bg-red-50 p-3 text-xs text-red-600 border border-red-200">
              {linkError}
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Nama Lengkap Anak (Siswa) <span className="text-red-500">*</span>
            </label>
            <Input
              value={linkChildName}
              onChange={(e) => setLinkChildName(e.target.value)}
              placeholder="Sesuai nama yang didaftarkan guru di kelas"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Kode Kelas Anak <span className="text-red-500">*</span>
            </label>
            <Input
              value={linkClassCode}
              onChange={(e) => setLinkClassCode(e.target.value)}
              placeholder="Contoh: KLS-7A"
              required
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setLinkModalOpen(false)}
              disabled={linkLoading}
            >
              Batal
            </Button>
            <Button
              type="submit"
              disabled={linkLoading}
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold"
            >
              {linkLoading ? "Menghubungkan..." : "Hubungkan Anak"}
            </Button>
          </div>
        </form>
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
