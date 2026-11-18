import Icon from "./Icons";

const ImageViewer = ({ photo, onClose, onShare }) => {
  if (!photo) return null;

  return (
    <div className="modal modal-open bg-black/70" role="dialog" aria-modal="true" aria-labelledby="image-viewer-title">
      <div className="modal-box flex max-h-[92vh] max-w-6xl flex-col bg-base-200 p-3">
        <div className="flex items-center justify-between gap-3 px-2 pb-3">
          <h2 className="truncate text-lg font-semibold" id="image-viewer-title">{photo.title}</h2>
          <button aria-label="Close image viewer" className="btn btn-ghost btn-sm btn-square" onClick={onClose} type="button">
            <Icon name="close" />
          </button>
        </div>
        <div className="flex min-h-0 flex-1 items-center justify-center overflow-auto rounded-box bg-black p-2">
          <img alt={photo.title} className="max-h-[70vh] max-w-full object-contain" src={photo.imageUrl} />
        </div>
        <div className="flex justify-end gap-2 px-2 pt-3">
          <a className="btn btn-ghost btn-sm" download={photo.title} href={photo.imageUrl} rel="noreferrer" target="_blank">
            <Icon name="download" size={16} /> Download
          </a>
          {onShare && <button className="btn btn-primary btn-sm" onClick={() => onShare(photo)} type="button"><Icon name="share" size={16} /> Share</button>}
        </div>
      </div>
      <button aria-label="Close image viewer" className="modal-backdrop" onClick={onClose} type="button">Close</button>
    </div>
  );
};

export default ImageViewer;
