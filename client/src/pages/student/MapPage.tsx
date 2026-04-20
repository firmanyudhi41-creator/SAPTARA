import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { OceanMap } from "../../components/OceanMap";
import { Navbar } from "../../components/Navbar";
import { Mascot } from "../../components/Mascot";
import { useStudentInfo, useStudentLogout } from "../../hooks/use-auth";
import { useStudentDashboard } from "../../hooks/use-students";

/**
 * Student Map Page
 *
 * The main student dashboard showing the ocean map with 7 habit islands.
 * Includes a header with student info and XP.
 * Avatar click opens a logout menu.
 */
export function MapPage() {
  const navigate = useNavigate();
  const studentInfo = useStudentInfo();
  const studentId = studentInfo?.studentId ?? 0;
  const { data: dashboard } = useStudentDashboard(studentId);
  const { logout } = useStudentLogout();
  const [showLogoutMenu, setShowLogoutMenu] = useState(false);

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <div className="student-page" id="student-map-page">
      {/* Header */}
      <div className="student-header">
        <div className="student-header__info">
          <button
            className="student-header__avatar avatar-btn"
            onClick={() => setShowLogoutMenu(!showLogoutMenu)}
            type="button"
            title="Tap untuk keluar"
          >
            {studentInfo?.avatar || "🧒"}
          </button>
          <div>
            <h2 className="student-header__name">Ahoy, {studentInfo?.name || "Kapten"}!</h2>
            <p className="student-header__subtitle">
              {dashboard?.shipLevel?.emoji} {dashboard?.shipLevel?.name || "Rakit Bambu"} •{" "}
              {dashboard?.student?.xp ?? 0} mil
            </p>
          </div>
        </div>

        {/* Logout dropdown */}
        {showLogoutMenu && (
          <div className="avatar-logout-menu">
            <p className="avatar-logout-menu__name">
              {studentInfo?.avatar} {studentInfo?.name}
            </p>
            <button className="btn btn-danger btn-sm" onClick={handleLogout} type="button">
              🚪 Keluar dari Kapal
            </button>
          </div>
        )}

        <div className="student-header__stats">
          <span className="stat-badge">🔥 {dashboard?.streak ?? 0} hari</span>
          <span className="stat-badge">🪙 {dashboard?.student?.coins ?? 0}</span>
          <span className="stat-badge">
            ✅ {dashboard?.completedToday ?? 0}/{dashboard?.totalHabits ?? 7}
          </span>
        </div>
      </div>

      {/* Ocean Map */}
      <OceanMap studentId={studentId} />

      {/* Mascot */}
      <Mascot />

      {/* Bottom Nav */}
      <Navbar role="student" />
    </div>
  );
}
