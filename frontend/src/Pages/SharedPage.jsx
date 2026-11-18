import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import AppLayout from "../components/AppLayout";
import ImageViewer from "../components/ImageViewer";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000/api";
const request = async (path, options = {}) => {
  const response = await fetch(`${API_URL}${path}`, { ...options, credentials: "include", headers: { "Content-Type": "application/json", ...options.headers } });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.message || "Request failed");
  return data;
};

const SharedPage = () => {
  const [items, setItems] = useState([]);
  const [viewerPhoto, setViewerPhoto] = useState(null);

  useEffect(() => {
    request("/shares")
      .then(setItems)
      .catch((error) => toast.error(error.message));
  }, []);

  return (
    <AppLayout>
      <h1 className="text-4xl font-semibold tracking-tight">Shared</h1>
      <section className="mt-8">
        <h2 className="text-lg font-semibold">Shared with you</h2>
        <div className="mt-3 grid grid-cols-2 gap-4 md:grid-cols-3">
          {items.length === 0 && <p className="col-span-full py-16 text-center text-sm text-base-content/60">Nothing has been shared with you yet.</p>}
          {items.map((item) => item.resourceType === "photo"
            ? <article key={item._id}><button className="block w-full cursor-zoom-in" onClick={() => setViewerPhoto(item.resource)} type="button"><img alt={item.resource.title} className="aspect-square w-full rounded-box object-cover" src={item.resource.imageUrl} /></button><p className="mt-2 truncate text-sm font-medium">{item.resource.title}</p><p className="text-xs text-base-content/60">From {item.ownerId.userName}</p></article>
            : <div className="col-span-full" key={item._id}><div className="mb-3"><strong>{item.resource.folderName}</strong><p className="text-xs text-base-content/60">Folder from {item.ownerId.userName}</p></div><div className="grid grid-cols-2 gap-4 md:grid-cols-3">{item.photos?.map((photo) => <article key={photo._id}><button className="block w-full cursor-zoom-in" onClick={() => setViewerPhoto(photo)} type="button"><img alt={photo.title} className="aspect-square w-full rounded-box object-cover" src={photo.imageUrl} /></button><p className="mt-2 truncate text-sm">{photo.title}</p></article>)}</div></div>)}
        </div>
      </section>
      <ImageViewer photo={viewerPhoto} onClose={() => setViewerPhoto(null)} />
    </AppLayout>
  );
};

export default SharedPage;
