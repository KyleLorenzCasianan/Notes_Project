import { useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";
import AppLayout from "../components/AppLayout";
import FolderGrid from "../components/home/FolderGrid";
import HomeDialogs from "../components/home/HomeDialogs";
import PhotoGrid from "../components/home/PhotoGrid";
import SelectionToolbar from "../components/home/SelectionToolbar";

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
  const contentsRef = useRef(null);
  const [photos, setPhotos] = useState([]);
  const [folders, setFolders] = useState([]);
  const [selectedIds, setSelectedIds] = useState([]);
  const [activeFolder, setActiveFolder] = useState("all");
  const [search, setSearch] = useState("");
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
  const [viewerPhoto, setViewerPhoto] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleteSaving, setDeleteSaving] = useState(false);
  const [renameTarget, setRenameTarget] = useState(null);
  const [renameName, setRenameName] = useState("");
  const [renameSaving, setRenameSaving] = useState(false);

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

  const openRenameDialog = (type, item) => {
    setRenameTarget({ type, item });
    setRenameName(type === "photo" ? item.title : item.folderName);
  };

  const confirmRename = async (event) => {
    event.preventDefault();
    if (!renameTarget || !renameName.trim()) return;
    setRenameSaving(true);
    try {
      if (renameTarget.type === "photo") {
        const updatedPhoto = await request(`/photos/${renameTarget.item._id}`, {
          method: "PUT",
          body: JSON.stringify({ title: renameName }),
        });
        setPhotos((current) => current.map((item) => item._id === updatedPhoto._id ? updatedPhoto : item));
        toast.success("Photo renamed");
      } else {
        const updatedFolder = await request(`/folders/${renameTarget.item._id}`, {
          method: "PUT",
          body: JSON.stringify({ folderName: renameName }),
        });
        setFolders((current) => current.map((item) => item._id === updatedFolder._id ? updatedFolder : item));
        toast.success("Folder renamed");
      }
      setRenameTarget(null);
    } catch (error) {
      toast.error(error.message);
    } finally {
      setRenameSaving(false);
    }
  };

  const deleteSelected = () => {
    if (!selectedIds.length) return;
    setDeleteTarget({ type: "photos", ids: selectedIds });
  };

  const deletePhoto = (photo) => {
    setDeleteTarget({ type: "photo", photo });
  };

  const deleteFolder = (folder) => {
    setDeleteTarget({ type: "folder", folder });
  };

  const confirmDeletion = async () => {
    if (!deleteTarget || deleteSaving) return;
    setDeleteSaving(true);
    try {
      if (deleteTarget.type === "folder") {
        await request(`/folders/${deleteTarget.folder._id}`, { method: "DELETE" });
        setFolders((current) => current.filter((item) => item._id !== deleteTarget.folder._id));
        setPhotos((current) => current.map((photo) => photo.folderId?._id === deleteTarget.folder._id || photo.folderId === deleteTarget.folder._id ? { ...photo, folderId: null } : photo));
        if (activeFolder === deleteTarget.folder._id) setActiveFolder("all");
        toast.success("Folder deleted");
      } else {
        const ids = deleteTarget.type === "photo" ? [deleteTarget.photo._id] : deleteTarget.ids;
        await Promise.all(ids.map((id) => request(`/photos/${id}`, { method: "DELETE" })));
        setPhotos((current) => current.filter((photo) => !ids.includes(photo._id)));
        setSelectedIds([]);
        toast.success("Photo deleted");
      }
      setDeleteTarget(null);
    } catch (error) {
      toast.error(error.message);
    } finally {
      setDeleteSaving(false);
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
      const filesToUpload = pendingFiles;
      for (const [index, file] of filesToUpload.entries()) {
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
        setPendingFiles(filesToUpload.slice(index + 1));
      }

      setPhotos((current) => [...[...uploadedPhotos].reverse(), ...current]);
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

  const normalizedSearch = search.trim().toLowerCase();
  const visiblePhotos = photos.filter((photo) => {
    const inFolder = activeFolder === "all"
      ? true
      : activeFolder === "unfiled"
        ? !photo.folderId
        : photo.folderId === activeFolder || photo.folderId?._id === activeFolder;
    return inFolder && photo.title.toLowerCase().includes(normalizedSearch);
  });

  const openFolder = (folderId) => {
    setActiveFolder(folderId);
    window.setTimeout(() => contentsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 0);
  };

  return (
    <AppLayout search={search} setSearch={setSearch}>
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

      <div className="mt-10">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold">Folders</h2>
            <p className="mt-1 text-sm text-base-content/60">Tap a folder to view the photos inside.</p>
          </div>
          {activeFolder !== "all" && activeFolder !== "unfiled" && (
            <button className="btn btn-outline btn-sm" onClick={() => openShareDialog({ resourceType: "folder", resourceId: activeFolder })} type="button">Share folder</button>
          )}
        </div>
        <FolderGrid
          activeFolder={activeFolder}
          folders={folders}
          onDelete={deleteFolder}
          onOpenFolder={openFolder}
          onRename={(folder) => openRenameDialog("folder", folder)}
          photos={photos}
        />
      </div>

      <SelectionToolbar folders={folders} onDelete={deleteSelected} onMove={moveSelected} selectedCount={selectedIds.length} />
      <PhotoGrid
        contentsRef={contentsRef}
        onDelete={deletePhoto}
        onOpen={setViewerPhoto}
        onRename={(photo) => openRenameDialog("photo", photo)}
        onShare={(photo) => openShareDialog({ resourceType: "photo", resourceId: photo._id })}
        onToggleSelection={toggleSelection}
        photos={visiblePhotos}
        selectedIds={selectedIds}
      />

      <HomeDialogs
        deleteSaving={deleteSaving}
        deleteTarget={deleteTarget}
        folderDialogOpen={folderDialogOpen}
        folderName={folderName}
        folders={folders}
        onCloseDelete={() => setDeleteTarget(null)}
        onCloseFolderDialog={() => { setFolderDialogOpen(false); setFolderName(""); }}
        onCloseRename={() => setRenameTarget(null)}
        onCloseShare={() => setShareDialogOpen(false)}
        onCloseViewer={() => setViewerPhoto(null)}
        onCreateFolder={createFolder}
        onDelete={confirmDeletion}
        onFolderNameChange={setFolderName}
        onRename={confirmRename}
        onRenameNameChange={setRenameName}
        onShare={(recipientId) => shareWith(recipientId)}
        onSharePhoto={(photo) => { setViewerPhoto(null); openShareDialog({ resourceType: "photo", resourceId: photo._id }); }}
        onShareQueryChange={searchShareRecipients}
        onUpload={uploadPhoto}
        onUploadFolderChange={setUploadFolderId}
        onCancelUpload={() => { setPendingFiles([]); setUploadDialogOpen(false); }}
        pendingFiles={pendingFiles}
        renameName={renameName}
        renameSaving={renameSaving}
        renameTarget={renameTarget}
        shareDialogOpen={shareDialogOpen}
        shareQuery={shareQuery}
        shareResults={shareResults}
        shareTarget={shareTarget}
        uploadDialogOpen={uploadDialogOpen}
        uploadFolderId={uploadFolderId}
        uploading={uploading}
        viewerPhoto={viewerPhoto}
      />
    </AppLayout>
  );
};

export default HomePage;
