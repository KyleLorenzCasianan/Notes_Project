import AppLayout from "../components/AppLayout";
import Icon from "../components/Icons";

const SettingsPage = () => (
  <AppLayout>
    <div><p className="text-xs font-semibold uppercase tracking-[0.18em] text-base-content/50">Personalize Pixora</p><h1 className="mt-2 text-4xl font-semibold tracking-tight sm:text-5xl">Settings</h1></div>
    <div className="card mt-12 bg-base-200/50"><div className="card-body items-center justify-center py-24 text-center"><div className="grid size-14 place-items-center rounded-full bg-base-300"><Icon name="settings" size={24} /></div><h2 className="card-title mt-2">Settings</h2><p className="max-w-md text-sm text-base-content/60">Manage your account and library preferences.</p></div></div>
  </AppLayout>
);

export default SettingsPage;
