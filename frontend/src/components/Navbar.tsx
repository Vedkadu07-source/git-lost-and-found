import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuthStore } from "../store/authStore";
import { MapPin, PlusCircle, Search, Shield, LogOut } from "lucide-react";

export const Navbar: React.FC = () => {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <nav className="bg-slate-900 border-b border-slate-800 text-white sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Campus Tag */}
          <Link to="/" className="flex items-center gap-2 font-bold text-xl tracking-tight">
            <MapPin className="text-blue-500 w-6 h-6" />
            <span>GIT Lost & Found</span>
          </Link>

          {/* Nav Links */}
          <div className="flex items-center gap-4">
            <Link
              to="/report-lost"
              className="flex items-center gap-1.5 text-sm font-medium text-slate-300 hover:text-white transition-colors"
            >
              <Search className="w-4 h-4 text-amber-400" />
              <span className="hidden sm:inline">Report Lost</span>
            </Link>

            <Link
              to="/report-found"
              className="flex items-center gap-1.5 text-sm font-medium text-slate-300 hover:text-white transition-colors"
            >
              <PlusCircle className="w-4 h-4 text-emerald-400" />
              <span className="hidden sm:inline">Report Found</span>
            </Link>

            {user?.role === "ADMIN" && (
              <Link
                to="/admin"
                className="flex items-center gap-1.5 text-sm font-medium text-purple-400 hover:text-purple-300 transition-colors"
              >
                <Shield className="w-4 h-4" />
                <span className="hidden sm:inline">Admin Center</span>
              </Link>
            )}

            {user ? (
              <div className="flex items-center gap-3 border-l border-slate-800 pl-4">
                <span className="text-xs text-slate-400 hidden md:inline">{user.email}</span>
                <button
                  onClick={handleLogout}
                  className="p-1.5 text-slate-400 hover:text-rose-400 rounded-lg transition-colors"
                  title="Logout"
                >
                  <LogOut className="w-5 h-5" />
                </button>
              </div>
            ) : (
              <Link
                to="/login"
                className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors"
              >
                Sign In
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};