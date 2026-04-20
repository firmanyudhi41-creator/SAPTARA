import { useState } from "react";
import { Navbar } from "../../components/Navbar";
import {
  useClasses,
  useCreateClass,
  useDeleteClass,
  useClassStudents,
} from "../../hooks/use-classes";
import { useCreateStudent, useDeleteStudent } from "../../hooks/use-students";
import { useTeacherSignOut } from "../../hooks/use-auth";
import { useNavigate } from "react-router-dom";

/**
 * Teacher Crew Page
 *
 * Manage classes (create/delete) and students (add/remove).
 * Also provides teacher sign-out.
 */
export function CrewPage() {
  const navigate = useNavigate();
  const { data: classes, isLoading: classesLoading } = useClasses();
  const createClass = useCreateClass();
  const deleteClass = useDeleteClass();
  const createStudent = useCreateStudent();
  const deleteStudent = useDeleteStudent();
  const { mutate: signOut } = useTeacherSignOut();

  const [selectedClassId, setSelectedClassId] = useState<number>(0);
  const [showClassForm, setShowClassForm] = useState(false);
  const [showStudentForm, setShowStudentForm] = useState(false);

  // Custom confirmation state (replaces window.confirm which can be blocked)
  const [confirmAction, setConfirmAction] = useState<{
    type: "class" | "student";
    id: number;
    name: string;
  } | null>(null);

  // Class form state
  const [newSchool, setNewSchool] = useState("");
  const [newCode, setNewCode] = useState("");
  const [newShipName, setNewShipName] = useState("");

  // Student form state
  const [newStudentName, setNewStudentName] = useState("");
  const [newStudentAvatar, setNewStudentAvatar] = useState("🧒");

  const activeClassId = selectedClassId || classes?.[0]?.id || 0;
  const { data: students, isLoading: studentsLoading } = useClassStudents(activeClassId);

  const avatarOptions = ["🧒", "👧", "👦", "🧒🏽", "👧🏽", "👦🏽"];

  const handleCreateClass = async (e: React.FormEvent) => {
    e.preventDefault();
    await createClass.mutateAsync({
      schoolName: newSchool,
      classCode: newCode,
      shipName: newShipName || undefined,
    });
    setNewSchool("");
    setNewCode("");
    setNewShipName("");
    setShowClassForm(false);
  };

  const handleDeleteClass = (id: number, name: string) => {
    setConfirmAction({ type: "class", id, name });
  };

  const handleCreateStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    await createStudent.mutateAsync({
      classId: activeClassId,
      name: newStudentName,
      avatar: newStudentAvatar,
    });
    setNewStudentName("");
    setNewStudentAvatar("🧒");
    setShowStudentForm(false);
  };

  const handleDeleteStudent = (id: number, name: string) => {
    setConfirmAction({ type: "student", id, name });
  };

  const executeDelete = () => {
    if (!confirmAction) return;
    if (confirmAction.type === "class") {
      deleteClass.mutate(confirmAction.id);
    } else {
      deleteStudent.mutate(confirmAction.id);
    }
    setConfirmAction(null);
  };

  const handleSignOut = () => {
    signOut();
    navigate("/");
  };

  return (
    <div className="teacher-page" id="teacher-crew-page">
      <div className="page-header">
        <h1 className="page-title">👥 Kelola Kru</h1>
        <p className="page-subtitle">Atur kelas dan kapten cilik</p>
      </div>

      {/* ── Confirm Delete Modal ── */}
      {confirmAction && (
        <div
          className="confirm-overlay"
          onClick={() => setConfirmAction(null)}
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.6)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 9999,
          }}
        >
          <div
            className="confirm-dialog"
            onClick={(e) => e.stopPropagation()}
            style={{
              background: "linear-gradient(135deg, #1a3a5c, #0d2137)",
              borderRadius: "16px",
              padding: "24px",
              maxWidth: "320px",
              width: "90%",
              textAlign: "center",
              border: "1px solid rgba(255,255,255,0.1)",
              boxShadow: "0 12px 40px rgba(0,0,0,0.4)",
            }}
          >
            <div style={{ fontSize: "48px", marginBottom: "12px" }}>
              {confirmAction.type === "class" ? "🏫" : "🧒"}
            </div>
            <h3 style={{ color: "#fff", marginBottom: "8px", fontSize: "18px" }}>
              Hapus {confirmAction.type === "class" ? "Kelas" : "Murid"}?
            </h3>
            <p style={{ color: "rgba(255,255,255,0.6)", fontSize: "13px", marginBottom: "20px" }}>
              {confirmAction.type === "class"
                ? `Yakin ingin menghapus "${confirmAction.name}"? Semua data murid akan hilang.`
                : `Yakin ingin menghapus ${confirmAction.name} dari kelas?`}
            </p>
            <div style={{ display: "flex", gap: "8px" }}>
              <button
                className="btn btn-outline"
                onClick={() => setConfirmAction(null)}
                style={{ flex: 1, padding: "10px", fontSize: "14px" }}
                type="button"
              >
                Batal
              </button>
              <button
                className="btn btn-danger"
                onClick={executeDelete}
                disabled={deleteClass.isPending || deleteStudent.isPending}
                style={{ flex: 1, padding: "10px", fontSize: "14px" }}
                type="button"
              >
                {deleteClass.isPending || deleteStudent.isPending ? "Menghapus..." : "🗑️ Hapus"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Classes Section ── */}
      <div className="crew-section">
        <div className="section-header">
          <h3 className="section-title">🏫 Kelas Terdaftar</h3>
          <button
            className="btn btn-primary btn-sm"
            onClick={() => setShowClassForm(!showClassForm)}
            type="button"
          >
            {showClassForm ? "✕ Tutup" : "+ Kelas Baru"}
          </button>
        </div>

        {showClassForm && (
          <form className="crew-form" onSubmit={handleCreateClass}>
            <div className="form-group">
              <label htmlFor="class-school">Nama Sekolah</label>
              <input
                id="class-school"
                value={newSchool}
                onChange={(e) => setNewSchool(e.target.value)}
                placeholder="SD Nusantara 01"
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="class-code">Kode Kelas</label>
              <input
                id="class-code"
                value={newCode}
                onChange={(e) => setNewCode(e.target.value)}
                placeholder="4A"
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="class-ship">Nama Kapal (opsional)</label>
              <input
                id="class-ship"
                value={newShipName}
                onChange={(e) => setNewShipName(e.target.value)}
                placeholder="Kapal Nusantara 4A"
              />
            </div>
            <button type="submit" className="btn btn-primary" disabled={createClass.isPending}>
              {createClass.isPending ? "Membuat..." : "🚀 Buat Kelas"}
            </button>
            {createClass.isError && (
              <p className="error-text">❌ {createClass.error.message}</p>
            )}
          </form>
        )}

        {classesLoading ? (
          <p style={{ opacity: 0.6 }}>Memuat kelas...</p>
        ) : (
          <div className="class-list">
            {classes?.map((cls) => (
              <div
                key={cls.id}
                className={`class-card ${cls.id === activeClassId ? "active" : ""}`}
                onClick={() => setSelectedClassId(cls.id)}
              >
                <div className="class-card__info">
                  <span className="class-card__ship">⛵ {cls.shipName}</span>
                  <span className="class-card__school">{cls.schoolName}</span>
                  <span className="class-card__code">Kode: {cls.classCode}</span>
                </div>
                <button
                  className="btn btn-danger btn-xs"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteClass(cls.id, cls.shipName);
                  }}
                  type="button"
                >
                  🗑️
                </button>
              </div>
            ))}
            {(!classes || classes.length === 0) && (
              <p style={{ opacity: 0.6, textAlign: "center" }}>Belum ada kelas. Buat kelas pertamamu!</p>
            )}
          </div>
        )}
      </div>

      {/* ── Students Section ── */}
      {activeClassId > 0 && (
        <div className="crew-section">
          <div className="section-header">
            <h3 className="section-title">🧒 Kapten Cilik</h3>
            <button
              className="btn btn-primary btn-sm"
              onClick={() => setShowStudentForm(!showStudentForm)}
              type="button"
            >
              {showStudentForm ? "✕ Tutup" : "+ Murid Baru"}
            </button>
          </div>

          {showStudentForm && (
            <form className="crew-form" onSubmit={handleCreateStudent}>
              <div className="form-group">
                <label htmlFor="student-name">Nama Murid</label>
                <input
                  id="student-name"
                  value={newStudentName}
                  onChange={(e) => setNewStudentName(e.target.value)}
                  placeholder="Arya Pratama"
                  required
                />
              </div>
              <div className="form-group">
                <label>Avatar</label>
                <div className="avatar-picker">
                  {avatarOptions.map((av) => (
                    <button
                      key={av}
                      type="button"
                      className={`avatar-option ${newStudentAvatar === av ? "selected" : ""}`}
                      onClick={() => setNewStudentAvatar(av)}
                    >
                      {av}
                    </button>
                  ))}
                </div>
              </div>
              <button type="submit" className="btn btn-primary" disabled={createStudent.isPending}>
                {createStudent.isPending ? "Menambahkan..." : "➕ Tambah Murid"}
              </button>
              {createStudent.isError && (
                <p className="error-text">❌ {createStudent.error.message}</p>
              )}
            </form>
          )}

          {studentsLoading ? (
            <p style={{ opacity: 0.6 }}>Memuat murid...</p>
          ) : (
            <div className="student-list">
              {students?.map((student) => (
                <div key={student.id} className="student-card">
                  <span className="student-card__avatar">{student.avatar}</span>
                  <div className="student-card__info">
                    <span className="student-card__name">{student.name}</span>
                    <span className="student-card__stats">
                      ⚡ {student.xp} XP • 🪙 {student.coins} • 🔥 {student.streak}
                    </span>
                  </div>
                  <button
                    className="btn btn-danger btn-xs"
                    onClick={() => handleDeleteStudent(student.id, student.name)}
                    type="button"
                  >
                    🗑️
                  </button>
                </div>
              ))}
              {(!students || students.length === 0) && (
                <p style={{ opacity: 0.6, textAlign: "center" }}>Belum ada murid. Tambah murid pertama!</p>
              )}
            </div>
          )}
        </div>
      )}

      {/* Sign out */}
      <div className="crew-signout">
        <button className="btn btn-outline" onClick={handleSignOut} type="button">
          🚪 Keluar (Sign Out)
        </button>
      </div>

      <Navbar role="teacher" />
    </div>
  );
}
