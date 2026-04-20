import { PhotoLogbook } from "../../components/PhotoLogbook";
import { Navbar } from "../../components/Navbar";
import { Mascot } from "../../components/Mascot";
import { useStudentInfo } from "../../hooks/use-auth";

/**
 * Student Logbook Page
 *
 * Displays the student's logbook with photo verification entries
 * and a form to submit new entries.
 */
export function LogbookPage() {
  const studentInfo = useStudentInfo();
  const studentId = studentInfo?.studentId ?? 0;

  return (
    <div className="student-page" id="student-logbook-page">
      <div className="page-header">
        <h1 className="page-title">📸 Logbook Kapten</h1>
        <p className="page-subtitle">Dokumentasi misi harianmu</p>
      </div>

      <PhotoLogbook studentId={studentId} />
      <Mascot />
      <Navbar role="student" />
    </div>
  );
}
