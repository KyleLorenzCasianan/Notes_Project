import { NavLink } from "react-router-dom";
import Icon from "./Icons";
import { useAuth } from "../context/AuthContext";

const navigation = [
  { label: "Home", path: "/", icon: "home" },
  { label: "Shared", path: "/shared", icon: "shared" },
  { label: "Connections", path: "/connections", icon: "connections" },
  { label: "Trash", path: "/trash", icon: "trash" },
  { label: "Settings", path: "/settings", icon: "settings" },
];

const AppLayout = ({ children, dataTheme = "retro", search = "", setSearch = () => {} }) => {
  const { user, logout } = useAuth();

  return <main data-theme={dataTheme} className="flex min-h-screen bg-base-100 text-base-content">
    <aside className="hidden w-56 shrink-0 flex-col border-r border-base-300 bg-base-200 p-6 sm:flex">
      <NavLink className="text-lg font-bold tracking-tight" to="/">Pixora</NavLink>
      <nav className="mt-12 grid gap-1">
        {navigation.map((item) => (
          <NavLink className={({ isActive }) => `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm ${isActive ? "bg-primary text-primary-content" : "text-base-content/60 hover:bg-base-300 hover:text-base-content"}`} end={item.path === "/"} key={item.path} to={item.path}>
            <Icon name={item.icon} size={17} /> {item.label}
          </NavLink>
        ))}
      </nav>
      <div className="mt-auto text-xs text-base-content/50">
        <div className="mb-2 flex justify-between"><span>Storage</span><span>2.4 GB / 5 GB</span></div>
        <progress className="progress progress-primary h-1.5" max="5" value="2.4" />
        <p className="mt-4">Keep your memories close.</p>
      </div>
    </aside>
    <section className="min-w-0 flex-1">
      <header className="navbar min-h-20 border-b border-base-300 px-5 sm:px-10 lg:px-16">
        <button className="btn btn-ghost btn-square sm:hidden" aria-label="Open menu"><Icon name="menu" /></button>
        <label className="input input-sm flex w-full max-w-xl items-center gap-2 bg-base-200 sm:input-md">
          <Icon name="search" size={17} />
          <input onChange={(event) => setSearch(event.target.value)} placeholder="Search your photos..." type="search" value={search} />
        </label>
        <div className="ml-auto flex items-center gap-3">
          <div className="avatar placeholder"><div className="w-9 rounded-full bg-primary text-primary-content"><span>K</span></div></div>
          <div className="hidden sm:block"><strong className="block text-xs">{user?.userName}</strong><span className="text-[10px] text-base-content/50">{user?.email}</span></div>
          <button className="btn btn-ghost btn-xs" onClick={logout} type="button">Log out</button>
        </div>
      </header>
      <div className="mx-auto w-[90%] max-w-7xl py-10 sm:py-14">{children}</div>
    </section>
  </main>;
};

export default AppLayout;
