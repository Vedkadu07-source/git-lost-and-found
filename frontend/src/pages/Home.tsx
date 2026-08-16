import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import API from "../services/api";
import { MapPin, Search, Calendar, User, Loader2 } from "lucide-react";

interface Item {
  id: string;
  type: "LOST" | "FOUND";
  title: string;
  description: string;
  category: string;
  imageUrl?: string;
  latitude?: number;
  longitude?: number;
  createdAt: string;
  reporter: {
    name: string;
    avatarUrl: string;
  };
}

export const Home: React.FC = () => {
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState("ALL");
  
  // New Pagination States
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);

  // Reset to page 1 instantly if the user types a new search or changes the filter
  useEffect(() => {
    setPage(1);
  }, [searchQuery, filterType]);

  useEffect(() => {
    const fetchItems = async () => {
      try {
        if (page === 1) setLoading(true);
        else setLoadingMore(true);

        const response = await API.get("/items", {
          params: { search: searchQuery, type: filterType, page, limit: 9 }
        });
        
        // If it's page 1, replace the list. If it's page 2+, attach to the bottom.
        if (page === 1) {
          setItems(response.data.items);
        } else {
          setItems(prev => [...prev, ...response.data.items]);
        }
        
        setHasMore(response.data.hasMore);
      } catch (err) {
        console.error("Failed to fetch items:", err);
        setError("Failed to load the feed. Please try again later.");
      } finally {
        setLoading(false);
        setLoadingMore(false);
      }
    };
    
    const delayDebounceFn = setTimeout(() => {
      fetchItems();
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery, filterType, page]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Hero Section */}
      <div className="text-center mb-16">
        <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight sm:text-5xl mb-4">
          Campus Lost & Found
        </h1>
        <p className="text-lg text-slate-600 max-w-2xl mx-auto mb-8">
          Help keep the GIT community connected. Report what you've lost, or return what you've found.
        </p>
        <div className="flex justify-center gap-4">
          <Link
            to="/report-lost"
            className="px-6 py-3 bg-amber-500 hover:bg-amber-600 text-white font-semibold rounded-lg shadow-md transition-colors flex items-center gap-2"
          >
            <Search className="w-5 h-5" /> I Lost Something
          </Link>
          <Link
            to="/report-found"
            className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-lg shadow-md transition-colors flex items-center gap-2"
          >
            <MapPin className="w-5 h-5" /> I Found Something
          </Link>
        </div>
      </div>

      {/* Feed Section */}
      <h2 className="text-2xl font-bold text-slate-800 mb-6 border-b pb-2">Recent Activity</h2>

      <div className="flex flex-col sm:flex-row gap-4 mb-8">
        <div className="relative flex-1">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-slate-400" />
          </div>
          <input
            type="text"
            className="block w-full pl-10 pr-3 py-3 border border-slate-200 rounded-lg focus:ring-blue-500 focus:border-blue-500 bg-white shadow-sm"
            placeholder="Search for watches, ID cards, keys..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <select
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
          className="px-4 py-3 border border-slate-200 rounded-lg bg-white shadow-sm focus:ring-blue-500 font-medium text-slate-700"
        >
          <option value="ALL">All Items</option>
          <option value="LOST">Lost Only</option>
          <option value="FOUND">Found Only</option>
        </select>
      </div>

      {loading ? (
        <div className="text-center py-20 text-slate-500 font-medium animate-pulse">
          Loading campus items...
        </div>
      ) : error ? (
        <div className="text-center py-20 text-rose-500 font-medium">{error}</div>
      ) : items.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-xl border border-dashed border-slate-300 text-slate-500">
          No items match your search.
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {items.map((item) => (
              <div key={item.id} className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden hover:shadow-md transition-shadow flex flex-col">
                {item.imageUrl ? (
                  <div className="h-48 w-full bg-slate-100 relative">
                    <img src={item.imageUrl} alt={item.title} className="w-full h-full object-cover" />
                    <div className={`absolute top-3 right-3 px-3 py-1 rounded-full text-xs font-bold text-white shadow-sm ${item.type === 'LOST' ? 'bg-amber-500' : 'bg-emerald-600'}`}>
                      {item.type}
                    </div>
                  </div>
                ) : (
                  <div className="h-24 w-full bg-slate-100 flex items-center justify-center relative">
                    <span className="text-slate-400 text-sm">No photo provided</span>
                    <div className={`absolute top-3 right-3 px-3 py-1 rounded-full text-xs font-bold text-white shadow-sm ${item.type === 'LOST' ? 'bg-amber-500' : 'bg-emerald-600'}`}>
                      {item.type}
                    </div>
                  </div>
                )}

                <div className="p-5 flex-1 flex flex-col">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="text-xl font-bold text-slate-900 line-clamp-1">{item.title}</h3>
                  </div>
                  <span className="inline-block bg-blue-50 text-blue-700 text-xs font-semibold px-2 py-1 rounded w-max mb-3">
                    {item.category}
                  </span>
                  <p className="text-slate-600 text-sm mb-4 line-clamp-3 flex-1">
                    {item.description}
                  </p>
                  <div className="mt-auto pt-4 border-t border-slate-100 flex flex-col gap-2 text-xs text-slate-500">
                    <div className="flex items-center gap-1.5">
                      <User className="w-4 h-4" />
                      <span>Reported by {item.reporter.name}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Calendar className="w-4 h-4" />
                      <span>{new Date(item.createdAt).toLocaleDateString()}</span>
                    </div>
                    {item.type === 'FOUND' && item.latitude && item.longitude && (
                      <div className="flex items-center gap-1.5 text-emerald-600 font-medium mt-1">
                        <MapPin className="w-4 h-4" />
                        <a 
                          href={`https://www.google.com/maps/search/?api=1&query=${item.latitude},${item.longitude}`} 
                          target="_blank" 
                          rel="noreferrer"
                          className="hover:underline"
                        >
                          View coordinates on map
                        </a>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Load More Button */}
          {hasMore && (
            <div className="mt-12 flex justify-center">
              <button
                onClick={() => setPage((prev) => prev + 1)}
                disabled={loadingMore}
                className="px-8 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-full transition-colors flex items-center gap-2"
              >
                {loadingMore ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" /> Loading...
                  </>
                ) : (
                  "Load More Items"
                )}
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};