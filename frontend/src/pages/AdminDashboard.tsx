import React, { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import API from "../services/api";
import { useAuthStore } from "../store/authStore";
import { Trash2, Shield, AlertTriangle } from "lucide-react";

export const AdminDashboard: React.FC = () => {
  const { user } = useAuthStore();
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // If a regular user tries to type /admin in the URL, kick them out
  if (user?.role !== "ADMIN") {
    return <Navigate to="/" replace />;
  }

  useEffect(() => {
    fetchItems();
  }, []);

  const fetchItems = async () => {
    try {
      const res = await API.get("/items/admin/all");
      setItems(res.data);
    } catch (error) {
      console.error("Failed to fetch items:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Are you sure you want to permanently delete this item? This cannot be undone.")) return;
    
    try {
      await API.delete(`/items/${id}`);
      setItems(items.filter((item) => item.id !== id)); // Remove from UI without reloading
    } catch (error) {
      alert("Failed to delete item.");
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="flex items-center gap-3 mb-8 border-b border-slate-200 pb-4">
        <div className="bg-purple-100 p-3 rounded-lg">
          <Shield className="w-8 h-8 text-purple-700" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Command Center</h1>
          <p className="text-slate-500 text-sm">Manage campus inventory and moderate reports.</p>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-10 text-slate-500">Loading secure data...</div>
      ) : items.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-xl border border-dashed border-slate-300">
          No items in the database.
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-sm font-semibold text-slate-600">
                  <th className="p-4">Type</th>
                  <th className="p-4">Item Details</th>
                  <th className="p-4">Reporter Email</th>
                  <th className="p-4">Date</th>
                  <th className="p-4 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {items.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                    <td className="p-4">
                      <span className={`px-2.5 py-1 text-xs font-bold rounded-full ${item.type === 'LOST' ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800'}`}>
                        {item.type}
                      </span>
                    </td>
                    <td className="p-4">
                      <p className="font-semibold text-slate-800">{item.title}</p>
                      <p className="text-xs text-slate-500">{item.category}</p>
                    </td>
                    <td className="p-4 text-sm text-slate-600">{item.reporter.email}</td>
                    <td className="p-4 text-sm text-slate-500">
                      {new Date(item.createdAt).toLocaleDateString()}
                    </td>
                    <td className="p-4 text-center">
                      <button 
                        onClick={() => handleDelete(item.id)}
                        className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                        title="Delete Item"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};