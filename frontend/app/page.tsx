import StatusBadge from '@/components/StatusBadge';

export default function HomePage() {
  return (
    <section className="card">
      <h2>Component demo</h2>
      <p>Waiting: <StatusBadge status="waiting" /></p>
      <p>Called: <StatusBadge status="called" /></p>
      <p>Done: <StatusBadge status="done" /></p>
    </section>
  );
}