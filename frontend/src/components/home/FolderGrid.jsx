import Icon from "../Icons";

const FolderGrid = ({ photos, folders, activeFolder, onOpenFolder, onRename, onDelete }) => {
  const folderPhotos = (folderId) => photos.filter((photo) => (
    folderId === "all"
      ? true
      : folderId === "unfiled"
        ? !photo.folderId
        : photo.folderId?._id === folderId || photo.folderId === folderId
  ));

  const items = [
    { id: "all", name: "All photos", count: photos.length },
    { id: "unfiled", name: "Unfiled", count: folderPhotos("unfiled").length },
    ...folders.map((folder) => ({
      id: folder._id,
      name: folder.folderName,
      count: folderPhotos(folder._id).length,
      folder,
    })),
  ];

  return (
    <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
      {items.map((folder) => (
        <div className={`relative rounded-box border p-3 text-left transition ${activeFolder === folder.id ? "border-primary bg-primary/10" : "border-base-300 bg-base-200 hover:border-primary/50"}`} key={folder.id}>
          <button className="block w-full text-left" onClick={() => onOpenFolder(folder.id)} type="button">
            <div className="grid aspect-[4/3] grid-cols-2 gap-1 overflow-hidden rounded-box bg-base-300">
              {folderPhotos(folder.id).slice(0, 4).map((photo) => <img alt="" className="h-full w-full object-cover" key={photo._id} src={photo.imageUrl} />)}
            </div>
            <strong className="mt-3 block truncate">{folder.name}</strong>
            <span className="text-xs text-base-content/60">{folder.count} photo{folder.count === 1 ? "" : "s"}</span>
          </button>
          {folder.folder && <div className="dropdown dropdown-end absolute right-3 top-3">
            <button aria-label={`Folder actions for ${folder.name}`} className="btn btn-circle btn-ghost btn-sm border border-base-300 bg-base-100/90 shadow-sm hover:bg-base-200" type="button"><Icon name="more" size={16} /></button>
            <ul className="menu dropdown-content z-20 mt-1 w-32 rounded-box bg-base-100 p-2 shadow-xl">
              <li><button onClick={() => onRename(folder.folder)} type="button">Rename</button></li>
              <li><button className="text-error" onClick={() => onDelete(folder.folder)} type="button">Delete</button></li>
            </ul>
          </div>}
        </div>
      ))}
    </div>
  );
};

export default FolderGrid;
