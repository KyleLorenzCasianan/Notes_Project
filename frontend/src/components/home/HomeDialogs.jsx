import ImageViewer from "../ImageViewer";

const HomeDialogs = ({
  folderDialogOpen, folderName, onFolderNameChange, onCreateFolder, onCloseFolderDialog,
  uploadDialogOpen, pendingFiles, uploading, uploadFolderId, folders, onUploadFolderChange, onUpload, onCancelUpload,
  shareDialogOpen, shareTarget, shareQuery, shareResults, onShareQueryChange, onShare, onCloseShare,
  renameTarget, renameName, renameSaving, onRenameNameChange, onRename, onCloseRename,
  deleteTarget, deleteSaving, onDelete, onCloseDelete,
  viewerPhoto, onCloseViewer, onSharePhoto,
}) => (
  <>
    {folderDialogOpen && (
      <div className="modal modal-open" role="dialog" aria-modal="true" aria-labelledby="new-folder-title">
        <div className="modal-box">
          <h2 className="text-xl font-semibold" id="new-folder-title">Create a folder</h2>
          <p className="mt-1 text-sm text-base-content/60">Give your folder a name to organize your photos.</p>
          <form className="mt-6" onSubmit={onCreateFolder}>
            <input autoFocus className="input input-bordered w-full" maxLength={80} onChange={(event) => onFolderNameChange(event.target.value)} placeholder="e.g. Vacation" required type="text" value={folderName} />
            <div className="modal-action">
              <button className="btn btn-ghost" onClick={onCloseFolderDialog} type="button">Cancel</button>
              <button className="btn btn-primary" type="submit">Create folder</button>
            </div>
          </form>
        </div>
        <button aria-label="Close folder dialog" className="modal-backdrop" onClick={onCloseFolderDialog} type="button">Close</button>
      </div>
    )}

    {uploadDialogOpen && pendingFiles.length > 0 && (
      <div className="modal modal-open" role="dialog" aria-modal="true" aria-labelledby="upload-photo-title">
        <div className="modal-box">
          <h2 className="text-xl font-semibold" id="upload-photo-title">Add photo</h2>
          <p className="mt-1 text-sm text-base-content/60">{pendingFiles.length} photo{pendingFiles.length === 1 ? "" : "s"} selected</p>
          <div className="mt-4 max-h-32 overflow-y-auto rounded-box bg-base-200 p-3 text-sm">
            {pendingFiles.map((file) => <p className="truncate" key={`${file.name}-${file.lastModified}`}>{file.name}</p>)}
          </div>
          <form className="mt-6" onSubmit={onUpload}>
            <label className="form-control">
              <span className="label-text mb-2 text-sm font-medium">Add to folder</span>
              <select className="select select-bordered w-full" onChange={(event) => onUploadFolderChange(event.target.value)} value={uploadFolderId}>
                <option value="">Unfiled</option>
                {folders.map((folder) => <option key={folder._id} value={folder._id}>{folder.folderName}</option>)}
              </select>
            </label>
            <div className="modal-action">
              <button className="btn btn-ghost" disabled={uploading} onClick={onCancelUpload} type="button">Cancel</button>
              <button className="btn btn-primary" disabled={uploading} type="submit">{uploading ? <span className="loading loading-spinner loading-sm" /> : "Upload photo"}</button>
            </div>
          </form>
        </div>
        <button aria-label="Close upload dialog" className="modal-backdrop" disabled={uploading} onClick={onCancelUpload} type="button">Close</button>
      </div>
    )}

    {shareDialogOpen && (
      <div className="modal modal-open" role="dialog" aria-modal="true" aria-labelledby="share-title">
        <div className="modal-box">
          <h2 className="text-xl font-semibold" id="share-title">Share {shareTarget?.resourceType}</h2>
          <p className="mt-1 text-sm text-base-content/60">Search by username or email.</p>
          <input autoFocus className="input input-bordered mt-5 w-full" onChange={(event) => onShareQueryChange(event.target.value)} placeholder="Username or email" value={shareQuery} />
          <div className="mt-3 grid gap-2">
            {shareResults.map((user) => <div className="flex items-center justify-between rounded-box bg-base-200 p-3" key={user._id}><div><strong className="block text-sm">{user.userName}</strong><span className="text-xs text-base-content/60">{user.email}</span></div><button className="btn btn-primary btn-sm" onClick={() => onShare(user._id)} type="button">Share</button></div>)}
          </div>
          <div className="modal-action"><button className="btn btn-ghost" onClick={onCloseShare} type="button">Cancel</button></div>
        </div>
        <button aria-label="Close share dialog" className="modal-backdrop" onClick={onCloseShare} type="button">Close</button>
      </div>
    )}

    {renameTarget && (
      <div className="modal modal-open" role="dialog" aria-modal="true" aria-labelledby="rename-title">
        <div className="modal-box">
          <h2 className="text-xl font-semibold" id="rename-title">Rename {renameTarget.type === "folder" ? "folder" : "photo"}</h2>
          <form className="mt-5" onSubmit={onRename}>
            <input autoFocus className="input input-bordered w-full" maxLength={80} onChange={(event) => onRenameNameChange(event.target.value)} required type="text" value={renameName} />
            <div className="modal-action">
              <button className="btn btn-ghost" disabled={renameSaving} onClick={onCloseRename} type="button">Cancel</button>
              <button className="btn btn-primary" disabled={renameSaving || !renameName.trim()} type="submit">{renameSaving ? <span className="loading loading-spinner loading-sm" /> : "Save name"}</button>
            </div>
          </form>
        </div>
        <button aria-label="Close rename dialog" className="modal-backdrop" disabled={renameSaving} onClick={onCloseRename} type="button">Close</button>
      </div>
    )}

    {deleteTarget && (
      <div className="modal modal-open" role="dialog" aria-modal="true" aria-labelledby="delete-title">
        <div className="modal-box">
          <h2 className="text-xl font-semibold" id="delete-title">Delete {deleteTarget.type === "folder" ? "folder" : "photo"}?</h2>
          <p className="mt-2 text-sm text-base-content/60">
            {deleteTarget.type === "folder"
              ? `Photos in "${deleteTarget.folder.folderName}" will be moved to Unfiled.`
              : `${deleteTarget.type === "photos" ? deleteTarget.ids.length : 1} photo${deleteTarget.type === "photos" && deleteTarget.ids.length !== 1 ? "s" : ""} will be moved to Trash.`}
          </p>
          <div className="modal-action">
            <button className="btn btn-ghost" disabled={deleteSaving} onClick={onCloseDelete} type="button">Cancel</button>
            <button className="btn btn-error" disabled={deleteSaving} onClick={onDelete} type="button">{deleteSaving ? <span className="loading loading-spinner loading-sm" /> : "Delete"}</button>
          </div>
        </div>
        <button aria-label="Close delete dialog" className="modal-backdrop" disabled={deleteSaving} onClick={onCloseDelete} type="button">Close</button>
      </div>
    )}

    <ImageViewer photo={viewerPhoto} onClose={onCloseViewer} onShare={onSharePhoto} />
  </>
);

export default HomeDialogs;
