import { useLeaderboard } from "../hooks/use-students";

interface LeaderboardProps {
  classId: number;
}

// Ship level helper
function getShipEmoji(xp: number): string {
  if (xp >= 600) return "🚢";
  if (xp >= 300) return "⛵";
  if (xp >= 100) return "🚣";
  return "🪵";
}

/**
 * Leaderboard Component
 *
 * Displays class rankings sorted by XP with ship level indicators.
 */
export function Leaderboard({ classId }: LeaderboardProps) {
  const { data: leaderboard, isLoading } = useLeaderboard(classId);

  if (isLoading) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: 200 }}>
        <p style={{ opacity: 0.6 }}>Memuat papan peringkat...</p>
      </div>
    );
  }

  if (!leaderboard || leaderboard.length === 0) {
    return (
      <div style={{ textAlign: "center", padding: 32 }}>
        <p>🏆 Belum ada data peringkat</p>
      </div>
    );
  }

  const rankEmoji = (rank: number) => {
    switch (rank) {
      case 1: return "🥇";
      case 2: return "🥈";
      case 3: return "🥉";
      default: return `#${rank}`;
    }
  };

  return (
    <div className="leaderboard" id="leaderboard">
      {/* Top 3 podium */}
      <div className="leaderboard__podium">
        {leaderboard.slice(0, 3).map((entry, idx) => (
          <div key={entry.studentId} className={`podium-card rank-${idx + 1}`}>
            <div className="podium-card__rank">{rankEmoji(idx + 1)}</div>
            <div className="podium-card__avatar">{entry.avatar}</div>
            <div className="podium-card__name">{entry.name}</div>
            <div className="podium-card__xp">
              {getShipEmoji(entry.xp)} {entry.xp} mil
            </div>
            <div className="podium-card__streak">🔥 {entry.streak} hari</div>
          </div>
        ))}
      </div>

      {/* Full list */}
      <div className="leaderboard__list">
        {leaderboard.map((entry, idx) => (
          <div key={entry.studentId} className={`leaderboard-row ${idx < 3 ? "top-3" : ""}`}>
            <span className="leaderboard-row__rank">{rankEmoji(idx + 1)}</span>
            <span className="leaderboard-row__avatar">{entry.avatar}</span>
            <span className="leaderboard-row__name">{entry.name}</span>
            <span className="leaderboard-row__ship">{getShipEmoji(entry.xp)}</span>
            <span className="leaderboard-row__xp">{entry.xp} mil</span>
            <span className="leaderboard-row__streak">🔥 {entry.streak}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
