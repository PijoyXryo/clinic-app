import type { Appointment } from '@/lib/types';

export default function NowServing({ current }: { current?: Appointment }) {
  return (
    <section className="card now-serving">
      <p>Now serving</p>
      <h2>{current ? `#${current.queueNumber}` : '—'}</h2>
      <p>{current ? current.patient.fullName : 'No one yet'}</p>
    </section>
  );
}