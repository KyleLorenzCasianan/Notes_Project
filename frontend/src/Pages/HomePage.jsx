import AppLayout from "../components/AppLayout";
import { useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000/api";

const request = async (path, options = {}) => {
  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    credentials: "include",
    headers: { "Content-Type": "application/json", ...options.headers },
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.message || "Request failed");
  return data;
};

const HomePage = () => {
  const fileInput = useRef(null);
  const [photos, setPhotos] = useState([]);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    request("/photos")
      .then(setPhotos)
      .catch((error) => toast.error(error.message));
  }, []);

  const uploadPhoto = async (event) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;

    setUploading(true);
    try {
      const signature = await request("/photos/upload-signature");
      const formData = new FormData();
      formData.append("file", file);
      formData.append("api_key", signature.apiKey);
      formData.append("folder", signature.folder);
      formData.append("signature", signature.signature);
      formData.append("timestamp", signature.timestamp);

      const uploadResponse = await fetch(
        `https://api.cloudinary.com/v1_1/${signature.cloudName}/image/upload`,
        { method: "POST", body: formData }
      );
      const cloudinaryPhoto = await uploadResponse.json();
      if (!uploadResponse.ok) throw new Error(cloudinaryPhoto.error?.message || "Cloudinary upload failed");

      const photo = await request("/photos", {
        method: "POST",
        body: JSON.stringify({
          title: file.name.replace(/\.[^/.]+$/, ""),
          imageUrl: cloudinaryPhoto.secure_url,
          publicId: cloudinaryPhoto.public_id,
          width: cloudinaryPhoto.width,
          height: cloudinaryPhoto.height,
          format: cloudinaryPhoto.format,
          size: file.size,
        }),
      });
      setPhotos((current) => [photo, ...current]);
      toast.success("Photo uploaded");
    } catch (error) {
      toast.error(error.message);
    } finally {
      setUploading(false);
    }
  };

  return (
    <AppLayout>
      <div className="flex items-center justify-between gap-5">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-base-content/50">Your library</p>
          <h1 className="mt-2 text-4xl font-semibold tracking-tight">Home</h1>
        </div>
        <button className="btn btn-primary" disabled={uploading} onClick={() => fileInput.current?.click()} type="button">
          {uploading ? <span className="loading loading-spinner loading-sm" /> : "Add photos"}
        </button>
        <input accept="image/*" className="hidden" onChange={uploadPhoto} ref={fileInput} type="file" />
      </div>

      {photos.length ? (
        <div className="mt-10 grid grid-cols-2 gap-4 md:grid-cols-3">
          {photos.map((photo) => (
            <article key={photo._id}>
              <img alt={photo.title} className="aspect-square w-full rounded-box object-cover" src={photo.imageUrl} />
              <p className="mt-2 truncate text-sm font-medium">{photo.title}</p>
            </article>
          ))}
        </div>
      ) : (
        <div className="py-32 text-center text-sm text-base-content/60">Your photo library is empty.</div>
      )}
    </AppLayout>
  );
};

export default HomePage;
