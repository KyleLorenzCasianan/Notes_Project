import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import AppLayout from "../components/AppLayout";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000/api";
const request = async (path, options = {}) => {
  const response = await fetch(`${API_URL}${path}`, { ...options, credentials: "include", headers: { "Content-Type": "application/json", ...options.headers } });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.message || "Request failed");
  return data;
};

const TrashPage = () => {
  const [photos, setPhotos] = useState([]);
  useEffect(() => { request("/trash").then(setPhotos).catch((error) => toast.error(error.message)); }, []);

  const restore = async (id) => {
    try { const photo = await request(`/trash/photos/${id}/restore`, { method: "POST" }); setPhotos((current) => current.filter((item) => item._id !== photo._id)); toast.success("Photo restored"); } catch (error) { toast.error(error.message); }
  };
  const permanentlyDelete = async (id) => {
    if (!window.confirm("Permanently delete this photo?")) return;
    try { await request(`/trash/photos/${id}`, { method: "DELETE" }); setPhotos((current) => current.filter((item) => item._id !== id)); toast.success("Photo permanently deleted"); } catch (error) { toast.error(error.message); }
  };

  return <AppLayout><h1 className="text-4xl font-semibold tracking-tight">Trash</h1><p className="mt-2 text-sm text-base-content/60">Deleted photos are kept for 30 days.</p><div className="mt-8 grid grid-cols-2 gap-4 md:grid-cols-3">{photos.length === 0 && <p className="col-span-full py-16 text-center text-sm text-base-content/60">Your trash is empty.</p>}{photos.map((photo) => <article key={photo._id}><img alt={photo.title} className="aspect-square w-full rounded-box object-cover opacity-70" src={photo.imageUrl} /><p className="mt-2 truncate text-sm">{photo.title}</p><div className="mt-2 flex gap-2"><button className="btn btn-primary btn-xs" onClick={() => restore(photo._id)} type="button">Restore</button><button className="btn btn-error btn-xs" onClick={() => permanentlyDelete(photo._id)} type="button">Delete forever</button></div></article>)}</div></AppLayout>;
};

export default TrashPage;
