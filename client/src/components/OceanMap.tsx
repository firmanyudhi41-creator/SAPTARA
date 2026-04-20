import { useNavigate } from "react-router-dom";
import { useHabits } from "../hooks/use-habits";
import { useTodayMissions } from "../hooks/use-habits";

interface OceanMapProps {
  studentId: number;
}

/**
 * OceanMap Component
 *
 * Renders the 7 habit islands on an interactive ocean map.
 * Clicking an island navigates to the logbook page with that habit pre-selected.
 */
export function OceanMap({ studentId }: OceanMapProps) {
  const navigate = useNavigate();
  const { data: habits, isLoading: habitsLoading } = useHabits();
  const { data: missions, isLoading: missionsLoading } = useTodayMissions(studentId);

  if (habitsLoading || missionsLoading) {
    return (
      <div className="ocean-map" style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: 300 }}>
        <p style={{ opacity: 0.6 }}>Memuat peta samudra...</p>
      </div>
    );
  }

  const handleIslandClick = (habitId: number) => {
    // Navigate to logbook with habit pre-selected
    navigate(`/student/logbook?habitId=${habitId}`);
  };

  // Build a lookup for completed missions
  const completedMap = new Map(
    missions?.map((m) => [m.habit?.id ?? 0, m.completed]) ?? []
  );

  return (
    <div className="ocean-map" id="ocean-map">
      {/* Ocean background */}
      <div className="ocean-map__ocean">
        {/* Ship in center */}
        <div className="ocean-map__ship">⛵</div>

        {/* Habit Islands */}
        {habits?.map((habit) => {
          const isCompleted = completedMap.get(habit.id) ?? false;
          return (
            <button
              key={habit.id}
              className={`ocean-map__island ${isCompleted ? "completed" : ""}`}
              style={{
                left: `${habit.positionX}%`,
                top: `${habit.positionY}%`,
                "--island-color": habit.color,
              } as React.CSSProperties}
              onClick={() => handleIslandClick(habit.id)}
              type="button"
              title={`${habit.name} — Tap untuk catat misi`}
            >
              <span className="island-icon">{habit.icon}</span>
              <span className="island-name">{habit.island}</span>
              {isCompleted && <span className="island-check">✅</span>}
            </button>
          );
        })}
      </div>
    </div>
  );
}
