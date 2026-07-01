import { useEffect, useState } from 'react';
import { Plus, Pencil, Trash2, UserPlus, UserMinus, X } from 'lucide-react';
import api from '../api/axios';
import type { Vehicle, Driver } from '../types/index';

type VehicleForm = {
  plate_number: string;
  brand: string;
  model: string;
  type: string;
};

const statusBadge = (status: string) => {
  const map: Record<string, string> = {
    active: 'bg-green-100 text-green-700',
    idle: 'bg-yellow-100 text-yellow-700',
    offline: 'bg-red-100 text-red-700',
  };
  const label: Record<string, string> = {
    active: 'Aktif',
    idle: 'Idle',
    offline: 'Offline',
  };
  return (
    <span className={`text-xs font-medium px-2 py-1 rounded-full ${map[status]}`}>
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

const Kendaraan = () => {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [editVehicle, setEditVehicle] = useState<Vehicle | null>(null);
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);
  const [selectedDriverId, setSelectedDriverId] = useState('');
  const [form, setForm] = useState<VehicleForm>({
    plate_number: '',
    brand: '',
    model: '',
    type: '',
  });
  const [error, setError] = useState('');
  const [submitLoading, setSubmitLoading] = useState(false);

  const fetchVehicles = async () => {
    try {
      const res = await api.get('/vehicles');
      setVehicles(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchDrivers = async () => {
    try {
      const res = await api.get('/drivers');
      setDrivers(res.data.filter((d: Driver) => d.status === 'available'));
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchVehicles();
    fetchDrivers();
  }, []);

  const openCreate = () => {
    setEditVehicle(null);
    setForm({ plate_number: '', brand: '', model: '', type: '' });
    setError('');
    setShowModal(true);
  };

  const openEdit = (v: Vehicle) => {
    setEditVehicle(v);
    setForm({
      plate_number: v.plate_number,
      brand: v.brand,
      model: v.model,
      type: v.type,
    });
    setError('');
    setShowModal(true);
  };

  const handleSubmit = async () => {
    setSubmitLoading(true);
    setError('');
    try {
      if (editVehicle) {
        await api.put(`/vehicles/${editVehicle.id}`, form);
      } else {
        await api.post('/vehicles', form);
      }
      setShowModal(false);
      fetchVehicles();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Terjadi kesalahan');
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Yakin hapus kendaraan ini?')) return;
    try {
      await api.delete(`/vehicles/${id}`);
      fetchVehicles();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Gagal menghapus');
    }
  };

  const openAssign = (v: Vehicle) => {
    setSelectedVehicle(v);
    setSelectedDriverId('');
    setShowAssignModal(true);
  };

  const handleAssign = async () => {
    if (!selectedVehicle || !selectedDriverId) return;
    try {
      await api.post(`/vehicles/${selectedVehicle.id}/assign-driver`, {
        driver_id: selectedDriverId,
      });
      setShowAssignModal(false);
      fetchVehicles();
      fetchDrivers();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Gagal assign driver');
    }
  };

  const handleUnassign = async (v: Vehicle) => {
    if (!confirm(`Lepas driver dari ${v.plate_number}?`)) return;
    try {
      await api.post(`/vehicles/${v.id}/unassign-driver`);
      fetchVehicles();
      fetchDrivers();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Gagal unassign driver');
    }
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-gray-800">Kendaraan</h1>
          <p className="text-sm text-gray-500">Kelola armada kendaraan</p>
        </div>
        <button
          onClick={openCreate}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
        >
          <Plus size={16} />
          Tambah Kendaraan
        </button>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-gray-400">Memuat data...</div>
        ) : vehicles.length === 0 ? (
          <div className="p-8 text-center text-gray-400">Tidak ada kendaraan</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  {['Plat Nomor', 'Kendaraan', 'Tipe', 'Status', 'Driver', 'Aksi'].map(h => (
                    <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {vehicles.map(v => (
                  <tr key={v.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 font-medium text-gray-800">{v.plate_number}</td>
                    <td className="px-4 py-3 text-gray-600">{v.brand} {v.model}</td>
                    <td className="px-4 py-3 text-gray-500">{v.type}</td>
                    <td className="px-4 py-3">{statusBadge(v.status)}</td>
                    <td className="px-4 py-3 text-gray-600">{v.driver_name ?? '-'}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => openEdit(v)}
                          className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Edit"
                        >
                          <Pencil size={14} />
                        </button>
                        {v.current_driver_id ? (
                          <button
                            onClick={() => handleUnassign(v)}
                            className="p-1.5 text-yellow-600 hover:bg-yellow-50 rounded-lg transition-colors"
                            title="Unassign Driver"
                          >
                            <UserMinus size={14} />
                          </button>
                        ) : (
                          <button
                            onClick={() => openAssign(v)}
                            className="p-1.5 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                            title="Assign Driver"
                          >
                            <UserPlus size={14} />
                          </button>
                        )}
                        <button
                          onClick={() => handleDelete(v.id)}
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
          title={editVehicle ? 'Edit Kendaraan' : 'Tambah Kendaraan'}
          onClose={() => setShowModal(false)}
        >
          <div className="flex flex-col gap-4">
            {error && (
              <div className="bg-red-50 text-red-600 text-sm px-3 py-2 rounded-lg">{error}</div>
            )}
            {[
              { key: 'plate_number', label: 'Plat Nomor', placeholder: 'AB 1234 CD' },
              { key: 'brand', label: 'Merk', placeholder: 'Toyota' },
              { key: 'model', label: 'Model', placeholder: 'Avanza' },
              { key: 'type', label: 'Tipe', placeholder: 'MPV' },
            ].map(({ key, label, placeholder }) => (
              <div key={key}>
                <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
                <input
                  type="text"
                  value={form[key as keyof VehicleForm]}
                  onChange={e => setForm({ ...form, [key]: e.target.value })}
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
                {submitLoading ? 'Menyimpan...' : 'Simpan'}
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* Modal Assign Driver */}
      {showAssignModal && selectedVehicle && (
        <Modal
          title={`Assign Driver ke ${selectedVehicle.plate_number}`}
          onClose={() => setShowAssignModal(false)}
        >
          <div className="flex flex-col gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Pilih Driver</label>
              <select
                value={selectedDriverId}
                onChange={e => setSelectedDriverId(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">-- Pilih Driver --</option>
                {drivers.map(d => (
                  <option key={d.id} value={d.id}>
                    {d.name} - {d.license_number}
                  </option>
                ))}
              </select>
            </div>
            {drivers.length === 0 && (
              <p className="text-sm text-yellow-600 bg-yellow-50 px-3 py-2 rounded-lg">
                Tidak ada driver yang tersedia saat ini
              </p>
            )}
            <div className="flex gap-3">
              <button
                onClick={() => setShowAssignModal(false)}
                className="flex-1 border border-gray-300 text-gray-600 py-2 rounded-lg text-sm hover:bg-gray-50"
              >
                Batal
              </button>
              <button
                onClick={handleAssign}
                disabled={!selectedDriverId}
                className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white py-2 rounded-lg text-sm font-medium"
              >
                Assign
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default Kendaraan;