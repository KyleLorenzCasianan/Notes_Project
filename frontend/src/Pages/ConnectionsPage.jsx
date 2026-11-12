import AppLayout from "../components/AppLayout";
import Icon from "../components/Icons";

const ConnectionsPage = () => (
  <AppLayout>
    <PageHeader eyebrow="Your circle" title="Connections" />
    <EmptyCard icon="connections" title="Connections" description="Manage the people you share memories with." action="Add a connection" />
  </AppLayout>
);

const PageHeader = ({ eyebrow, title }) => <div><p className="text-xs font-semibold uppercase tracking-[0.18em] text-base-content/50">{eyebrow}</p><h1 className="mt-2 text-4xl font-semibold tracking-tight sm:text-5xl">{title}</h1></div>;
const EmptyCard = ({ icon, title, description, action }) => <div className="card mt-12 bg-base-200/50"><div className="card-body items-center justify-center py-24 text-center"><div className="grid size-14 place-items-center rounded-full bg-base-300"><Icon name={icon} size={24} /></div><h2 className="card-title mt-2">{title}</h2><p className="max-w-md text-sm text-base-content/60">{description}</p>{action && <button className="btn btn-primary btn-sm mt-3">{action}</button>}</div></div>;

export default ConnectionsPage;
