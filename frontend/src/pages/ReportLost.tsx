import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../services/api";
import toast from  "react-hot-toast";

export const ReportLost: React.FC = () => {
  const navigate = useNavigate();
  const [image, setImage] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // 1. Trigger the loading toast before the API call starts
    const loadingToast = toast.loading("Reporting lost item...");
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    
    // 2. THIS IS THE FIX: Attach the image state to the payload!
    if (image) {
      formData.append("image", image);
    }

    try {
      // 3. Send the request to your backend
      await API.post("/items/lost", formData);
      
      // 4. Handle success
      toast.dismiss(loadingToast);
      toast.success("Lost item reported successfully!");
      navigate("/");
      
    } catch (error) {
      console.error("Lost Item Error:", error);
      
      // 5. Handle error
      toast.dismiss(loadingToast);
      toast.error("Failed to report lost item. Please try again.");
      
    } finally {
      setLoading(false);
    }
  };
    
  return (
    <div className="max-w-2xl mx-auto p-6 my-8 bg-white rounded-xl shadow-sm border border-slate-200">
      <h2 className="text-3xl font-bold text-slate-800 mb-6">Report a Lost Item</h2>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Item Title</label>
          <input name="title" required type="text" className="w-full p-2 border rounded-md" placeholder="What did you lose?" />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Category</label>
          <select name="category" className="w-full p-2 border rounded-md">
            <option value="Electronics">Electronics</option>
            <option value="Documents">Documents/ID</option>
            <option value="Keys">Keys</option>
            <option value="Clothing">Clothing</option>
            <option value="Other">Other</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Description & Last Known Location</label>
          <textarea name="description" required rows={4} className="w-full p-2 border rounded-md" placeholder="Where do you think you left it? Provide details."></textarea>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Reference Photo (Optional)</label>
          <input type="file" accept="image/*" onChange={(e) => setImage(e.target.files?.[0] || null)} className="w-full text-sm" />
        </div>

        <button disabled={loading} type="submit" className="w-full bg-amber-500 hover:bg-amber-600 text-white font-bold py-3 rounded-lg transition-colors mt-6">
          {loading ? "Submitting..." : "Submit Lost Item"}
        </button>
      </form>
    </div>
  );
};