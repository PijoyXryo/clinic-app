'use client';

export default function PatientsError({ error }: { error: Error }) {
  return (
    <section className="card">
      <h2>⚠️ Could not load patients</h2>
      <p>{error.message}</p>
      <p>Is the backend running on port 3000?</p>
    </section>
  );
}