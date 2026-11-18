import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import AppLayout from "../components/AppLayout";
import {
  AccountAvatar,
  ConnectionCard,
  ConnectionTabs,
  ConnectionLoading,
  EmptyState,
  Pagination,
  RequestList,
  SearchResults,
} from "../components/connections/ConnectionComponents";
import { useAuth } from "../context/AuthContext";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000/api";
const request = async (path, options = {}) => {
  const response = await fetch(`${API_URL}${path}`, { ...options, credentials: "include", headers: { "Content-Type": "application/json", ...options.headers } });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.message || "Request failed");
  return data;
};

const ConnectionsPage = () => {
  const { user } = useAuth();
  const [connections, setConnections] = useState([]);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [activeTab, setActiveTab] = useState("connected");
  const [connectedPage, setConnectedPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);

  const loadConnections = () => request("/connections")
    .then(setConnections)
    .catch((error) => toast.error(error.message))
    .finally(() => setIsLoading(false));
  useEffect(() => { loadConnections(); }, []);

  const search = async (event) => {
    const value = event.target.value;
    setQuery(value);
    if (value.trim().length < 2) return setResults([]);
    try { setResults(await request(`/users/search?q=${encodeURIComponent(value)}`)); } catch (error) { toast.error(error.message); }
  };

  const addConnection = async (userId) => {
    try {
      await request("/connections", { method: "POST", body: JSON.stringify({ userId }) });
      setResults((current) => current.filter((person) => person._id !== userId));
      loadConnections();
      toast.success("Connection request sent");
    } catch (error) { toast.error(error.message); }
  };

  const updateConnection = async (id, status) => {
    try {
      await request(`/connections/${id}`, { method: "PATCH", body: JSON.stringify({ status }) });
      loadConnections();
      toast.success(status === "accepted" ? "Connection accepted" : "Request declined");
    } catch (error) { toast.error(error.message); }
  };

  const cancelConnection = async (id) => {
    try {
      await request(`/connections/${id}/cancel`, { method: "DELETE" });
      setConnections((current) => current.filter((connection) => connection._id !== id));
      toast.success("Connection request cancelled");
    } catch (error) { toast.error(error.message); }
  };

  const removeConnection = async (id) => {
    try {
      await request(`/connections/${id}`, { method: "DELETE" });
      setConnections((current) => current.filter((connection) => connection._id !== id));
      toast.success("Connection removed");
    } catch (error) { toast.error(error.message); }
  };

  const groupedConnections = useMemo(() => connections.reduce((groups, connection) => {
    const isRequester = String(connection.requesterId?._id) === String(user?.id);
    const person = isRequester ? connection.recipientId : connection.requesterId;
    const item = { ...connection, isRequester, person };
    groups[connection.status] = [...(groups[connection.status] || []), item];
    return groups;
  }, {}), [connections, user?.id]);

  const pending = groupedConnections.pending || [];
  const accepted = groupedConnections.accepted || [];
  const pageSize = 8;
  const pageCount = Math.max(1, Math.ceil(accepted.length / pageSize));
  const visibleAccepted = accepted.slice((connectedPage - 1) * pageSize, connectedPage * pageSize);

  return (
    <AppLayout>
      <h1 className="text-4xl font-semibold tracking-tight">Connections</h1>

      <div className="relative mt-8 max-w-xl">
        <input className="input input-bordered w-full" onChange={search} placeholder="Search by username or email" value={query} />
        {results.length > 0 && <SearchResults onAdd={addConnection} people={results} />}
      </div>

      <ConnectionTabs activeTab={activeTab} connectedCount={accepted.length} onChange={setActiveTab} pendingCount={pending.length} />

      {isLoading && <ConnectionLoading />}

      {!isLoading && activeTab === "connected" && (
        <section className="mt-8">
          <div className="mb-4">
            <h2 className="text-xl font-semibold">Your people</h2>
          </div>
          {accepted.length === 0
            ? <EmptyState message="Search for someone above and send a connection request to get started." title="No connections yet" />
            : <>
              <div className="grid gap-3">
                {visibleAccepted.map((connection) => <ConnectionCard connection={connection} key={connection._id} onRemove={removeConnection} />)}
              </div>
              <Pagination currentPage={connectedPage} onChange={setConnectedPage} pageCount={pageCount} />
            </>}
        </section>
      )}

      {!isLoading && activeTab === "requests" && (
        <section className="mt-8">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-xl font-semibold">Requests</h2>
            {pending.length > 0 && <span className="badge badge-primary">{pending.length} pending</span>}
          </div>
          {pending.length === 0
            ? <div className="alert border border-dashed border-base-300 bg-base-200/40 text-sm text-base-content/60"><span>No pending requests.</span></div>
            : <div className="grid gap-6 lg:grid-cols-2">
              <RequestList
                connections={pending.filter((connection) => !connection.isRequester)}
                emptyLabel="No incoming requests"
                label="Incoming"
                renderActions={(connection) => <><button className="btn btn-primary btn-sm" onClick={() => updateConnection(connection._id, "accepted")} type="button">Accept</button><button className="btn btn-ghost btn-sm" onClick={() => updateConnection(connection._id, "declined")} type="button">Decline</button></>}
              />
              <RequestList
                connections={pending.filter((connection) => connection.isRequester)}
                emptyLabel="No sent requests"
                label="Sent"
                renderActions={(connection) => <button className="btn btn-ghost btn-sm" onClick={() => cancelConnection(connection._id)} type="button">Cancel</button>}
                sent
              />
            </div>}
        </section>
      )}
    </AppLayout>
  );
};

export default ConnectionsPage;
