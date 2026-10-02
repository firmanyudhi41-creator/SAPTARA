import { useState, useEffect } from "react";
import { schoolAdminService } from "../../services/school-admin.service";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";
import { Dialog } from "../../components/ui/Dialog";
import {
  GraduationCap,
  Plus,
  KeyRound,
  Trash2,
  AlertCircle,
  CheckCircle2,
  Mail,
  Ship,
  Search,
  Edit2,
  PenTool,
  Upload,
} from "lucide-react";
import { resizeImage } from "../../lib/image";

export function SchoolAdminTeachersPage() {
  const [teachers, setTeachers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [alertMsg, setAlertMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Modal Create Teacher
  const [createModal, setCreateModal] = useState(false);
  const [createName, setCreateName] = useState("");
  const [createEmail, setCreateEmail] = useState("");
  const [createPassword, setCreatePassword] = useState("password123");
  const [createDisplayName, setCreateDisplayName] = useState("");
  const [createLoading, setCreateLoading] = useState(false);

  // Modal Reset Password
  const [resetModal, setResetModal] = useState(false);
  const [selectedTeacher, setSelectedTeacher] = useState<any | null>(null);
  const [newPassword, setNewPassword] = useState("password123");
  const [resetLoading, setResetLoading] = useState(false);

  // Modal Edit Teacher (NIP, Gelar, TTD)
  const [editModal, setEditModal] = useState(false);
  const [editingTeacher, setEditingTeacher] = useState<any | null>(null);
  const [editDisplayName, setEditDisplayName] = useState("");
  const [editNip, setEditNip] = useState("");
  const [editTitle, setEditTitle] = useState("");
  const [editSignatureFile, setEditSignatureFile] = useState<File | null>(null);
  const [editSignaturePreview, setEditSignaturePreview] = useState<string | null>(null);
  const [editLoading, setEditLoading] = useState(false);

  const fetchTeachers = async () => {
    setLoading(true);
    try {
      const data = await schoolAdminService.getTeachers();
      setTeachers(data);
    } catch (err: any) {
      setAlertMsg({ type: "error", text: err.message || "Gagal memuat dewan guru." });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTeachers();
  }, []);

  const handleCreateTeacher = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreateLoading(true);
    setAlertMsg(null);
    try {
      const res = await schoolAdminService.createTeacher({
        name: createName,
        email: createEmail,
        password: createPassword,
        display_name: createDisplayName || createName,
      });
      setAlertMsg({ type: "success", text: res.message });
      setCreateModal(false);
      setCreateName("");
      setCreateEmail("");
      setCreateDisplayName("");
      fetchTeachers();
    } catch (err: any) {
      setAlertMsg({ type: "error", text: err.message || "Gagal menambahkan guru." });
    } finally {
      setCreateLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTeacher) return;
    setResetLoading(true);
    setAlertMsg(null);
    try {
      const res = await schoolAdminService.resetTeacherPassword(selectedTeacher.id, newPassword);
      setAlertMsg({ type: "success", text: res.message });
      setResetModal(false);
      setSelectedTeacher(null);
    } catch (err: any) {
      setAlertMsg({ type: "error", text: err.message || "Gagal mereset kata sandi." });
    } finally {
      setResetLoading(false);
    }
  };

  const handleDeleteTeacher = async (teacher: any) => {
    if (!window.confirm(`Yakin ingin menghapus akun guru "${teacher.display_name}"?`)) return;
    setAlertMsg(null);
    try {
      const res = await schoolAdminService.deleteTeacher(teacher.id);
      setAlertMsg({ type: "success", text: res.message });
      fetchTeachers();
    } catch (err: any) {
      setAlertMsg({ type: "error", text: err.message || "Gagal menghapus guru." });
    }
  };

  const handleOpenEdit = (teacher: any) => {
    setEditingTeacher(teacher);
    setEditDisplayName(teacher.display_name || teacher.user?.name || "");
    setEditNip(teacher.nip || "");
    setEditTitle(teacher.title || "");
    setEditSignaturePreview(teacher.signature || null);
    setEditSignatureFile(null);
    setEditModal(true);
  };

  const handleEditSignatureChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        const resized = await resizeImage(file, 800, 800);
        setEditSignatureFile(resized);
        setEditSignaturePreview(URL.createObjectURL(resized));
      } catch (err) {
        console.error("Gagal mengubah ukuran gambar tanda tangan:", err);
        setEditSignatureFile(file);
        setEditSignaturePreview(URL.createObjectURL(file));
      }
    }
  };

  const handleUpdateTeacher = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTeacher) return;
    setEditLoading(true);
    setAlertMsg(null);

    const formData = new FormData();
    formData.append("display_name", editDisplayName);
    formData.append("nip", editNip);
    formData.append("title", editTitle);
    if (editSignatureFile) {
      formData.append("signature", editSignatureFile);
    }

    try {
      const res = await schoolAdminService.updateTeacher(editingTeacher.id, formData);
      setAlertMsg({ type: "success", text: res.message });
      setEditModal(false);
      setEditingTeacher(null);
      fetchTeachers();
    } catch (err: any) {
      setAlertMsg({ type: "error", text: err.message || "Gagal memperbarui data guru." });
    } finally {
      setEditLoading(false);
    }
  };

  const filteredTeachers = teachers.filter((t) => {
    const q = search.toLowerCase();
    return (
      (t.display_name && t.display_name.toLowerCase().includes(q)) ||
      (t.user?.name && t.user.name.toLowerCase().includes(q)) ||
      (t.user?.email && t.user.email.toLowerCase().includes(q))
    );
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <GraduationCap className="h-6 w-6 text-purple-600" />
            <span>Dewan Guru Sekolah</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Kelola akun pengajar, wali kelas, dan kredensial login para guru
          </p>
        </div>

        <Button
          variant="primary"
          size="sm"
          onClick={() => setCreateModal(true)}
          className="gap-1.5 bg-purple-600 hover:bg-purple-700 text-xs"
        >
          <Plus className="h-4 w-4" />
          <span>Tambah Guru Baru</span>
        </Button>
      </div>

      {/* Alert banner */}
      {alertMsg && (
        <div
          className={`flex items-center gap-2 p-3 rounded-xl text-xs font-semibold ${
            alertMsg.type === "success"
              ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
              : "bg-rose-50 text-rose-800 border border-rose-200"
          }`}
        >
          {alertMsg.type === "success" ? (
            <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" />
          ) : (
            <AlertCircle className="h-4 w-4 shrink-0 text-rose-600" />
          )}
          <span>{alertMsg.text}</span>
        </div>
      )}

      {/* Search Bar */}
      <div className="relative max-w-sm">
        <Search className="h-4 w-4 absolute left-3 top-2.5 text-slate-400" />
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Cari nama guru atau email..."
          className="pl-9 text-xs"
        />
      </div>

      {/* Teachers Table */}
      <Card className="bg-white border-slate-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold uppercase text-slate-500 tracking-wider">
              <tr>
                <th className="py-3 px-4">Nama Guru</th>
                <th className="py-3 px-4">Email Login</th>
                <th className="py-3 px-4">Rombel / Kelas Diampu</th>
                <th className="py-3 px-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={4} className="py-10 text-center text-slate-400">
                    Memuat data dewan guru...
                  </td>
                </tr>
              ) : filteredTeachers.length === 0 ? (
                <tr>
                  <td colSpan={4} className="py-10 text-center text-slate-400">
                    Tidak ada guru yang cocok dengan pencarian.
                  </td>
                </tr>
              ) : (
                filteredTeachers.map((teacher) => (
                  <tr key={teacher.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3 px-4 font-bold text-slate-900">
                      <div className="flex items-center gap-2">
                        <div className="h-8 w-8 rounded-full bg-purple-100 text-purple-700 flex items-center justify-center font-bold text-xs shrink-0">
                          👨‍🏫
                        </div>
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span>{teacher.display_name || teacher.user?.name}</span>
                            {teacher.signature ? (
                              <span className="text-[9px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 px-1.5 py-0.2 rounded" title="Tanda Tangan Digital Terpasang">
                                ✍️ TTD
                              </span>
                            ) : null}
                          </div>
                          {teacher.nip && (
                            <span className="block text-[10px] text-slate-500 font-mono font-normal">
                              NIP. {teacher.nip}
                            </span>
                          )}
                          {teacher.display_name !== teacher.user?.name && (
                            <span className="block text-[10px] text-slate-400 font-normal">
                              Akun: {teacher.user?.name}
                            </span>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4 font-mono text-slate-600">
                      <div className="flex items-center gap-1">
                        <Mail className="h-3 w-3 text-slate-400" />
                        <span>{teacher.user?.email || "-"}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      {teacher.classes && teacher.classes.length > 0 ? (
                        <div className="flex flex-wrap gap-1">
                          {teacher.classes.map((cls: any) => (
                            <span
                              key={cls.id}
                              className="inline-flex items-center gap-1 text-[10px] font-bold bg-sky-50 text-sky-700 border border-sky-200 px-2 py-0.5 rounded"
                            >
                              <Ship className="h-2.5 w-2.5" />
                              <span>{cls.class_code || cls.classCode}</span>
                            </span>
                          ))}
                        </div>
                      ) : (
                        <span className="text-slate-400 text-[11px] italic">Belum mengampu kelas</span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleOpenEdit(teacher)}
                          className="h-8 text-xs gap-1 text-sky-700 border-sky-200 hover:bg-sky-50"
                          title="Edit NIP & Tanda Tangan Guru"
                        >
                          <Edit2 className="h-3 w-3" />
                          <span>Edit</span>
                        </Button>

                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setSelectedTeacher(teacher);
                            setResetModal(true);
                          }}
                          className="h-8 text-xs gap-1 text-amber-700 border-amber-200 hover:bg-amber-50"
                          title="Reset Password Guru"
                        >
                          <KeyRound className="h-3 w-3" />
                          <span>Reset Sandi</span>
                        </Button>

                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => handleDeleteTeacher(teacher)}
                          disabled={(teacher.classes_count ?? teacher.classes?.length ?? 0) > 0}
                          className="h-8 w-8 text-slate-400 hover:text-rose-600 hover:bg-rose-50 disabled:opacity-30"
                          title={
                            (teacher.classes_count ?? teacher.classes?.length ?? 0) > 0
                              ? "Tidak dapat dihapus karena masih mengampu kelas aktif"
                              : "Hapus Guru"
                          }
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Modal Tambah Guru */}
      <Dialog
        open={createModal}
        onClose={() => setCreateModal(false)}
        title="Tambah Guru Baru 👨‍🏫"
        description="Daftarkan akun dewan guru yang bertugas di sekolah ini"
      >
        <form onSubmit={handleCreateTeacher} className="space-y-4 pt-1">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
              Nama Lengkap Guru
            </label>
            <Input
              value={createName}
              onChange={(e) => setCreateName(e.target.value)}
              placeholder="Contoh: Budi Santoso, S.Pd."
              required
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
              Nama Panggilan / Tampilan
            </label>
            <Input
              value={createDisplayName}
              onChange={(e) => setCreateDisplayName(e.target.value)}
              placeholder="Contoh: Pak Budi"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
              Email Resmi Sekolah
            </label>
            <Input
              type="email"
              value={createEmail}
              onChange={(e) => setCreateEmail(e.target.value)}
              placeholder="budi@sekolah.sch.id"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
              Kata Sandi Awal
            </label>
            <Input
              type="password"
              value={createPassword}
              onChange={(e) => setCreatePassword(e.target.value)}
              placeholder="Minimal 6 karakter"
              required
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" size="sm" type="button" onClick={() => setCreateModal(false)}>
              Batal
            </Button>
            <Button variant="primary" size="sm" type="submit" disabled={createLoading}>
              {createLoading ? "Menyimpan..." : "Simpan Guru"}
            </Button>
          </div>
        </form>
      </Dialog>

      {/* Modal Reset Password */}
      <Dialog
        open={resetModal}
        onClose={() => setResetModal(false)}
        title={`Reset Password ${selectedTeacher?.display_name || "Guru"} 🔑`}
        description="Atur ulang kata sandi baru untuk akun guru ini"
      >
        <form onSubmit={handleResetPassword} className="space-y-4 pt-1">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
              Kata Sandi Baru
            </label>
            <Input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Minimal 6 karakter"
              required
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" size="sm" type="button" onClick={() => setResetModal(false)}>
              Batal
            </Button>
            <Button variant="primary" size="sm" type="submit" disabled={resetLoading}>
              {resetLoading ? "Memproses..." : "Simpan Kata Sandi"}
            </Button>
          </div>
        </form>
      </Dialog>

      {/* Modal Edit Guru (NIP, Gelar, Tanda Tangan) */}
      <Dialog
        open={editModal}
        onClose={() => setEditModal(false)}
        title={`Edit Data Guru: ${editingTeacher?.display_name || "Guru"} ✍️`}
        description="Lengkapi NIP, gelar/jabatan, dan tanda tangan digital guru untuk dokumen raport"
      >
        <form onSubmit={handleUpdateTeacher} className="space-y-4 pt-1">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
              Nama Lengkap & Gelar Guru
            </label>
            <Input
              value={editDisplayName}
              onChange={(e) => setEditDisplayName(e.target.value)}
              placeholder="Contoh: Budi Santoso, S.Pd."
              required
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
              NIP (Nomor Induk Pegawai)
            </label>
            <Input
              value={editNip}
              onChange={(e) => setEditNip(e.target.value)}
              placeholder="Contoh: 19850712 201001 1 008"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
              Gelar / Jabatan Tambahan
            </label>
            <Input
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
              placeholder="Contoh: Guru Kelas / Pembina Karakter"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
              Tanda Tangan Digital Guru
            </label>
            <div className="flex items-center gap-3 p-3 bg-slate-50 border border-slate-200 rounded-xl">
              <div className="h-16 w-32 bg-white border border-dashed border-slate-300 rounded-lg flex items-center justify-center p-1 relative overflow-hidden">
                {editSignaturePreview ? (
                  <img
                    src={editSignaturePreview}
                    alt="Pratinjau Tanda Tangan"
                    className="max-h-full max-w-full object-contain"
                  />
                ) : (
                  <span className="text-[10px] text-slate-400 italic">Belum ada</span>
                )}
              </div>
              <div className="flex-1">
                <label className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-sky-600 text-white text-xs font-bold rounded-lg cursor-pointer hover:bg-sky-700 shadow-xs">
                  <Upload className="h-3.5 w-3.5" />
                  <span>Unggah Tanda Tangan</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleEditSignatureChange}
                    className="hidden"
                  />
                </label>
                <p className="text-[10px] text-slate-400 mt-1">
                  Format PNG transparan disarankan untuk raport (otomatis disesuaikan maks. 800x800 px).
                </p>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" size="sm" type="button" onClick={() => setEditModal(false)}>
              Batal
            </Button>
            <Button variant="primary" size="sm" type="submit" disabled={editLoading}>
              {editLoading ? "Menyimpan..." : "Simpan Perubahan"}
            </Button>
          </div>
        </form>
      </Dialog>
    </div>
  );
}
