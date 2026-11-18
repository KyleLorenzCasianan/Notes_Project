import { NavLink } from "react-router-dom";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import Icon from "./Icons";
import { useAuth } from "../context/AuthContext";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000/api";
const request = async (path, options = {}) => {
  const response = await fetch(`${API_URL}${path}`, { ...options, credentials: "include", headers: { "Content-Type": "application/json", ...options.headers } });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.message || "Request failed");
  return data;
};

const navigation = [
  { label: "Home", path: "/", icon: "home" },
  { label: "Shared", path: "/shared", icon: "shared" },
  { label: "Connections", path: "/connections", icon: "connections" },
  { label: "Trash", path: "/trash", icon: "trash" },
  { label: "Settings", path: "/settings", icon: "settings" },
];

const AppLayout = ({ children, dataTheme = "retro", search = "", setSearch = () => {} }) => {
  const { user, logout } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [notificationsOpen, setNotificationsOpen] = useState(false);

  useEffect(() => {
    if (!user) return;
    request("/notifications").then(setNotifications).catch((error) => toast.error(error.message));
  }, [user]);

  const markRead = async (id) => {
    try {
      await request(`/notifications/${id}/read`, { method: "PATCH" });
      setNotifications((current) => current.map((item) => item._id === id ? { ...item, readAt: new Date().toISOString() } : item));
    } catch (error) {
      toast.error(error.message);
    }
  };

  return <main data-theme={dataTheme} className="flex min-h-screen bg-base-100 text-base-content">
    <aside className="hidden w-56 shrink-0 flex-col border-r border-base-300 bg-base-200 p-6 sm:flex">
      <NavLink className="text-lg font-bold tracking-tight" to="/">PixStash</NavLink>
      <nav className="mt-12 grid gap-1">
        {navigation.map((item) => (
          <NavLink className={({ isActive }) => `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm ${isActive ? "bg-primary text-primary-content" : "text-base-content/60 hover:bg-base-300 hover:text-base-content"}`} end={item.path === "/"} key={item.path} to={item.path}>
            <Icon name={item.icon} size={17} /> {item.label}
          </NavLink>
        ))}
      </nav>
      <p className="mt-auto text-xs text-base-content/50">Keep your memories close.</p>
    </aside>
    <section className="min-w-0 flex-1">
      <header className="navbar min-h-20 border-b border-base-300 px-5 sm:px-10 lg:px-16">
        <button className="btn btn-ghost btn-square sm:hidden" aria-label="Open menu"><Icon name="menu" /></button>
        <label className="input input-sm flex w-full max-w-xl items-center gap-2 bg-base-200 sm:input-md">
          <Icon name="search" size={17} />
          <input onChange={(event) => setSearch(event.target.value)} placeholder="Search your photos..." type="search" value={search} />
        </label>
        <div className="ml-auto flex items-center gap-3">
          <button aria-label="Open notifications" className="btn btn-ghost btn-sm btn-square relative" onClick={() => setNotificationsOpen(true)} type="button">
            <Icon name="bell" size={18} />
            {notifications.some((item) => !item.readAt) && <span className="badge badge-primary badge-xs absolute right-0 top-0" />}
          </button>
          <div className="avatar placeholder"><div className="w-9 rounded-full bg-primary text-primary-content"><span>K</span></div></div>
          <div className="hidden sm:block"><strong className="block text-xs">{user?.userName}</strong><span className="text-[10px] text-base-content/50">{user?.email}</span></div>
          <button className="btn btn-ghost btn-xs" onClick={logout} type="button">Log out</button>
        </div>
      </header>
      <div className="mx-auto w-[90%] max-w-7xl py-10 sm:py-14">{children}</div>
    </section>
    {notificationsOpen && <div className="fixed inset-0 z-40 bg-black/30" onClick={() => setNotificationsOpen(false)}>
      <aside className="absolute right-0 top-0 flex h-full w-full max-w-sm flex-col bg-base-100 p-5 shadow-2xl" onClick={(event) => event.stopPropagation()}>
        <div className="flex items-center justify-between border-b border-base-300 pb-4">
          <div><h2 className="text-lg font-semibold">Notifications</h2><p className="text-xs text-base-content/60">Shared photos, folders, and messages</p></div>
          <button aria-label="Close notifications" className="btn btn-ghost btn-sm btn-square" onClick={() => setNotificationsOpen(false)} type="button"><Icon name="close" /></button>
        </div>
        <div className="mt-4 grid gap-2 overflow-y-auto">
          {notifications.length === 0 && <p className="py-10 text-center text-sm text-base-content/60">No notifications.</p>}
          {notifications.map((notification) => <button className={`rounded-box p-4 text-left ${notification.readAt ? "bg-base-200" : "bg-primary/15"}`} key={notification._id} onClick={() => markRead(notification._id)} type="button"><strong className="block text-sm">{notification.message}</strong><span className="mt-1 block text-xs text-base-content/60">{new Date(notification.createdAt).toLocaleString()}</span></button>)}
        </div>
      </aside>
    </div>}
  </main>;
};

export default AppLayout;
