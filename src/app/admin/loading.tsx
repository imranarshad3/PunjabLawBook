export default function AdminLoading() {
  return (
    <main className="plbh-admin-app plbh-admin-loading" aria-busy="true" aria-label="Loading workspace">
      <div className="plbh-admin-loading-content">
        <span className="plbh-admin-eyebrow">PUNJAB LAW BOOK HOUSE</span>
        <h1>Opening your workspace…</h1>
        <p role="status">Loading the catalogue and workspace controls.</p>
        <div className="plbh-admin-loading-bar">
          <div className="plbh-admin-loading-progress" />
        </div>
      </div>
    </main>
  );
}
