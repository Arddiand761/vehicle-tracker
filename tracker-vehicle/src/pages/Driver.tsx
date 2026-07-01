import { useEffect, useState } from "react";
import { Plus, Pencil, Trash2, History, X } from "lucide-react";
import api from "../api/axios";
import type { Driver, Trip } from "../types/index";

type DriverForm = {
  user_id: string;
  license_number: string;
  phone: string;
};

const statusBadge = (status: string) => {
  const map: Record<string, string> = {
    available: "bg-green-100 text-green-700",
    on_trip: "bg-blue-100 text-blue-700",
    off_duty: "bg-gray-100 text-gray-600",
  };
  const label: Record<string, string> = {
    available: "Tersedia",
    on_trip: "Dalam Trip",
    off_duty: "Tidak Bertugas",
  };
  return (
    <span
      className={`text-xs font-medium px-2 py-1 rounded-full ${map[status]}`}
    >
      {label[status]}
    </span>
  );
};

const Modal = ({
  title,
  onClose,
  children,
}: {
  title: string;
  onClose: () => void;
  children: React.ReactNode;
}) => (
  <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
    <div className="bg-white rounded-xl shadow-xl w-full max-w-md">
      <div className="flex items-center justify-between p-5 border-b">
        <h3 className="font-semibold text-gray-800">{title}</h3>
        <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
          <X size={18} />
        </button>
      </div>
      <div className="p-5">{children}</div>
    </div>
  </div>
);

const Driver = () => {
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [users, setUsers] = useState<
    { id: string; name: string; email: string }[]
  >([]);
  const [tripHistory, setTripHistory] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [editDriver, setEditDriver] = useState<Driver | null>(null);
  const [selectedDriver, setSelectedDriver] = useState<Driver | null>(null);
  const [form, setForm] = useState<DriverForm>({
    user_id: "",
    license_number: "",
    phone: "",
  });
  const [error, setError] = useState("");
  const [submitLoading, setSubmitLoading] = useState(false);

  const fetchDrivers = async () => {
    try {
      const res = await api.get("/drivers");
      setDrivers(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      const res = await api.get("/auth/users");
      setUsers(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchDrivers();
    fetchUsers();
  }, []);

  const openCreate = () => {
    setEditDriver(null);
    setForm({ user_id: "", license_number: "", phone: "" });
    setError("");
    setShowModal(true);
  };

  const openEdit = (d: Driver) => {
    setEditDriver(d);
    setForm({
      user_id: d.user_id,
      license_number: d.license_number,
      phone: d.phone,
    });
    setError("");
    setShowModal(true);
  };

  const handleSubmit = async () => {
    setSubmitLoading(true);
    setError("");
    try {
      if (editDriver) {
        await api.put(`/drivers/${editDriver.id}`, {
          license_number: form.license_number,
          phone: form.phone,
        });
      } else {
        await api.post("/drivers", form);
      }
      setShowModal(false);
      fetchDrivers();
    } catch (err: any) {
      setError(err.response?.data?.message || "Terjadi kesalahan");
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Yakin hapus driver ini?")) return;
    try {
      await api.delete(`/drivers/${id}`);
      fetchDrivers();
    } catch (err: any) {
      alert(err.response?.data?.message || "Gagal menghapus");
    }
  };

  const openHistory = async (d: Driver) => {
    setSelectedDriver(d);
    setShowHistoryModal(true);
    try {
      const res = await api.get(`/drivers/${d.id}/history`);
      setTripHistory(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const formatDate = (date: string) =>
    new Date(date).toLocaleDateString("id-ID", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-gray-800">Driver</h1>
          <p className="text-sm text-gray-500">Kelola data driver armada</p>
        </div>
        <button
          onClick={openCreate}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
        >
          <Plus size={16} />
          Tambah Driver
        </button>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-gray-400">Memuat data...</div>
        ) : drivers.length === 0 ? (
          <div className="p-8 text-center text-gray-400">Tidak ada driver</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  {[
                    "Nama",
                    "Email",
                    "No. SIM",
                    "Telepon",
                    "Status",
                    "Aksi",
                  ].map((h) => (
                    <th
                      key={h}
                      className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {drivers.map((d) => (
                  <tr key={d.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 font-medium text-gray-800">
                      {d.name}
                    </td>
                    <td className="px-4 py-3 text-gray-500">{d.email}</td>
                    <td className="px-4 py-3 text-gray-600">
                      {d.license_number}
                    </td>
                    <td className="px-4 py-3 text-gray-600">{d.phone}</td>
                    <td className="px-4 py-3">{statusBadge(d.status)}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => openHistory(d)}
                          className="p-1.5 text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
                          title="Riwayat Trip"
                        >
                          <History size={14} />
                        </button>
                        <button
                          onClick={() => openEdit(d)}
                          className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Edit"
                        >
                          <Pencil size={14} />
                        </button>
                        <button
                          onClick={() => handleDelete(d.id)}
                          className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                          title="Hapus"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal Create/Edit */}
      {showModal && (
        <Modal
          title={editDriver ? "Edit Driver" : "Tambah Driver"}
          onClose={() => setShowModal(false)}
        >
          <div className="flex flex-col gap-4">
            {error && (
              <div className="bg-red-50 text-red-600 text-sm px-3 py-2 rounded-lg">
                {error}
              </div>
            )}

            {/* User ID hanya saat create */}
            {!editDriver && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Pilih User
                </label>
                {users.length === 0 ? (
                  <p className="text-sm text-yellow-600 bg-yellow-50 px-3 py-2 rounded-lg">
                    Tidak ada user tersedia — semua user sudah jadi driver
                  </p>
                ) : (
                  <select
                    value={form.user_id}
                    onChange={(e) =>
                      setForm({ ...form, user_id: e.target.value })
                    }
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">-- Pilih User --</option>
                    {users.map((u) => (
                      <option key={u.id} value={u.id}>
                        {u.name} ({u.email})
                      </option>
                    ))}
                  </select>
                )}
              </div>
            )}

            {[
              {
                key: "license_number",
                label: "Nomor SIM",
                placeholder: "SIM-A-001234",
              },
              { key: "phone", label: "Telepon", placeholder: "081234567890" },
            ].map(({ key, label, placeholder }) => (
              <div key={key}>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {label}
                </label>
                <input
                  type="text"
                  value={form[key as keyof DriverForm]}
                  onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                  placeholder={placeholder}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            ))}

            <div className="flex gap-3 mt-2">
              <button
                onClick={() => setShowModal(false)}
                className="flex-1 border border-gray-300 text-gray-600 py-2 rounded-lg text-sm hover:bg-gray-50"
              >
                Batal
              </button>
              <button
                onClick={handleSubmit}
                disabled={submitLoading}
                className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white py-2 rounded-lg text-sm font-medium"
              >
                {submitLoading ? "Menyimpan..." : "Simpan"}
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* Modal History */}
      {showHistoryModal && selectedDriver && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg">
            <div className="flex items-center justify-between p-5 border-b">
              <h3 className="font-semibold text-gray-800">
                Riwayat Trip — {selectedDriver.name}
              </h3>
              <button
                onClick={() => setShowHistoryModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X size={18} />
              </button>
            </div>
            <div className="p-5 max-h-96 overflow-y-auto">
              {tripHistory.length === 0 ? (
                <p className="text-center text-gray-400 text-sm">
                  Belum ada riwayat trip
                </p>
              ) : (
                <div className="flex flex-col gap-3">
                  {tripHistory.map((t) => (
                    <div
                      key={t.id}
                      className="border border-gray-100 rounded-lg p-3"
                    >
                      <div className="flex items-center justify-between mb-1">
                        <p className="font-medium text-sm text-gray-800">
                          {t.plate_number} — {t.brand} {t.model}
                        </p>
                        <span
                          className={`text-xs px-2 py-0.5 rounded-full ${
                            t.status === "completed"
                              ? "bg-green-100 text-green-700"
                              : t.status === "ongoing"
                                ? "bg-blue-100 text-blue-700"
                                : "bg-gray-100 text-gray-600"
                          }`}
                        >
                          {t.status}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500">
                        Mulai: {formatDate(t.start_time)}
                      </p>
                      {t.end_time && (
                        <p className="text-xs text-gray-500">
                          Selesai: {formatDate(t.end_time)}
                        </p>
                      )}
                      <p className="text-xs text-gray-500">
                        Jarak: {t.distance_km} km
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Driver;
