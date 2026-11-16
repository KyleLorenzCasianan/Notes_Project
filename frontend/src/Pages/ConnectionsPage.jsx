import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import AppLayout from "../components/AppLayout";
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

  const loadConnections = () => request("/connections").then(setConnections).catch((error) => toast.error(error.message));
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
      setResults((current) => current.filter((user) => user._id !== userId));
      loadConnections();
      toast.success("Connection request sent");
    } catch (error) { toast.error(error.message); }
  };

  const updateConnection = async (id, status) => {
    try {
      await request(`/connections/${id}`, { method: "PATCH", body: JSON.stringify({ status }) });
      loadConnections();
      toast.success(status === "accepted" ? "Connection accepted" : "Request updated");
    } catch (error) { toast.error(error.message); }
  };

  return (
    <AppLayout>
      <h1 className="text-4xl font-semibold tracking-tight">Connections</h1>
      <p className="mt-2 text-sm text-base-content/60">Find people and share your memories with them.</p>
      <div className="relative mt-8 max-w-xl">
        <input className="input input-bordered w-full" onChange={search} placeholder="Search by username or email" value={query} />
        {results.length > 0 && <div className="absolute z-20 mt-2 w-full rounded-box bg-base-100 p-2 shadow-xl">
          {results.map((user) => <div className="flex items-center justify-between p-2" key={user._id}><div><strong className="block text-sm">{user.userName}</strong><span className="text-xs text-base-content/60">{user.email}</span></div><button className="btn btn-primary btn-sm" onClick={() => addConnection(user._id)} type="button">Add</button></div>)}
        </div>}
      </div>
      <div className="mt-8 grid gap-3">
        {connections.length === 0 && <p className="py-16 text-center text-sm text-base-content/60">No connections yet.</p>}
        {connections.map((connection) => {
          const other = String(connection.requesterId?._id) === String(user?.id) ? connection.recipientId : connection.requesterId;
          return <div className="flex items-center justify-between rounded-box bg-base-200 p-4" key={connection._id}>
            <div><strong className="block">{other?.userName}</strong><span className="text-xs text-base-content/60">{other?.email}</span></div>
            {connection.status === "pending" && <div className="flex gap-2"><button className="btn btn-primary btn-sm" onClick={() => updateConnection(connection._id, "accepted")} type="button">Accept</button><button className="btn btn-ghost btn-sm" onClick={() => updateConnection(connection._id, "declined")} type="button">Decline</button></div>}
            {connection.status !== "pending" && <span className="badge badge-outline">{connection.status}</span>}
          </div>;
        })}
      </div>
    </AppLayout>
  );
};

export default ConnectionsPage;
