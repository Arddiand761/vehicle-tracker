import { useEffect, useState, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Car, Users, Navigation, AlertTriangle } from 'lucide-react';
import api from '../api/axios';
import type { DashboardSummary, Location } from '../types/index';

// fix icon leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

// custom marker per status
const createIcon = (status: string) => {
  const color = status === 'active' ? '#16a34a' : status === 'idle' ? '#ca8a04' : '#dc2626';
  return L.divIcon({
    className: '',
    html: `
      <div style="display:flex; flex-direction:column; align-items:center;">
        <div style="
          background:${color};
          border-radius:8px;
          padding:4px 6px;
          box-shadow:0 2px 6px rgba(0,0,0,0.3);
          border:2px solid white;
          font-size:18px;
          line-height:1;
        ">🚗</div>
        <div style="
          width:0; height:0;
          border-left:5px solid transparent;
          border-right:5px solid transparent;
          border-top:6px solid ${color};
        "></div>
      </div>
    `,
    iconSize: [34, 40],
    iconAnchor: [17, 40],
    popupAnchor: [0, -40],
  });
};



// komponen buat auto-fit bounds
const FitBounds = ({ locations }: { locations: Location[] }) => {
  const map = useMap();
  useEffect(() => {
    if (locations.length > 0) {
      const bounds = L.latLngBounds(locations.map(l => [l.latitude, l.longitude]));
      map.fitBounds(bounds, { padding: [40, 40] });
    }
  }, [locations, map]);
  return null;
};

type StatCardProps = {
  label: string;
  value: number;
  icon: React.ReactNode;
  color: string;
  sub?: { label: string; value: number; color: string }[];
};

const StatCard = ({ label, value, icon, color, sub }: StatCardProps) => (
  <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
    <div className="flex items-center justify-between mb-3">
      <p className="text-sm text-gray-500">{label}</p>
      <div className={`p-2 rounded-lg ${color}`}>{icon}</div>
    </div>
    <p className="text-3xl font-bold text-gray-800 mb-3">{value}</p>
    {sub && (
      <div className="flex gap-3 flex-wrap">
        {sub.map(s => (
          <span key={s.label} className={`text-xs font-medium px-2 py-0.5 rounded-full ${s.color}`}>
            {s.label}: {s.value}
          </span>
        ))}
      </div>
    )}
  </div>
);

const Dashboard = () => {
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [locations, setLocations] = useState<Location[]>([]);
  const [showActive, setShowActive] = useState(true);
  const [showIdle, setShowIdle] = useState(true);
  const [showOffline, setShowOffline] = useState(true);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const fetchSummary = async () => {
    try {
      const res = await api.get('/dashboard/summary');
      setSummary(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchLocations = async () => {
    try {
      const res = await api.get('/tracking/live');
      setLocations(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchSummary();
    fetchLocations();

    // polling tiap 5 detik
    intervalRef.current = setInterval(() => {
      fetchLocations();
      fetchSummary();
    }, 5000);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  const filteredLocations = locations.filter(l => {
    if (l.vehicle_status === 'active' && !showActive) return false;
    if (l.vehicle_status === 'idle' && !showIdle) return false;
    if (l.vehicle_status === 'offline' && !showOffline) return false;
    return true;
  });

  return (
    <div className="p-6 flex flex-col gap-6">

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard
          label="Total Kendaraan"
          value={Number(summary?.vehicles.total ?? 0)}
          icon={<Car size={18} className="text-blue-600" />}
          color="bg-blue-50"
          sub={[
            { label: 'Aktif', value: Number(summary?.vehicles.active ?? 0), color: 'bg-green-100 text-green-700' },
            { label: 'Idle', value: Number(summary?.vehicles.idle ?? 0), color: 'bg-yellow-100 text-yellow-700' },
            { label: 'Offline', value: Number(summary?.vehicles.offline ?? 0), color: 'bg-red-100 text-red-700' },
          ]}
        />
        <StatCard
          label="Total Driver"
          value={Number(summary?.drivers.total ?? 0)}
          icon={<Users size={18} className="text-purple-600" />}
          color="bg-purple-50"
          sub={[
            { label: 'Tersedia', value: Number(summary?.drivers.available ?? 0), color: 'bg-green-100 text-green-700' },
            { label: 'Dalam Trip', value: Number(summary?.drivers.on_trip ?? 0), color: 'bg-blue-100 text-blue-700' },
          ]}
        />
        <StatCard
          label="Trip Hari Ini"
          value={Number(summary?.trips.completed_today ?? 0)}
          icon={<Navigation size={18} className="text-green-600" />}
          color="bg-green-50"
          sub={[
            { label: 'Ongoing', value: Number(summary?.trips.ongoing ?? 0), color: 'bg-blue-100 text-blue-700' },
            { label: `${Number(summary?.trips.distance_today_km ?? 0).toFixed(1)} km`, value: 0, color: 'bg-gray-100 text-gray-600' },
          ]}
        />
        <StatCard
          label="Alert Hari Ini"
          value={Number(summary?.alerts.today ?? 0)}
          icon={<AlertTriangle size={18} className="text-red-600" />}
          color="bg-red-50"
          sub={[
            { label: 'Belum Dibaca', value: Number(summary?.alerts.unread ?? 0), color: 'bg-red-100 text-red-700' },
          ]}
        />
      </div>

      {/* Filter toggle */}
      <div className="flex gap-3 flex-wrap">
        <button
          onClick={() => setShowActive(!showActive)}
          className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium border transition-all ${
            showActive ? 'bg-green-500 text-white border-green-500' : 'bg-white text-gray-500 border-gray-300'
          }`}
        >
          <span className="w-2 h-2 rounded-full bg-current" />
          Kendaraan Beroperasi ({summary?.vehicles.active ?? 0})
        </button>
        <button
          onClick={() => setShowIdle(!showIdle)}
          className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium border transition-all ${
            showIdle ? 'bg-yellow-500 text-white border-yellow-500' : 'bg-white text-gray-500 border-gray-300'
          }`}
        >
          <span className="w-2 h-2 rounded-full bg-current" />
          Kendaraan Idle ({summary?.vehicles.idle ?? 0})
        </button>
        <button
          onClick={() => setShowOffline(!showOffline)}
          className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium border transition-all ${
            showOffline ? 'bg-red-500 text-white border-red-500' : 'bg-white text-gray-500 border-gray-300'
          }`}
        >
          <span className="w-2 h-2 rounded-full bg-current" />
          Kendaraan Mati ({summary?.vehicles.offline ?? 0})
        </button>
      </div>

      {/* Map */}
      <div className="rounded-xl overflow-hidden shadow-sm border border-gray-100" style={{ height: '500px' }}>
        <MapContainer
          center={[-7.7956, 110.3695]}
          zoom={13}
          style={{ height: '100%', width: '100%' }}
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          />
          {filteredLocations.length > 0 && <FitBounds locations={filteredLocations} />}
          {filteredLocations.map(loc => (
            <Marker
              key={loc.vehicle_id}
              position={[loc.latitude, loc.longitude]}
              icon={createIcon(loc.vehicle_status)}
            >
              <Popup>
                <div className="text-sm">
                  <p className="font-bold">{loc.plate_number}</p>
                  <p className="text-gray-500">{loc.brand} {loc.model}</p>
                  <p>Driver: {loc.driver_name ?? '-'}</p>
                  <p>Kecepatan: {loc.speed_kmh?.toFixed(1)} km/h</p>
                  <p>Status: <span className={
                    loc.vehicle_status === 'active' ? 'text-green-600' :
                    loc.vehicle_status === 'idle' ? 'text-yellow-600' : 'text-red-600'
                  }>{loc.vehicle_status}</span></p>
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>

    </div>
  );
};

export default Dashboard;