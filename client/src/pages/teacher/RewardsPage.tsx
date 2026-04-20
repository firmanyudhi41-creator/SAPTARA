import { useState } from "react";
import { Navbar } from "../../components/Navbar";
import { useClasses, useClassStudents } from "../../hooks/use-classes";
import { useHabits } from "../../hooks/use-habits";
import { useStudentBadges, useAwardBadge, useSendBottleMessage } from "../../hooks/use-rewards";

/**
 * Teacher Rewards Page
 *
 * Teacher can:
 * - Award badges to students
 * - Send bottle messages (encouragement notes)
 * - View which students have earned which badges
 */
export function RewardsPage() {
  const { data: classes } = useClasses();
  const { data: habits } = useHabits();
  const [selectedClassId, setSelectedClassId] = useState<number>(0);
  const [selectedStudentId, setSelectedStudentId] = useState<number>(0);
  const [messageText, setMessageText] = useState("");

  const activeClassId = selectedClassId || classes?.[0]?.id || 0;
  const { data: students } = useClassStudents(activeClassId);
  const { data: badges } = useStudentBadges(selectedStudentId);
  const awardBadge = useAwardBadge();
  const sendMessage = useSendBottleMessage();

  const badgeSet = new Set(badges?.map((b) => b.habitId) ?? []);

  const handleAwardBadge = (habitId: number) => {
    if (!selectedStudentId) return;
    awardBadge.mutate({ studentId: selectedStudentId, habitId });
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStudentId || !messageText) return;
    sendMessage.mutate(
      { studentId: selectedStudentId, comment: messageText, sticker: "🪙" },
      { onSuccess: () => setMessageText("") }
    );
  };

  return (
    <div className="teacher-page" id="teacher-rewards-page">
      <div className="page-header">
        <h1 className="page-title">🏅 Reward & Lencana</h1>
        <p className="page-subtitle">Berikan penghargaan untuk kapten cilik</p>
      </div>

      {/* Class & student selectors */}
      <div className="reward-selectors">
        <select
          className="class-selector"
          value={activeClassId}
          onChange={(e) => {
            setSelectedClassId(Number(e.target.value));
            setSelectedStudentId(0);
          }}
          id="rewards-class-select"
        >
          {classes?.map((cls) => (
            <option key={cls.id} value={cls.id}>
              {cls.shipName} — {cls.classCode}
            </option>
          ))}
        </select>

        <select
          className="student-selector"
          value={selectedStudentId}
          onChange={(e) => setSelectedStudentId(Number(e.target.value))}
          id="rewards-student-select"
        >
          <option value={0}>— Pilih murid —</option>
          {students?.map((s) => (
            <option key={s.id} value={s.id}>
              {s.avatar} {s.name}
            </option>
          ))}
        </select>
      </div>

      {selectedStudentId > 0 && (
        <>
          {/* Badge Grid */}
          <div className="badge-grid">
            <h3 className="section-title">🎖️ Lencana Kebiasaan</h3>
            <div className="badges">
              {habits?.map((habit) => {
                const earned = badgeSet.has(habit.id);
                return (
                  <div key={habit.id} className={`badge-card ${earned ? "earned" : ""}`}>
                    <span className="badge-card__icon">{habit.badgeIcon}</span>
                    <span className="badge-card__name">{habit.badge}</span>
                    <span className="badge-card__habit">{habit.icon} {habit.name}</span>
                    {earned ? (
                      <span className="badge-card__status">✅ Diraih</span>
                    ) : (
                      <button
                        className="btn btn-sm btn-primary"
                        onClick={() => handleAwardBadge(habit.id)}
                        disabled={awardBadge.isPending}
                        type="button"
                      >
                        🏅 Berikan
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
            {awardBadge.isError && (
              <p className="error-text">❌ {awardBadge.error.message}</p>
            )}
          </div>

          {/* Bottle Message */}
          <div className="bottle-message">
            <h3 className="section-title">📬 Pesan Botol</h3>
            <p className="section-desc">Kirim pesan semangat untuk kapten cilik!</p>
            <form onSubmit={handleSendMessage} className="bottle-form">
              <textarea
                value={messageText}
                onChange={(e) => setMessageText(e.target.value)}
                placeholder="Tulis pesan semangat..."
                rows={3}
                required
                id="bottle-message-text"
              />
              <button
                type="submit"
                className="btn btn-primary"
                disabled={sendMessage.isPending || !messageText}
              >
                {sendMessage.isPending ? "Mengirim..." : "📬 Kirim Pesan Botol"}
              </button>
              {sendMessage.isSuccess && (
                <p className="success-text">✅ Pesan terkirim!</p>
              )}
              {sendMessage.isError && (
                <p className="error-text">❌ {sendMessage.error.message}</p>
              )}
            </form>
          </div>
        </>
      )}

      <Navbar role="teacher" />
    </div>
  );
}
