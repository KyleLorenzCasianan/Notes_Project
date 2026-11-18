import Icon from "../Icons";

export const AccountAvatar = ({ person, className = "h-14 w-14" }) => (
  <div className={`flex shrink-0 items-center justify-center rounded-full bg-primary text-primary-content ring-4 ring-primary/10 ${className}`}>
    <span className="text-lg font-semibold">{person?.userName?.slice(0, 1).toUpperCase() || "?"}</span>
  </div>
);

export const EmptyState = ({ title, message }) => (
  <div className="rounded-box border border-dashed border-base-300 bg-base-200/40 px-6 py-16 text-center">
    <div className="mx-auto grid size-12 place-items-center rounded-full bg-base-300 text-xl">◎</div>
    <h3 className="mt-4 font-semibold">{title}</h3>
    <p className="mx-auto mt-1 max-w-sm text-sm text-base-content/60">{message}</p>
  </div>
);

export const ConnectionLoading = () => (
  <div className="mt-8 grid gap-3" aria-label="Loading connections" role="status">
    <div className="h-28 w-full max-w-2xl animate-pulse rounded-box bg-base-200" />
    <div className="h-28 w-full max-w-2xl animate-pulse rounded-box bg-base-200" />
  </div>
);

export const RequestList = ({ connections, emptyLabel, label, renderActions, sent = false }) => (
  <div>
    <div className="mb-2 flex items-center gap-2">
      <h3 className="text-sm font-bold">{label}</h3>
      <span className={`badge badge-sm ${sent ? "badge-warning badge-outline" : "badge-primary"}`}>{connections.length}</span>
    </div>
    {connections.length === 0
      ? <div className="rounded-box border border-dashed border-base-300 bg-base-200/30 p-4 text-sm text-base-content/50">{emptyLabel}</div>
      : <ul className="list rounded-box border border-base-300 bg-base-200/60 shadow-sm">
        {connections.map((connection) => <li className="list-row items-center gap-3 p-3" key={connection._id}>
          <AccountAvatar person={connection.person} className="h-12 w-12" />
          <div className="list-col-grow min-w-0">
            <strong className="block truncate text-sm">{connection.person?.userName}</strong>
            <span className="block truncate text-xs text-base-content/60">{connection.person?.email}</span>
            <span className={`badge badge-xs mt-1 ${sent ? "badge-warning badge-outline" : "badge-info badge-outline"}`}>{sent ? "Awaiting response" : "Wants to connect"}</span>
          </div>
          <div className="flex shrink-0 gap-1">{renderActions(connection)}</div>
        </li>)}
      </ul>}
  </div>
);

export const SearchResults = ({ people, onAdd }) => (
  <div className="absolute z-20 mt-2 w-full rounded-box bg-base-100 p-2 shadow-xl">
    {people.map((person) => (
      <div className="flex items-center justify-between gap-3 p-2" key={person._id}>
        <div className="flex items-center gap-3">
          <AccountAvatar person={person} className="h-11 w-11" />
          <div>
            <strong className="block text-sm">{person.userName}</strong>
            <span className="text-xs text-base-content/60">{person.email}</span>
          </div>
        </div>
        <button className="btn btn-primary btn-sm" onClick={() => onAdd(person._id)} type="button">Add</button>
      </div>
    ))}
  </div>
);

export const ConnectionTabs = ({ activeTab, connectedCount, pendingCount, onChange }) => {
  const tabs = [
    { id: "connected", label: "Connected", count: connectedCount },
    { id: "requests", label: "Requests", count: pendingCount },
  ];

  return (
    <div className="tabs tabs-border mt-10 gap-8" role="tablist">
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;
        return (
          <a
            aria-selected={isActive}
            className={`tab min-w-40 justify-center gap-2 border-b-2 ${isActive ? "tab-active border-primary font-semibold text-primary" : "border-transparent"}`}
            href={`#${tab.id}`}
            key={tab.id}
            onClick={(event) => {
              event.preventDefault();
              onChange(tab.id);
            }}
            role="tab"
          >
            {tab.label}
            <span className={`badge badge-sm ${tab.id === "requests" && tab.count ? "badge-primary" : ""}`}>{tab.count}</span>
          </a>
        );
      })}
    </div>
  );
};

export const ConnectionCard = ({ connection, onRemove }) => (
  <div className="w-full max-w-2xl rounded-box border border-base-300 bg-base-200/50 transition hover:border-primary/40 hover:shadow-md">
    <div className="flex min-h-28 items-center gap-5 p-5">
      <AccountAvatar person={connection.person} className="h-20 w-20" />
      <strong className="min-w-0 flex-1 truncate text-base">{connection.person?.userName}</strong>
      <div className="dropdown dropdown-end">
        <button aria-haspopup="menu" aria-label={`Options for ${connection.person?.userName}`} className="btn btn-circle btn-ghost btn-sm" type="button">
          <Icon name="more" size={17} />
        </button>
        <ul className="menu dropdown-content z-20 mt-1 w-48 rounded-box bg-base-100 p-2 text-left shadow-xl">
          <li><button className="text-error" onClick={() => onRemove(connection._id)} type="button">Remove connection</button></li>
        </ul>
      </div>
    </div>
  </div>
);

export const Pagination = ({ currentPage, pageCount, onChange }) => {
  if (pageCount <= 1) return null;

  return (
    <div className="mt-8 flex justify-center">
      <div className="join">
        <button className="join-item btn btn-sm" disabled={currentPage === 1} onClick={() => onChange(currentPage - 1)} type="button">«</button>
        {Array.from({ length: pageCount }, (_, index) => index + 1).map((page) => (
          <button className={`join-item btn btn-sm ${currentPage === page ? "btn-active" : ""}`} key={page} onClick={() => onChange(page)} type="button">{page}</button>
        ))}
        <button className="join-item btn btn-sm" disabled={currentPage === pageCount} onClick={() => onChange(currentPage + 1)} type="button">»</button>
      </div>
    </div>
  );
};
