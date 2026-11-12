import AppLayout from "../components/AppLayout";
import Icon from "../components/Icons";

const TrashPage = () => (
  <AppLayout>
    <PageHeader />
    <div className="card mt-12 bg-base-200/50"><div className="card-body items-center justify-center py-24 text-center"><div className="grid size-14 place-items-center rounded-full bg-base-300"><Icon name="trash" size={24} /></div><h2 className="card-title mt-2">Your trash is empty</h2><p className="max-w-md text-sm text-base-content/60">Deleted photos stay here for 30 days before they are removed forever.</p></div></div>
  </AppLayout>
);

const PageHeader = () => <div><p className="text-xs font-semibold uppercase tracking-[0.18em] text-base-content/50">Recently deleted</p><h1 className="mt-2 text-4xl font-semibold tracking-tight sm:text-5xl">Trash</h1></div>;

export default TrashPage;
