import { useState } from "react";
import { useStudentInfo } from "../../hooks/use-auth";
import { useStudentDashboard } from "../../hooks/use-students";
import { useAccessories, useStudentAccessories, usePurchaseAccessory, useStudentBadges, useStudentMessages } from "../../hooks/use-rewards";
import { ShipEvolution } from "../../components/ShipEvolution";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { Badge } from "../../components/ui/Badge";
import { Coins, ShoppingBag, Award, Sparkles, AlertCircle, Mail, MessageSquare } from "lucide-react";
import { formatDateIndo } from "../../lib/utils";
import confetti from "canvas-confetti";

export function ShipPage() {
  const studentInfo = useStudentInfo();
  const studentId = studentInfo?.studentId ?? 0;
  const { data: dashboard } = useStudentDashboard(studentId);
  const { data: storeAccessories, isLoading: storeLoading } = useAccessories();
  const { data: ownedAccessories } = useStudentAccessories(studentId);
  const { data: badges } = useStudentBadges(studentId);
  const { data: messages } = useStudentMessages(studentId);

  const purchaseMutation = usePurchaseAccessory(studentId);
  const [purchaseMsg, setPurchaseMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const ownedMap = new Set(ownedAccessories?.filter((a) => a.owned).map((a) => a.id) ?? []);
  const currentCoins = dashboard?.student?.coins ?? 0;

  const handlePurchase = async (accessoryId: string, price: number, name: string) => {
    setPurchaseMsg(null);
    if (currentCoins < price) {
      setPurchaseMsg({ type: "error", text: `Koin emasmu belum cukup (${currentCoins}/${price}). Jalankan lebih banyak kebiasaan baik!` });
      return;
    }

    try {
      await purchaseMutation.mutateAsync(accessoryId);
      confetti({
        particleCount: 70,
        spread: 60,
        origin: { y: 0.7 },
        colors: ["#f59e0b", "#fbbf24", "#0ea5e9"],
      });
      setPurchaseMsg({ type: "success", text: `Hore! Kamu berhasil memasang aksesoris ${name} di kapalmu!` });
    } catch (err: any) {
      setPurchaseMsg({ type: "error", text: err.message || "Gagal membeli aksesoris" });
    }
  };

  return (
    <div className="mx-auto max-w-4xl px-4 py-6 pb-24 space-y-8">
      <div>
        <h1 className="font-display text-2xl font-bold text-slate-900">
          Dermaga & Kapal Layarku ⛵
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Kembangkan kapalmu dari rakit sederhana menjadi kapal megah kebanggaan Nusantara
        </p>
      </div>

      {/* Ship Evolution view */}
      <ShipEvolution studentId={studentId} />

      {/* Pesan dalam Botol / Surat Motivasi dari Guru */}
      <Card className="border-sky-200/80 bg-gradient-to-r from-sky-50/50 via-white to-blue-50/30 shadow-xs">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-2xl">🍾</span>
              <div>
                <CardTitle className="text-base text-sky-950 flex items-center gap-2">
                  <span>Pesan Botol di Dek Kapal</span>
                  {messages && messages.length > 0 && (
                    <span className="text-[10px] font-bold bg-sky-100 text-sky-700 px-2 py-0.5 rounded-full border border-sky-200">
                      {messages.length} Surat Terdampar
                    </span>
                  )}
                </CardTitle>
                <CardDescription>Surat motivasi dan apresiasi rahasia dari Bapak/Ibu Guru yang terdampar di kapalmu</CardDescription>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {!messages || messages.length === 0 ? (
            <div className="text-center py-6 px-4 rounded-2xl bg-slate-50/60 border border-dashed border-slate-200">
              <span className="text-3xl block mb-1">🌊</span>
              <p className="font-bold text-xs text-slate-700">Belum ada pesan botol yang terdampar</p>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Rajinlah menjalankan kebiasaan baik dan mencatat jurnal foto agar Gurumu mengirimkan surat apresiasi!
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className="rounded-2xl border border-sky-200/80 bg-white p-4 shadow-xs hover:border-sky-300 transition-all space-y-2 relative overflow-hidden"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="h-8 w-8 rounded-full bg-sky-100 flex items-center justify-center text-lg shrink-0">
                        {msg.sticker || "⭐"}
                      </div>
                      <div>
                        <p className="text-xs font-bold text-slate-900">{msg.teacherName || "Guru Pembina"}</p>
                        <p className="text-[10px] text-slate-400">
                          {formatDateIndo(msg.date)} {msg.time ? `• ${msg.time} WIB` : ""}
                        </p>
                      </div>
                    </div>
                    <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                      +10 XP Didapat
                    </span>
                  </div>

                  <p className="text-xs text-slate-700 bg-sky-50/60 p-3 rounded-xl italic border border-sky-100/80 leading-relaxed">
                    "{msg.comment}"
                  </p>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Badges / Piagam Penghargaan */}
      <Card className="border-amber-200/80 bg-gradient-to-r from-amber-50/40 via-white to-amber-50/30">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Award className="h-5 w-5 text-amber-600" />
            <div>
              <CardTitle className="text-base text-amber-950">Piagam & Lencana Apresiasi Guru</CardTitle>
              <CardDescription>Lencana istimewa yang disematkan langsung oleh Bapak/Ibu Guru untuk ketekunanmu</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {!badges || badges.length === 0 ? (
            <p className="text-center py-6 text-xs text-slate-400">
              Belum ada lencana yang diterima. Tetap konsisten dan buat gurumu bangga!
            </p>
          ) : (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {badges.map((b) => (
                <div
                  key={b.id}
                  className="flex flex-col items-center rounded-2xl border border-amber-200 bg-white p-3 text-center shadow-xs"
                >
                  <span className="text-3xl mb-1">{b.badgeIcon || "🏅"}</span>
                  <p className="font-bold text-xs text-slate-800">{b.badgeName || "Lencana Teladan"}</p>
                  <p className="text-[10px] text-amber-700 mt-0.5">{b.habitName}</p>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Accessories Shop */}
      <Card className="border-sky-100 shadow-sm">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShoppingBag className="h-5 w-5 text-sky-600" />
              <div>
                <CardTitle className="text-base">Toko Aksesoris Kapal</CardTitle>
                <CardDescription>Tukarkan koin emas kebiasaanmu dengan berbagai hiasan kapal keren</CardDescription>
              </div>
            </div>
            <div className="flex items-center gap-1.5 rounded-full bg-yellow-50 border border-yellow-200 px-3.5 py-1 text-xs font-bold text-yellow-800">
              <Coins className="h-4 w-4 text-yellow-500" />
              <span>{currentCoins} Koin Emas</span>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          {purchaseMsg && (
            <div
              className={`mb-4 flex items-center gap-2 rounded-xl p-3 text-xs font-semibold ${
                purchaseMsg.type === "success"
                  ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                  : "bg-rose-50 text-rose-700 border border-rose-200"
              }`}
            >
              {purchaseMsg.type === "success" ? <Sparkles className="h-4 w-4 shrink-0" /> : <AlertCircle className="h-4 w-4 shrink-0" />}
              <span>{purchaseMsg.text}</span>
            </div>
          )}

          {storeLoading ? (
            <p className="text-center py-8 text-xs text-slate-400">Menata barang toko...</p>
          ) : (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {storeAccessories?.map((item) => {
                const isOwned = ownedMap.has(item.id);

                return (
                  <div
                    key={item.id}
                    className="flex flex-col items-center justify-between rounded-2xl border border-slate-200 bg-white p-3.5 text-center transition-all hover:border-sky-300"
                  >
                    <span className="text-3xl mb-1">{item.icon}</span>
                    <h4 className="font-bold text-xs text-slate-800">{item.name}</h4>
                    <p className="text-[10px] text-slate-400 capitalize mb-2">{item.type}</p>

                    <div className="w-full mt-1">
                      {isOwned ? (
                        <Badge variant="success" className="w-full justify-center py-1">
                          Sudah Dimiliki
                        </Badge>
                      ) : (
                        <Button
                          size="sm"
                          variant="gold"
                          disabled={purchaseMutation.isPending}
                          onClick={() => handlePurchase(item.id, item.price, item.name)}
                          className="w-full text-xs py-1 h-8"
                        >
                          <Coins className="h-3 w-3" />
                          <span>{item.price} Koin</span>
                        </Button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
