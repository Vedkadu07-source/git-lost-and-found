import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
import API from "../services/api";
import toast from "react-hot-toast";

// Gharda Institute of Technology Approximate Coordinates
const GIT_CENTER: [number, number] = [17.650280, 73.464170 ];

// Component to handle map clicks
const LocationPicker = ({ position, setPosition }: { position: any; setPosition: any }) => {
  useMapEvents({
    click(e) {
      setPosition([e.latlng.lat, e.latlng.lng]);
    },
  });
  return position ? <Marker position={position} /> : null;
};

export const ReportFound: React.FC = () => {
  const navigate = useNavigate();
  const [position, setPosition] = useState<[number, number] | null>(null);
  const [image, setImage] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!position) {
      toast.error("Please click on the map to drop a location pin.");
      return;
    }
    if (!image) {
      toast.error("Please upload a photo of the found item.");
      return;
    }

    // Show a loading toast that we can dismiss later
    const loadingToast = toast.loading("Uploading to Cloud...");
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    formData.append("latitude", position[0].toString());
    formData.append("longitude", position[1].toString());
    formData.append("image", image); 

    try {
      await API.post("/items/found", formData);
      toast.dismiss(loadingToast); // clear the loading spinner
      toast.success("Found item reported successfully!");
      navigate("/");
    } catch (error) {
      console.error(error);
      toast.dismiss(loadingToast);
      toast.error("Failed to report item. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 my-8 bg-white rounded-xl shadow-sm border border-slate-200">
      <h2 className="text-3xl font-bold text-slate-800 mb-6">Report a Found Item</h2>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Item Title</label>
              <input name="title" required type="text" className="w-full p-2 border rounded-md" placeholder="e.g., Blue Casio Watch" />
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
              <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
              <textarea name="description" required rows={3} className="w-full p-2 border rounded-md" placeholder="Any distinguishing marks?"></textarea>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Upload Photo (Required)</label>
              <input type="file" accept="image/*" required onChange={(e) => setImage(e.target.files?.[0] || null)} className="w-full text-sm" />
            </div>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-slate-700">Pinpoint Location Found (Required)</label>
            <p className="text-xs text-slate-500 mb-2">Click on the map to drop a pin.</p>
            <div className="h-[350px] w-full rounded-lg overflow-hidden border border-slate-300">
              <MapContainer center={GIT_CENTER} zoom={19} scrollWheelZoom={true} style={{ height: "100%", width: "100%" }}>
              <TileLayer 
               url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}" 
               attribution="&copy; Esri"
               maxZoom={18}
               />
                <LocationPicker position={position} setPosition={setPosition} />
              </MapContainer>
            </div>
          </div>
        </div>

        <button disabled={loading} type="submit" className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 rounded-lg transition-colors">
          {loading ? "Uploading to Cloud..." : "Submit Found Item"}
        </button>
      </form>
    </div>
  );
};