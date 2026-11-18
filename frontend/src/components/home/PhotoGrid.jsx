import Icon from "../Icons";

const PhotoGrid = ({ photos, selectedIds, onToggleSelection, onOpen, onRename, onShare, onDelete, contentsRef }) => (
  <div className="mt-8 scroll-mt-6" ref={contentsRef}>
    {photos.length ? (
      <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
      {photos.map((photo) => (
        <article className="group relative" key={photo._id}>
          <label className="absolute left-3 top-3 z-10 cursor-pointer">
            <input checked={selectedIds.includes(photo._id)} className="checkbox checkbox-primary checkbox-sm bg-base-100/80" onChange={() => onToggleSelection(photo._id)} type="checkbox" />
          </label>
          <button className="block w-full cursor-zoom-in" onClick={() => onOpen(photo)} type="button">
            <img alt={photo.title} className="aspect-square w-full rounded-box object-cover" src={photo.imageUrl} />
          </button>
          <div className="dropdown dropdown-end absolute right-2 top-2">
            <button aria-label={`Photo actions for ${photo.title}`} className="btn btn-circle btn-ghost btn-sm border border-base-300 bg-base-100/90 shadow-sm hover:bg-base-200" type="button"><Icon name="more" size={16} /></button>
            <ul className="menu dropdown-content z-20 mt-1 w-32 rounded-box bg-base-100 p-2 shadow-xl">
              <li><button onClick={() => onRename(photo)} type="button">Rename</button></li>
              <li><button onClick={() => onShare(photo)} type="button">Share</button></li>
              <li><button className="text-error" onClick={() => onDelete(photo)} type="button">Delete</button></li>
            </ul>
          </div>
          <p className="mt-2 truncate text-sm font-medium">{photo.title}</p>
        </article>
      ))}
      </div>
    ) : <div className="py-32 text-center text-sm text-base-content/60">No photos in this view.</div>}
  </div>
);

export default PhotoGrid;
