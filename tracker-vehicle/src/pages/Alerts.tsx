import { useEffect, useState } from 'react';
import { Bell, BellOff, CheckCheck, AlertTriangle, Gauge, MapPin, Clock, WifiOff } from 'lucide-react';
import api from '../api/axios';
import type { Alert } from '../types/index';

const alertIcon = (type: string) => {
  const map: Record<string, React.ReactNode> = {
    speeding: <Gauge size={16} className="text-red-500" />,
    geofence_violation: <MapPin size={16} className="text-orange-500" />,
    idle_too_long: <Clock size={16} className="text-yellow-500" />,
    signal_lost: <WifiOff size={16} className="text-gray-500" />,
  };
  return map[type] ?? <AlertTriangle size={16} className="text-gray-400" />;
};

const alertBadge = (type: string) => {
  const map: Record<string, string> = {
    speeding: 'bg-red-100 text-red-700',
    geofence_violation: 'bg-orange-100 text-orange-700',
    idle_too_long: 'bg-yellow-100 text-yellow-700',
    signal_lost: 'bg-gray-100 text-gray-600',
  };
  const label: Record<string, string> = {
    speeding: 'Kecepatan',
    geofence_violation: 'Geofence',
    idle_too_long: 'Idle',
    signal_lost: 'Sinyal',
  };
  return (
    <span className={`text-xs font-medium px-2 py-1 rounded-full ${map[type]}`}>
      {label[type]}
    </span>
  );
};

const formatDate = (date: string) =>
  new Date(date).toLocaleDateString('id-ID', {
    day: 'numeric', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });

const Alerts = () => {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);
  const [filterType, setFilterType] = useState('');
  const [filterRead, setFilterRead] = useState('');

  const fetchAlerts = async () => {
    try {
      const params = new URLSearchParams();
      if (filterType) params.append('type', filterType);
      if (filterRead !== '') params.append('is_read', filterRead);

      const [alertsRes, countRes] = await Promise.all([
        api.get(`/alerts?${params}`),
        api.get('/alerts/unread-count'),
      ]);
      setAlerts(alertsRes.data);
      setUnreadCount(countRes.data.count);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAlerts();
  }, [filterType, filterRead]);

  const handleReadOne = async (id: string) => {
    try {
      await api.put(`/alerts/${id}/read`);
      fetchAlerts();
    } catch (err) {
      console.error(err);
    }
  };

  const handleReadAll = async () => {
    try {
      await api.put('/alerts/read-all');
      fetchAlerts();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="p-6 flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-800 flex items-center gap-2">
            Notifikasi
            {unreadCount > 0 && (
              <span className="bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                {unreadCount}
              </span>
            )}
          </h1>
          <p className="text-sm text-gray-500">Alert & notifikasi kendaraan</p>
        </div>
        {unreadCount > 0 && (
          <button
            onClick={handleReadAll}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
          >
            <CheckCheck size={16} />
            Tandai Semua Dibaca
          </button>
        )}
      </div>

      {/* Filter */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
        <div className="flex flex-wrap gap-4">
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Tipe Alert</label>
            <select
              value={filterType}
              onChange={e => setFilterType(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Semua Tipe</option>
              <option value="speeding">Kecepatan</option>
              <option value="geofence_violation">Geofence</option>
              <option value="idle_too_long">Idle Terlalu Lama</option>
              <option value="signal_lost">Sinyal Hilang</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Status Baca</label>
            <select
              value={filterRead}
              onChange={e => setFilterRead(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Semua</option>
              <option value="false">Belum Dibaca</option>
              <option value="true">Sudah Dibaca</option>
            </select>
          </div>
        </div>
      </div>

      {/* Alert List */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100">
          <h2 className="font-semibold text-gray-800">
            Daftar Alert
            <span className="ml-2 text-sm font-normal text-gray-400">({alerts.length} data)</span>
          </h2>
        </div>

        {loading ? (
          <div className="p-8 text-center text-gray-400">Memuat data...</div>
        ) : alerts.length === 0 ? (
          <div className="p-8 text-center text-gray-400">
            <BellOff size={32} className="mx-auto mb-2 opacity-40" />
            Tidak ada alert
          </div>
        ) : (
          <div className="divide-y divide-gray-50">
            {alerts.map(alert => (
              <div
                key={alert.id}
                className={`flex items-start gap-4 px-5 py-4 transition-colors ${
                  !alert.is_read ? 'bg-blue-50/50' : 'hover:bg-gray-50'
                }`}
              >
                {/* Icon */}
                <div className={`p-2 rounded-lg mt-0.5 ${
                  alert.type === 'speeding' ? 'bg-red-100' :
                  alert.type === 'geofence_violation' ? 'bg-orange-100' :
                  alert.type === 'idle_too_long' ? 'bg-yellow-100' : 'bg-gray-100'
                }`}>
                  {alertIcon(alert.type)}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <p className="font-medium text-gray-800 text-sm">{alert.plate_number}</p>
                    <span className="text-gray-400">·</span>
                    <p className="text-gray-500 text-sm">{alert.brand} {alert.model}</p>
                    {alertBadge(alert.type)}
                    {!alert.is_read && (
                      <span className="w-2 h-2 rounded-full bg-blue-500 inline-block" />
                    )}
                  </div>
                  <p className="text-sm text-gray-600 mb-1">{alert.message}</p>
                  <p className="text-xs text-gray-400">{formatDate(alert.triggered_at)}</p>
                </div>

                {/* Action */}
                {!alert.is_read && (
                  <button
                    onClick={() => handleReadOne(alert.id)}
                    className="shrink-0 p-1.5 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors"
                    title="Tandai dibaca"
                  >
                    <Bell size={14} />
                  </button>
                )}
                {alert.is_read && (
                  <div className="shrink-0 p-1.5 text-gray-300" title="Sudah dibaca">
                    <BellOff size={14} />
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Alerts;