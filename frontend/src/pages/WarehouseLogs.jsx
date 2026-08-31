import React, { useState, useEffect, useContext } from 'react';
import { Navigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import GlassCard from '../components/GlassCard';
import Button from '../components/Button';
import { warehousesAPI, shipmentsAPI } from '../utils/api';
import { Search, Filter, Download } from 'lucide-react';

const WarehouseLogs = () => {
  const { user, selectedAdminWarehouseId } = useContext(AuthContext);
  const [allShipments, setAllShipments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  useEffect(() => {
    if (user && (user.role === 'warehouse_manager' || user.role === 'admin')) {
      const loadData = async () => {
        try {
          const whRes = await warehousesAPI.list();
          let wh;
          if (user.role === 'admin') {
            wh = selectedAdminWarehouseId 
              ? whRes.data.find(w => w.id === selectedAdminWarehouseId)
              : (whRes.data.length > 0 ? whRes.data[0] : null);
          } else {
            wh = whRes.data.find(w => w.id === user.managed_warehouse_id);
          }
          if (wh) {
            const shipRes = await shipmentsAPI.list();
            setAllShipments(shipRes.data.filter(s => s.destination === wh.facility_name));
          }
        } catch (err) {
          console.error("Failed to load logs", err);
        } finally {
          setLoading(false);
        }
      };
      loadData();
    }
  }, [user, selectedAdminWarehouseId]);

  if (!user) return <Navigate to="/login" />;
  if (user.role !== 'warehouse_manager' && user.role !== 'admin') return <Navigate to="/dashboard" />;

  const filteredShipments = allShipments.filter(s => {
    const matchesSearch = (s.booking_id?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
                          (s.farmer_name?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
                          (s.vehicle_reg_number?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
                          (s.crop?.toLowerCase() || '').includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter ? s.status === statusFilter : true;
    return matchesSearch && matchesStatus;
  });

  const downloadCSV = () => {
    const headers = ['Date Logged', 'Booking ID', 'Farmer Details', 'Vehicle Reg', 'Crop', 'Qty (t)', 'Est. Shelf Life', 'Risk Level', 'Current Status', 'Last Updated'];
    const rows = filteredShipments.map(s => [
      s.created_at ? new Date(s.created_at).toLocaleString() : '-',
      s.booking_id,
      `${s.farmer_name || 'Unknown'} (${s.farmer_phone || 'N/A'})`,
      s.vehicle_reg_number || 'N/A',
      s.crop,
      s.tonnage,
      s.shelf_days_calculated ? s.shelf_days_calculated.toFixed(1) + ' days' : '-',
      s.risk_status || 'UNKNOWN',
      s.status,
      s.updated_at ? new Date(s.updated_at).toLocaleString() : '-'
    ]);

    const csvContent = [headers.join(','), ...rows.map(r => r.map(v => `"${String(v).replace(/"/g, '""')}"`).join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `warehouse_logs_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="w-full px-4 sm:px-[2cm] py-8">
      <div className="space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <h2 className="text-2xl font-bold flex items-center gap-2">📚 Shipment Logs & History</h2>
          <div className="flex items-center gap-4">
            <div className="relative">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
              <input 
                type="text" 
                placeholder="Search logs..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="input-field py-1.5 text-sm w-[250px] bg-background/50"
                style={{ paddingLeft: '2.5rem' }}
              />
            </div>
            <div className="relative">
              <Filter size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
              <select 
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="input-field py-1.5 text-sm bg-background/50 dark:bg-black/90 dark:text-white appearance-none"
                style={{ paddingLeft: '2.5rem' }}
              >
                <option value="">All Statuses</option>
                <option value="In Transit">In Transit</option>
                <option value="In Storage">In Storage</option>
                <option value="Delivered">Delivered</option>
                <option value="Redirected">Redirected</option>
                <option value="Listed (Standard Mandi)">Listed (Standard Mandi)</option>
                <option value="Listed (Accelerated)">Listed (Accelerated)</option>
              </select>
            </div>
            <Button onClick={downloadCSV} variant="secondary" className="!py-1.5 text-sm" icon={Download}>
              Export CSV
            </Button>
          </div>
        </div>
        
        {loading ? (
          <GlassCard className="p-6 text-center text-text-muted">Loading logs...</GlassCard>
        ) : (
          <GlassCard className="p-4 overflow-x-auto">
            {allShipments.length > 0 ? (
              <table className="w-full text-left text-sm border-collapse whitespace-nowrap">
                <thead>
                  <tr className="border-b border-glass-border text-text-muted">
                    <th className="py-3 pr-4">Date Logged</th>
                    <th className="py-3 pr-4">Booking ID</th>
                    <th className="py-3 pr-4">Farmer Details</th>
                    <th className="py-3 pr-4">Vehicle Reg</th>
                    <th className="py-3 pr-4">Crop</th>
                    <th className="py-3 pr-4">Qty (t)</th>
                    <th className="py-3 pr-4">Est. Shelf Life</th>
                    <th className="py-3 pr-4">Risk Level</th>
                    <th className="py-3 pr-4">Current Status</th>
                    <th className="py-3 pr-4">Last Updated</th>
                  </tr>
                </thead>
                <tbody>
                  {[...filteredShipments].sort((a,b) => new Date(b.created_at || 0) - new Date(a.created_at || 0)).map(s => (
                    <tr key={s.id} className="border-b border-glass-border/30 hover:bg-white/5 transition-colors">
                      <td className="py-3 pr-4">{s.created_at ? new Date(s.created_at).toLocaleString() : '-'}</td>
                      <td className="py-3 pr-4 font-mono font-medium">{s.booking_id}</td>
                      <td className="py-3 pr-4">
                        <div>{s.farmer_name || 'Unknown'}</div>
                        <div className="text-xs text-text-muted">{s.farmer_phone || 'N/A'}</div>
                      </td>
                      <td className="py-3 pr-4">{s.vehicle_reg_number || 'N/A'}</td>
                      <td className="py-3 pr-4">{s.crop}</td>
                      <td className="py-3 pr-4">{s.tonnage}</td>
                      <td className="py-3 pr-4">{s.shelf_days_calculated ? s.shelf_days_calculated.toFixed(1) + ' days' : '-'}</td>
                      <td className="py-3 pr-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                          (s.risk_status||'').includes('HIGH') ? 'bg-danger/20 text-danger' : 
                          (s.risk_status||'').includes('MEDIUM') ? 'bg-warning/20 text-warning' : 'bg-success/20 text-success'
                        }`}>
                          {s.risk_status || 'UNKNOWN'}
                        </span>
                      </td>
                      <td className="py-3 pr-4">
                        <span className="px-2 py-1 rounded bg-background/50 border border-glass-border text-xs">
                          {s.status}
                        </span>
                      </td>
                      <td className="py-3 pr-4 text-xs text-text-muted">{s.updated_at ? new Date(s.updated_at).toLocaleString() : '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : <div className="text-center py-10 text-text-muted text-lg">No history logs available.</div>}
          </GlassCard>
        )}
      </div>
    </div>
  );
};

export default WarehouseLogs;
