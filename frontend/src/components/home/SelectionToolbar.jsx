const SelectionToolbar = ({ selectedCount, folders, onMove, onDelete }) => {
  if (!selectedCount) return null;

  return (
    <div className="alert mt-6 flex flex-wrap gap-2">
      <span className="mr-auto text-sm font-medium">{selectedCount} selected</span>
      <select className="select select-sm" defaultValue="" onChange={onMove}>
        <option disabled value="">Move to...</option>
        <option value="unfiled">Unfiled</option>
        {folders.map((folder) => <option key={folder._id} value={folder._id}>{folder.folderName}</option>)}
      </select>
      <button className="btn btn-error btn-sm" onClick={onDelete} type="button">Delete</button>
    </div>
  );
};

export default SelectionToolbar;
