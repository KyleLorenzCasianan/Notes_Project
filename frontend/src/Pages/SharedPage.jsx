import AppLayout from "../components/AppLayout";
import Icon from "../components/Icons";

const SharedPage = () => (
  <AppLayout dataTheme="retro">
    <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-center">
      <div><p className="text-xs font-semibold uppercase tracking-[0.18em] text-base-content/60">Your shared library</p><h1 className="mt-2 text-4xl font-semibold tracking-tight sm:text-5xl">Shared with you</h1></div>
      <button className="btn btn-primary btn-sm sm:btn-md"><span aria-hidden="true">＋</span> Add photos</button>
    </div>
    <div className="card mt-12 bg-base-200/60"><div className="card-body items-center justify-center py-24 text-center"><div className="grid size-14 place-items-center rounded-full bg-base-300"><Icon name="shared" size={24} /></div><h2 className="card-title mt-2">Shared with you</h2><p className="max-w-md text-sm text-base-content/70">Photos and albums your connections have shared with you.</p></div></div>
  </AppLayout>
);

export default SharedPage;
