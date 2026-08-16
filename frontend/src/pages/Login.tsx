import React, { useState } from "react";
import { GoogleLogin, type CredentialResponse } from "@react-oauth/google";
import { useNavigate, Navigate } from "react-router-dom";
import { useAuthStore } from "../store/authStore";
import API from "../services/api";
import { ShieldAlert, GraduationCap } from "lucide-react";

export const Login: React.FC = () => {
  const navigate = useNavigate();
  const { setAuth, user } = useAuthStore();
  const [error, setError] = useState<string | null>(null);

  // If user is already logged in, redirect them away from the login page
  if (user) {
    return <Navigate to="/" replace />;
  }

  const handleGoogleSuccess = async (credentialResponse: CredentialResponse) => {
    try {
      setError(null);
      // Send the Google JWT token to our Express backend for validation
      const res = await API.post("/auth/google", {
        token: credentialResponse.credential,
      });

      // Save user and token to Zustand global state & LocalStorage
      setAuth(res.data.user, res.data.token);
      
      // Redirect to home page
      navigate("/");
    } catch (err: any) {
      console.error("Login Error:", err);
      setError(
        err.response?.data?.error || "Authentication failed. Please try again."
      );
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full bg-white p-8 rounded-2xl shadow-xl border border-slate-100">
        <div className="text-center mb-8">
          <div className="mx-auto bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mb-4">
            <GraduationCap className="w-8 h-8 text-blue-600" />
          </div>
          <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">
            Student Portal
          </h2>
          <p className="text-slate-500 mt-2 text-sm font-medium">
            Sign in to access the GIT Lost & Found network.
          </p>
        </div>

        {error && (
          <div className="mb-6 bg-rose-50 border border-rose-200 text-rose-700 px-4 py-3 rounded-lg flex items-start gap-3">
            <ShieldAlert className="w-5 h-5 flex-shrink-0 mt-0.5" />
            <span className="text-sm font-medium">{error}</span>
          </div>
        )}

        <div className="flex justify-center border-t border-slate-100 pt-8">
          <GoogleLogin
            onSuccess={handleGoogleSuccess}
            onError={() => setError("Google widget failed to load.")}
            useOneTap
            shape="pill"
            theme="outline"
            text="continue_with"
          />
        </div>

        <div className="mt-8 text-center">
          <p className="text-xs text-slate-400 font-medium">
            Strictly restricted to <span className="text-slate-600 font-bold">@git-india.edu.in</span> accounts.
          </p>
        </div>
      </div>
    </div>
  );
};