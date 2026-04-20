import { RadarChart } from "../../components/RadarChart";
import { Navbar } from "../../components/Navbar";
import { useStudentInfo } from "../../hooks/use-auth";
import { useStudentWeekly } from "../../hooks/use-students";

/**
 * Student Compass Page
 *
 * Shows the radar chart of habit scores and weekly trend data.
 */
export function CompassPage() {
  const studentInfo = useStudentInfo();
  const studentId = studentInfo?.studentId ?? 0;
  const { data: weeklyData, isLoading } = useStudentWeekly(studentId);

  const maxCompleted = weeklyData ? Math.max(...weeklyData.map(d => d.completed), 1) : 1;

  return (
    <div className="student-page" id="student-compass-page">
      <div className="page-header">
        <h1 className="page-title">🧭 Kompas Karakter</h1>
        <p className="page-subtitle">Peta kekuatan karaktermu</p>
      </div>

      {/* Radar Chart */}
      <div className="compass-section">
        <RadarChart studentId={studentId} />
      </div>

      {/* Weekly Trend */}
      <div className="weekly-section">
        <h3 className="section-title">📊 Tren Mingguan</h3>
        {isLoading ? (
          <p style={{ opacity: 0.6 }}>Memuat data...</p>
        ) : (
          <div className="weekly-chart">
            {weeklyData?.map((day, idx) => (
              <div key={idx} className="weekly-bar-col">
                <div className="weekly-bar-wrapper">
                  <div
                    className="weekly-bar"
                    style={{
                      height: `${(day.completed / Math.max(maxCompleted, 7)) * 100}%`,
                    }}
                  >
                    <span className="weekly-bar__count">{day.completed}</span>
                  </div>
                </div>
                <span className="weekly-bar__day">{day.day}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      <Navbar role="student" />
    </div>
  );
}
