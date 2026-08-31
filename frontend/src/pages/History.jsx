import React, { useState, useEffect, useContext } from 'react';
import { Navigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { predictionsAPI } from '../utils/api';
import GlassCard from '../components/GlassCard';
import Button from '../components/Button';
import { History as HistoryIcon, ChevronLeft, ChevronRight, Download } from 'lucide-react';
import ImageModal from '../components/ImageModal';

const getCropEmoji = (crop) => {
  const map = { "Tomato": "🍅", "Onion": "🧅", "Cucumber": "🥒", "Potato": "🥔" };
  return map[crop] || "🌾";
};

const getRiskColor = (risk) => {
  if (risk === "HIGH") return "bg-red-500 text-white";
  if (risk === "MEDIUM") return "bg-orange-500 text-white";
  return "bg-green-500 text-white";
};

const CROP_LIST = ["Tomato", "Onion", "Cucumber", "Potato"];
const DISTRICT_LIST = [
  "Bagalkot", "Ballari", "Belagavi", "Bengaluru Rural", "Bengaluru Urban",
  "Bidar", "Chamarajanagar", "Chikkaballapur", "Chitradurga", "Dakshina Kannada",
  "Davangere", "Dharwad", "Gadag", "Hassan", "Haveri", "Kalaburagi", "Kodagu",
  "Kolar", "Koppal", "Mandya", "Mysuru", "Raichur", "Ramanagara", "Shivamogga",
  "Tumakuru", "Udupi", "Uttara Kannada", "Vijayanagar", "Vijayapura", "Yadgir",
];

const History = () => {
  const { user } = useContext(AuthContext);
  const [predictions, setPredictions] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalImageSrc, setModalImageSrc] = useState(null);
  
  // Filtering state
  const [cropFilter, setCropFilter] = useState("All");
  const [districtFilter, setDistrictFilter] = useState("All");

  // Pagination state
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const pageSize = 10;

  useEffect(() => {
    const fetchHistory = async () => {
      setLoading(true);
      try {
        const params = { page, page_size: pageSize };
        if (cropFilter !== "All") params.crop = cropFilter;
        if (districtFilter !== "All") params.district = districtFilter;
        
        const res = await predictionsAPI.list(params);
        setPredictions(res.data.predictions || []);
        setTotal(res.data.total || 0);
      } catch (err) {
        console.error("Failed to load prediction history", err);
      } finally {
        setLoading(false);
      }
    };
    if (user && user.role === 'farmer') {
       fetchHistory();
    }
  }, [user, page, cropFilter, districtFilter]);

  if (!user) return <Navigate to="/login" />;
  if (user.role !== 'farmer') return <Navigate to="/dashboard" />;

  const totalPages = Math.ceil(total / pageSize) || 1;

  // --- Export to CSV ---
  const handleExportCSV = () => {
    if (predictions.length === 0) return;
    const headers = ["ID", "Crop", "District", "Temp", "Humidity", "Road", "Spoilage_Prob", "Loss_Pct", "Financial_Loss", "Risk", "Recommended_Facility", "Date"];
    const rows = predictions.map(p => [
      p.id, p.crop, p.district, p.temperature, p.humidity, p.road_condition,
      p.spoilage_probability, p.loss_percentage, p.financial_loss, p.risk_level,
      p.recommended_facility, p.created_at
    ]);
    
    const csvContent = [headers.join(","), ...rows.map(r => r.join(","))].join("\n");
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", "prediction_history.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="w-full px-4 sm:px-[2cm] pb-12 space-y-8">
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-2"><HistoryIcon className="text-primary" /> Prediction History</h1>
        <p className="text-text-muted">Complete record of all your crop spoilage analysis runs</p>
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="text-sm font-medium text-text-muted mb-1 block flex items-center gap-2">🌱 Filter by Crop</label>
          <select value={cropFilter} onChange={(e) => {setCropFilter(e.target.value); setPage(1);}} className="input-field bg-background/50 dark:bg-black/90 dark:text-white w-full">
            <option value="All">All</option>
            {CROP_LIST.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
        <div>
          <label className="text-sm font-medium text-text-muted mb-1 block flex items-center gap-2">📍 Filter by District</label>
          <select value={districtFilter} onChange={(e) => {setDistrictFilter(e.target.value); setPage(1);}} className="input-field bg-background/50 dark:bg-black/90 dark:text-white w-full">
            <option value="All">All</option>
            {DISTRICT_LIST.map(d => <option key={d} value={d}>{d}</option>)}
          </select>
        </div>
        <div className="flex items-end">
           <Button onClick={handleExportCSV} className="w-full bg-primary/20 hover:bg-primary/40 text-primary py-2.5 flex justify-center items-center gap-2">
             <Download size={18} /> Export to CSV
           </Button>
        </div>
      </div>

      <GlassCard className="p-6">
        {loading ? (
          <div className="py-12 flex justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
          </div>
        ) : predictions.length === 0 ? (
          <div className="py-12 text-center text-text-muted">
            <HistoryIcon size={48} className="mx-auto mb-4 opacity-50" />
            <p>No predictions found for these filters.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
          <div className="space-y-4">
            {predictions.map((p) => {
              const risk = p.risk_level || "LOW";
              const predIdStr = `PRED-${p.id.toString().padStart(4, '0')}`;
              const createdAt = new Date(p.created_at).toLocaleString();
              
              return (
                <div key={p.id} className="border border-glass-border rounded-xl p-5 bg-background/50 hover:bg-background/80 transition-colors">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-xl font-bold flex items-center gap-2 mb-1">
                        {getCropEmoji(p.crop)} {p.crop}
                      </h3>
                      <div className="text-sm text-text-muted">
                        Record ID: <span className="text-green-500 font-medium">#{predIdStr}</span> &nbsp;&nbsp;|&nbsp;&nbsp; Timestamp: {createdAt}
                      </div>
                    </div>
                    <div className={`px-4 py-1.5 rounded-md font-bold text-xs tracking-wider ${getRiskColor(risk)}`}>
                      {risk} RISK
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm mb-4">
                    <div>
                      <div className="mb-2"><strong>Quantity:</strong> {p.quantity_tons} Tons &nbsp;&nbsp;|&nbsp;&nbsp; 📍 <strong>District:</strong> {p.district}</div>
                      <div className="mb-2"><strong>Quality Inspection:</strong> AI Assessed</div>
                      <div><strong>Recommended Facility:</strong> {p.recommended_facility || 'N/A'}</div>
                    </div>
                    <div>
                      <div className="mb-2"><strong>Spoilage Prob:</strong> {(p.spoilage_probability * 100).toFixed(1)}%</div>
                      <div><strong>Estimated Loss:</strong> {p.loss_percentage.toFixed(1)}% (₹{p.financial_loss.toLocaleString('en-IN', {maximumFractionDigits: 0})})</div>
                    </div>
                  </div>
                  
                  <details className="pt-4 border-t border-glass-border group">
                    <summary className="text-primary font-medium cursor-pointer list-none flex items-center gap-2 select-none">
                      <span className="group-open:rotate-90 transition-transform">▶</span> View Detailed Telemetry Snapshot
                    </summary>
                    <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4 text-sm bg-black/20 p-4 rounded-lg">
                      <div>
                        <ul className="space-y-2 text-text-muted">
                          <li><strong className="text-text-main">Ambient Temp:</strong> {p.temperature}°C</li>
                          <li><strong className="text-text-main">Humidity:</strong> {p.humidity}%</li>
                          <li><strong className="text-text-main">Road Infrastructure:</strong> {p.road_condition}</li>
                          <li><strong className="text-text-main">Harvest Date:</strong> {new Date(p.created_at).toISOString().split('T')[0]}</li>
                        </ul>
                      </div>
                      <div>
                        <ul className="space-y-2 text-text-muted">
                          <li><strong className="text-text-main">Transit Window (Actual/Expected):</strong> {p.actual_transit_days.toFixed(1)} / {p.expected_transit_days.toFixed(1)} Days</li>
                          <li><strong className="text-text-main">Remaining Shelf Life:</strong> {p.shelf_life_days.toFixed(1)} Days</li>
                        </ul>
                      </div>
                    </div>
                    
                    {p.image_data && (
                      <div className="mt-4 border-t border-white/5 pt-4">
                        <strong className="text-text-main block mb-2">Uploaded Image:</strong>
                        <img 
                          src={p.image_data.startsWith('data:image') ? p.image_data : `data:image/jpeg;base64,${p.image_data}`} 
                          alt="Analyzed crop" 
                          className="w-64 rounded-lg object-cover border border-white/10 shadow-lg cursor-pointer hover:opacity-80 transition-opacity"
                          onClick={() => {
                            setModalImageSrc(p.image_data.startsWith('data:image') ? p.image_data : `data:image/jpeg;base64,${p.image_data}`);
                            setIsModalOpen(true);
                          }}
                        />
                      </div>
                    )}
                  </details>
                </div>
              );
            })}
            </div>
            {/* Pagination Controls */}
            <div className="flex justify-between items-center mt-6 pt-4 border-t border-glass-border">
              <span className="text-sm text-text-muted">
                Showing {((page - 1) * pageSize) + 1} to {Math.min(page * pageSize, total)} of {total} entries
              </span>
              <div className="flex gap-2">
                <Button variant="secondary" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="px-3">
                  <ChevronLeft size={18} />
                </Button>
                <div className="flex items-center px-4 font-medium">{page} / {totalPages}</div>
                <Button variant="secondary" onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="px-3">
                  <ChevronRight size={18} />
                </Button>
              </div>
            </div>
          </div>
        )}
      </GlassCard>

      <ImageModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} imageSrc={modalImageSrc} />
    </div>
  );
};

export default History;
