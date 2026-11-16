import { useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";
import AppLayout from "../components/AppLayout";

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
  const [folders, setFolders] = useState([]);
  const [selectedIds, setSelectedIds] = useState([]);
  const [activeFolder, setActiveFolder] = useState("all");
  const [uploading, setUploading] = useState(false);
  const [folderDialogOpen, setFolderDialogOpen] = useState(false);
  const [folderName, setFolderName] = useState("");
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [pendingFiles, setPendingFiles] = useState([]);
  const [uploadFolderId, setUploadFolderId] = useState("");
  const [shareDialogOpen, setShareDialogOpen] = useState(false);
  const [shareTarget, setShareTarget] = useState(null);
  const [shareQuery, setShareQuery] = useState("");
  const [shareResults, setShareResults] = useState([]);

  const loadLibrary = async () => {
    const [photoData, folderData] = await Promise.all([request("/photos"), request("/folders")]);
    setPhotos(photoData);
    setFolders(folderData);
  };

  useEffect(() => {
    loadLibrary().catch((error) => toast.error(error.message));
  }, []);

  const toggleSelection = (photoId) => {
    setSelectedIds((current) => current.includes(photoId)
      ? current.filter((id) => id !== photoId)
      : [...current, photoId]);
  };

  const createFolder = async (event) => {
    event.preventDefault();
    if (!folderName.trim()) return;
    try {
      const folder = await request("/folders", {
        method: "POST",
        body: JSON.stringify({ folderName }),
      });
      setFolders((current) => [...current, folder].sort((a, b) => a.folderName.localeCompare(b.folderName)));
      setFolderName("");
      setFolderDialogOpen(false);
      toast.success("Folder created");
    } catch (error) {
      toast.error(error.message);
    }
  };

  const renameSelected = async () => {
    const photo = photos.find((item) => item._id === selectedIds[0]);
    const title = window.prompt("New photo name", photo?.title);
    if (!photo || !title?.trim()) return;

    try {
      const updatedPhoto = await request(`/photos/${photo._id}`, {
        method: "PUT",
        body: JSON.stringify({ title }),
      });
      setPhotos((current) => current.map((item) => item._id === updatedPhoto._id ? updatedPhoto : item));
      setSelectedIds([]);
      toast.success("Photo renamed");
    } catch (error) {
      toast.error(error.message);
    }
  };

  const deleteSelected = async () => {
    if (!selectedIds.length || !window.confirm(`Delete ${selectedIds.length} photo${selectedIds.length === 1 ? "" : "s"}?`)) return;

    try {
      await Promise.all(selectedIds.map((id) => request(`/photos/${id}`, { method: "DELETE" })));
      setPhotos((current) => current.filter((photo) => !selectedIds.includes(photo._id)));
      setSelectedIds([]);
      toast.success("Photo deleted");
    } catch (error) {
      toast.error(error.message);
    }
  };

  const moveSelected = async (event) => {
    const folderId = event.target.value;
    if (!folderId || !selectedIds.length) return;

    try {
      const updatedPhotos = await Promise.all(selectedIds.map((id) => request(`/photos/${id}`, {
        method: "PUT",
        body: JSON.stringify({ folderId: folderId === "unfiled" ? null : folderId }),
      })));
      setPhotos((current) => current.map((photo) => updatedPhotos.find((updated) => updated._id === photo._id) || photo));
      setSelectedIds([]);
      event.target.value = "";
      toast.success(folderId === "unfiled" ? "Photos moved out of folder" : "Photos moved");
    } catch (error) {
      toast.error(error.message);
    }
  };

  const openShareDialog = (target) => {
    setShareTarget(target);
    setShareQuery("");
    setShareResults([]);
    setShareDialogOpen(true);
  };

  const searchShareRecipients = async (event) => {
    const value = event.target.value;
    setShareQuery(value);
    if (value.trim().length < 2) return setShareResults([]);
    try {
      setShareResults(await request(`/users/search?q=${encodeURIComponent(value)}`));
    } catch (error) {
      toast.error(error.message);
    }
  };

  const shareWith = async (recipientId) => {
    try {
      await request("/shares", {
        method: "POST",
        body: JSON.stringify({ ...shareTarget, recipientId }),
      });
      setShareDialogOpen(false);
      setShareTarget(null);
      toast.success("Shared successfully");
    } catch (error) {
      toast.error(error.message);
    }
  };

  const selectPhoto = (event) => {
    const files = Array.from(event.target.files || []);
    event.target.value = "";
    if (!files.length) return;
    setPendingFiles(files);
    setUploadFolderId("");
    setUploadDialogOpen(true);
  };

  const uploadPhoto = async (event) => {
    event.preventDefault();
    if (!pendingFiles.length) return;
    setUploading(true);
    try {
      const uploadedPhotos = [];
      for (const file of pendingFiles) {
        const signature = await request("/photos/upload-signature");
        const formData = new FormData();
        formData.append("file", file);
        formData.append("api_key", signature.apiKey);
        formData.append("folder", signature.folder);
        formData.append("signature", signature.signature);
        formData.append("timestamp", signature.timestamp);

        const uploadResponse = await fetch(`https://api.cloudinary.com/v1_1/${signature.cloudName}/image/upload`, {
          method: "POST",
          body: formData,
        });
        const cloudinaryPhoto = await uploadResponse.json();
        if (!uploadResponse.ok) throw new Error(cloudinaryPhoto.error?.message || "Cloudinary upload failed");

        const photo = await request("/photos", {
          method: "POST",
          body: JSON.stringify({
            title: file.name.replace(/\.[^/.]+$/, ""),
            imageUrl: cloudinaryPhoto.secure_url,
            publicId: cloudinaryPhoto.public_id,
            folderId: uploadFolderId || null,
            width: cloudinaryPhoto.width,
            height: cloudinaryPhoto.height,
            format: cloudinaryPhoto.format,
            size: file.size,
          }),
        });
        uploadedPhotos.push(photo);
      }

      setPhotos((current) => [...uploadedPhotos.reverse(), ...current]);
      setPendingFiles([]);
      setUploadFolderId("");
      setUploadDialogOpen(false);
      toast.success(`${uploadedPhotos.length} photo${uploadedPhotos.length === 1 ? "" : "s"} uploaded`);
    } catch (error) {
      toast.error(error.message);
    } finally {
      setUploading(false);
    }
  };

  const visiblePhotos = activeFolder === "all"
    ? photos
    : photos.filter((photo) => activeFolder === "unfiled"
      ? !photo.folderId
      : photo.folderId === activeFolder || photo.folderId?._id === activeFolder);

  return (
    <AppLayout>
      <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-center">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-base-content/50">Your library</p>
          <h1 className="mt-2 text-4xl font-semibold tracking-tight">Home</h1>
        </div>
        <div className="flex gap-2">
          <button className="btn btn-ghost" onClick={() => setFolderDialogOpen(true)} type="button">New folder</button>
          <button className="btn btn-primary" disabled={uploading} onClick={() => fileInput.current?.click()} type="button">
            {uploading ? <span className="loading loading-spinner loading-sm" /> : "Add photos"}
          </button>
          <input accept="image/*" className="hidden" multiple onChange={selectPhoto} ref={fileInput} type="file" />
        </div>
      </div>

      <div className="mt-10 flex flex-wrap items-center gap-2">
        <button className={`btn btn-sm ${activeFolder === "all" ? "btn-primary" : "btn-ghost"}`} onClick={() => setActiveFolder("all")} type="button">All photos</button>
        <button className={`btn btn-sm ${activeFolder === "unfiled" ? "btn-primary" : "btn-ghost"}`} onClick={() => setActiveFolder("unfiled")} type="button">Unfiled</button>
        {folders.map((folder) => (
          <button className={`btn btn-sm ${activeFolder === folder._id ? "btn-primary" : "btn-ghost"}`} key={folder._id} onClick={() => setActiveFolder(folder._id)} type="button">
            {folder.folderName}
          </button>
        ))}
        {activeFolder !== "all" && activeFolder !== "unfiled" && (
          <button className="btn btn-outline btn-sm" onClick={() => openShareDialog({ resourceType: "folder", resourceId: activeFolder })} type="button">Share folder</button>
        )}
      </div>

      {selectedIds.length > 0 && (
        <div className="alert mt-6 flex flex-wrap gap-2">
          <span className="mr-auto text-sm font-medium">{selectedIds.length} selected</span>
          {selectedIds.length === 1 && <button className="btn btn-sm" onClick={renameSelected} type="button">Rename</button>}
          {selectedIds.length === 1 && <button className="btn btn-sm" onClick={() => openShareDialog({ resourceType: "photo", resourceId: selectedIds[0] })} type="button">Share</button>}
          <select className="select select-sm" defaultValue="" onChange={moveSelected}>
            <option disabled value="">Move to...</option>
            <option value="unfiled">Unfiled</option>
            {folders.map((folder) => <option key={folder._id} value={folder._id}>{folder.folderName}</option>)}
          </select>
          <button className="btn btn-error btn-sm" onClick={deleteSelected} type="button">Delete</button>
        </div>
      )}

      {visiblePhotos.length ? (
        <div className="mt-8 grid grid-cols-2 gap-4 md:grid-cols-3">
          {visiblePhotos.map((photo) => (
            <article className="group relative" key={photo._id}>
              <label className="absolute left-3 top-3 z-10 cursor-pointer">
                <input checked={selectedIds.includes(photo._id)} className="checkbox checkbox-primary checkbox-sm bg-base-100/80" onChange={() => toggleSelection(photo._id)} type="checkbox" />
              </label>
              <img alt={photo.title} className="aspect-square w-full rounded-box object-cover" src={photo.imageUrl} />
              <p className="mt-2 truncate text-sm font-medium">{photo.title}</p>
            </article>
          ))}
        </div>
      ) : (
        <div className="py-32 text-center text-sm text-base-content/60">No photos in this view.</div>
      )}

      {folderDialogOpen && (
        <div className="modal modal-open" role="dialog" aria-modal="true" aria-labelledby="new-folder-title">
          <div className="modal-box">
            <h2 className="text-xl font-semibold" id="new-folder-title">Create a folder</h2>
            <p className="mt-1 text-sm text-base-content/60">Give your folder a name to organize your photos.</p>
            <form className="mt-6" onSubmit={createFolder}>
              <input
                autoFocus
                className="input input-bordered w-full"
                maxLength={80}
                onChange={(event) => setFolderName(event.target.value)}
                placeholder="e.g. Vacation"
                required
                type="text"
                value={folderName}
              />
              <div className="modal-action">
                <button className="btn btn-ghost" onClick={() => { setFolderDialogOpen(false); setFolderName(""); }} type="button">Cancel</button>
                <button className="btn btn-primary" type="submit">Create folder</button>
              </div>
            </form>
          </div>
          <button aria-label="Close folder dialog" className="modal-backdrop" onClick={() => { setFolderDialogOpen(false); setFolderName(""); }} type="button">Close</button>
        </div>
      )}

      {uploadDialogOpen && pendingFiles.length > 0 && (
        <div className="modal modal-open" role="dialog" aria-modal="true" aria-labelledby="upload-photo-title">
          <div className="modal-box">
            <h2 className="text-xl font-semibold" id="upload-photo-title">Add photo</h2>
            <p className="mt-1 text-sm text-base-content/60">
              {pendingFiles.length} photo{pendingFiles.length === 1 ? "" : "s"} selected
            </p>
            <div className="mt-4 max-h-32 overflow-y-auto rounded-box bg-base-200 p-3 text-sm">
              {pendingFiles.map((file) => <p className="truncate" key={`${file.name}-${file.lastModified}`}>{file.name}</p>)}
            </div>
            <form className="mt-6" onSubmit={uploadPhoto}>
              <label className="form-control">
                <span className="label-text mb-2 text-sm font-medium">Add to folder</span>
                <select className="select select-bordered w-full" onChange={(event) => setUploadFolderId(event.target.value)} value={uploadFolderId}>
                  <option value="">Unfiled</option>
                  {folders.map((folder) => <option key={folder._id} value={folder._id}>{folder.folderName}</option>)}
                </select>
              </label>
              <div className="modal-action">
                <button className="btn btn-ghost" disabled={uploading} onClick={() => { setPendingFiles([]); setUploadDialogOpen(false); }} type="button">Cancel</button>
                <button className="btn btn-primary" disabled={uploading} type="submit">
                  {uploading ? <span className="loading loading-spinner loading-sm" /> : "Upload photo"}
                </button>
              </div>
            </form>
          </div>
          <button aria-label="Close upload dialog" className="modal-backdrop" disabled={uploading} onClick={() => { setPendingFiles([]); setUploadDialogOpen(false); }} type="button">Close</button>
        </div>
      )}

      {shareDialogOpen && (
        <div className="modal modal-open" role="dialog" aria-modal="true" aria-labelledby="share-title">
          <div className="modal-box">
            <h2 className="text-xl font-semibold" id="share-title">Share {shareTarget?.resourceType}</h2>
            <p className="mt-1 text-sm text-base-content/60">Search by username or email.</p>
            <input autoFocus className="input input-bordered mt-5 w-full" onChange={searchShareRecipients} placeholder="Username or email" value={shareQuery} />
            <div className="mt-3 grid gap-2">
              {shareResults.map((user) => <div className="flex items-center justify-between rounded-box bg-base-200 p-3" key={user._id}><div><strong className="block text-sm">{user.userName}</strong><span className="text-xs text-base-content/60">{user.email}</span></div><button className="btn btn-primary btn-sm" onClick={() => shareWith(user._id)} type="button">Share</button></div>)}
            </div>
            <div className="modal-action"><button className="btn btn-ghost" onClick={() => setShareDialogOpen(false)} type="button">Cancel</button></div>
          </div>
          <button aria-label="Close share dialog" className="modal-backdrop" onClick={() => setShareDialogOpen(false)} type="button">Close</button>
        </div>
      )}
    </AppLayout>
  );
};

export default HomePage;
