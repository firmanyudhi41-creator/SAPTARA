import { Leaderboard } from "../../components/Leaderboard";
import { Navbar } from "../../components/Navbar";
import { useStudentInfo } from "../../hooks/use-auth";

/**
 * Student Leaderboard Page
 *
 * Shows the class leaderboard with rankings.
 */
export function LeaderboardPage() {
  const studentInfo = useStudentInfo();
  const classId = studentInfo?.classId ?? 0;

  return (
    <div className="student-page" id="student-leaderboard-page">
      <div className="page-header">
        <h1 className="page-title">🏆 Papan Peringkat</h1>
        <p className="page-subtitle">Siapa kapten terhebat di kapalmu?</p>
      </div>

      <Leaderboard classId={classId} />

      <Navbar role="student" />
    </div>
  );
}
