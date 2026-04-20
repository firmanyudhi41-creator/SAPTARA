import { useHabits, useHabitScores } from "../hooks/use-habits";

interface RadarChartProps {
  studentId: number;
}

/**
 * RadarChart / Compass Component
 *
 * Renders a radar chart (SVG) showing the student's 7 habit scores.
 * Merges habit info (name, icon, color) with score percentages from API.
 */
export function RadarChart({ studentId }: RadarChartProps) {
  const { data: rawScores, isLoading: scoresLoading } = useHabitScores(studentId);
  const { data: habits, isLoading: habitsLoading } = useHabits();

  const isLoading = scoresLoading || habitsLoading;

  if (isLoading) {
    return (
      <div className="radar-chart" style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: 300 }}>
        <p style={{ opacity: 0.6 }}>Memuat kompas karakter...</p>
      </div>
    );
  }

  if (!habits || habits.length === 0) {
    return (
      <div className="radar-chart" style={{ textAlign: "center", padding: 32 }}>
        <p>Belum ada data kompas</p>
      </div>
    );
  }

  // Merge habits with scores — rawScores is Record<habitId, scorePercent>
  const scoreMap = rawScores as unknown as Record<number, number> ?? {};
  const scores = habits.map((h) => ({
    habitId: h.id,
    name: h.name,
    icon: h.icon,
    color: h.color,
    score: scoreMap[h.id] ?? 0,
  }));

  const numAxes = scores.length;
  const centerX = 150;
  const centerY = 150;
  const maxRadius = 120;
  const angleStep = (2 * Math.PI) / numAxes;

  // Calculate point positions for the data polygon
  const dataPoints = scores.map((score, i) => {
    const angle = i * angleStep - Math.PI / 2;
    const radius = (score.score / 100) * maxRadius;
    return {
      x: centerX + radius * Math.cos(angle),
      y: centerY + radius * Math.sin(angle),
    };
  });

  const dataPath = dataPoints.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ") + " Z";

  // Grid circles
  const gridLevels = [0.2, 0.4, 0.6, 0.8, 1.0];

  return (
    <div className="radar-chart" id="radar-chart">
      <svg viewBox="0 0 300 300" className="radar-chart__svg">
        {/* Grid circles */}
        {gridLevels.map((level) => (
          <circle
            key={level}
            cx={centerX}
            cy={centerY}
            r={maxRadius * level}
            fill="none"
            stroke="rgba(255,255,255,0.1)"
            strokeWidth="1"
          />
        ))}

        {/* Axis lines */}
        {scores.map((_, i) => {
          const angle = i * angleStep - Math.PI / 2;
          const endX = centerX + maxRadius * Math.cos(angle);
          const endY = centerY + maxRadius * Math.sin(angle);
          return (
            <line
              key={i}
              x1={centerX}
              y1={centerY}
              x2={endX}
              y2={endY}
              stroke="rgba(255,255,255,0.15)"
              strokeWidth="1"
            />
          );
        })}

        {/* Data polygon */}
        <path
          d={dataPath}
          fill="rgba(0, 180, 216, 0.3)"
          stroke="#00B4D8"
          strokeWidth="2"
        />

        {/* Data points */}
        {dataPoints.map((p, i) => (
          <circle
            key={i}
            cx={p.x}
            cy={p.y}
            r="5"
            fill={scores[i].color}
            stroke="white"
            strokeWidth="1.5"
          />
        ))}

        {/* Labels */}
        {scores.map((score, i) => {
          const angle = i * angleStep - Math.PI / 2;
          const labelRadius = maxRadius + 25;
          const labelX = centerX + labelRadius * Math.cos(angle);
          const labelY = centerY + labelRadius * Math.sin(angle);
          return (
            <text
              key={i}
              x={labelX}
              y={labelY}
              textAnchor="middle"
              dominantBaseline="middle"
              fill="white"
              fontSize="11"
              fontWeight="600"
            >
              {score.icon} {score.score}%
            </text>
          );
        })}
      </svg>
    </div>
  );
}
