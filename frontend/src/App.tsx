import { BrowserRouter, Routes, Route, } from "react-router-dom";
import { Navbar } from "./components/Navbar";
import { ReportFound } from "./pages/ReportFound";
import { ReportLost } from "./pages/ReportLost";
import { Login } from "./pages/Login";
import { Home } from "./pages/Home";
import { AdminDashboard } from "./pages/AdminDashboard";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { Toaster } from "react-hot-toast";
// The Home Page Feed (We will build the actual feed component next)



export default function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-slate-50 text-slate-900">
        <Navbar />
        <Toaster position="top-center" reverseOrder={false} />
          <main className="flex-grow">
          <Routes>
            {/* These now point to your REAL components! */}
            <Route path="/" element={<Home />} />
            <Route path="/report-lost" element={<ProtectedRoute><ReportLost /></ProtectedRoute>} />
            <Route path="/report-found" element={<ProtectedRoute><ReportFound /></ProtectedRoute>} />
            <Route path="/login" element={<Login />} />
            <Route path="/admin" element={<ProtectedRoute requireAdmin={true}><AdminDashboard /></ProtectedRoute>} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}