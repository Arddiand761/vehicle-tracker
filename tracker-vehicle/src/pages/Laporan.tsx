import { useEffect, useState } from 'react';
import { FileText, Navigation, Clock, Route } from 'lucide-react';
import api from '../api/axios';
import type { Trip } from '../types/index';

type ReportSummary = {
  total_trips: string;
  total_distance_km: string;
  avg_distance_km: string;
  total_hours: string;
  completed: string;
  cancelled: string;
};

const statusBadge = (status: string) => {
  const map: Record<string, string> = {
    ongoing: 'bg-blue-100 text-blue-700',
    completed: 'bg-green-100 text-green-700',
    cancelled: 'bg-gray-100 text-gray-600',
  };
  const label: Record<string, string> = {
    ongoing: 'Berlangsung',
    completed: 'Selesai',
    cancelled: 'Dibatalkan',
  };
  return (
    <span className={`text-xs font-medium px-2 py-1 rounded-full ${map[status]}`}>
      {label[status]}
    </span>
  );
};

const formatDate = (date: string) =>
  new Date(date).toLocaleDateString('id-ID', {
    day: 'numeric', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });

const Laporan = () => {
  const [trips, setTrips] = useState<Trip[]>([]);
  const [summary, setSummary] = useState<ReportSummary | null>(null);
  const [loading, setLoading] = useState(false);
  const [dateFrom, setDateFrom] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() - 30);
    return d.toISOString().split('T')[0];
  });
  const [dateTo, setDateTo] = useState(() => new Date().toISOString().split('T')[0]);
  const [statusFilter, setStatusFilter] = useState('');

  const fetchData = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        date_from: dateFrom,
        date_to: dateTo,
        ...(statusFilter && { status: statusFilter }),
      });

      const [tripsRes, reportRes] = await Promise.all([
        api.get(`/trips?${params}`),
        api.get(`/trips/report?date_from=${dateFrom}&date_to=${dateTo}`),
      ]);

      setTrips(tripsRes.data);
      setSummary(reportRes.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <div className="p-6 flex flex-col gap-6">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold text-gray-800">Laporan</h1>
        <p className="text-sm text-gray-500">Riwayat & laporan perjalanan armada</p>
      </div>

      {/* Filter */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
        <div className="flex flex-wrap gap-4 items-end">
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Dari Tanggal</label>
            <input
              type="date"
              value={dateFrom}
              onChange={e => setDateFrom(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Sampai Tanggal</label>
            <input
              type="date"
              value={dateTo}
              onChange={e => setDateTo(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Status</label>
            <select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Semua</option>
              <option value="ongoing">Berlangsung</option>
              <option value="completed">Selesai</option>
              <option value="cancelled">Dibatalkan</option>
            </select>
          </div>
          <button
            onClick={fetchData}
            disabled={loading}
            className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
          >
            {loading ? 'Memuat...' : 'Tampilkan'}
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      {summary && (
        <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
          {[
            {
              label: 'Total Trip',
              value: summary.total_trips,
              icon: <FileText size={18} className="text-blue-600" />,
              color: 'bg-blue-50',
            },
            {
              label: 'Total Jarak',
              value: `${Number(summary.total_distance_km).toFixed(1)} km`,
              icon: <Route size={18} className="text-green-600" />,
              color: 'bg-green-50',
            },
            {
              label: 'Rata-rata Jarak',
              value: `${Number(summary.avg_distance_km).toFixed(1)} km`,
              icon: <Navigation size={18} className="text-purple-600" />,
              color: 'bg-purple-50',
            },
            {
              label: 'Total Jam',
              value: `${Number(summary.total_hours).toFixed(1)} jam`,
              icon: <Clock size={18} className="text-yellow-600" />,
              color: 'bg-yellow-50',
            },
          ].map(({ label, value, icon, color }) => (
            <div key={label} className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
              <div className="flex items-center justify-between mb-3">
                <p className="text-sm text-gray-500">{label}</p>
                <div className={`p-2 rounded-lg ${color}`}>{icon}</div>
              </div>
              <p className="text-2xl font-bold text-gray-800">{value}</p>
            </div>
          ))}
        </div>
      )}

      {/* Trip Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100">
          <h2 className="font-semibold text-gray-800">
            Daftar Trip
            <span className="ml-2 text-sm font-normal text-gray-400">({trips.length} data)</span>
          </h2>
        </div>

        {loading ? (
          <div className="p-8 text-center text-gray-400">Memuat data...</div>
        ) : trips.length === 0 ? (
          <div className="p-8 text-center text-gray-400">Tidak ada data trip pada periode ini</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  {['Kendaraan', 'Driver', 'Mulai', 'Selesai', 'Jarak', 'Status'].map(h => (
                    <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {trips.map(t => (
                  <tr key={t.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3">
                      <p className="font-medium text-gray-800">{t.plate_number}</p>
                      <p className="text-xs text-gray-400">{t.brand} {t.model}</p>
                    </td>
                    <td className="px-4 py-3 text-gray-600">{t.driver_name}</td>
                    <td className="px-4 py-3 text-gray-500 text-xs">{formatDate(t.start_time)}</td>
                    <td className="px-4 py-3 text-gray-500 text-xs">
                      {t.end_time ? formatDate(t.end_time) : '-'}
                    </td>
                    <td className="px-4 py-3 text-gray-600">
                      {t.distance_km ? `${t.distance_km} km` : '-'}
                    </td>
                    <td className="px-4 py-3">{statusBadge(t.status)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default Laporan;