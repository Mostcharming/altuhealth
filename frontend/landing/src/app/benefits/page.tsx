export default function BenefitsPage() {
  return (
    <main className="benefits-loading-page">
      <div className="benefits-loading-content" role="status" aria-live="polite">
        <span className="benefits-loading-spinner" aria-hidden="true"></span>
        <p>Loading benefits...</p>
      </div>
    </main>
  );
}
