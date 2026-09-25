'use client';

import { useState, type FormEvent } from 'react';
import { api } from '@/lib/api';
import type { Appointment } from '@/lib/types';

type Message = { type: 'success' | 'error'; text: string } | null;

export default function BookAppointmentForm({ onBooked }: { onBooked: () => void }) {
  const [patientId, setPatientId] = useState('');
  const [reason, setReason] = useState('');
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<Message>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setMessage(null);

    try {
      const body: { patientId: number; reason?: string } = { patientId: Number(patientId) };
      if (reason.trim()) body.reason = reason.trim();

      const appt = await api<Appointment>('/appointments', {
        method: 'POST',
        body: JSON.stringify(body),
      });

      setMessage({
        type: 'success',
        text: `✅ ${appt.patient.fullName} is #${appt.queueNumber} (RM${appt.fee.toFixed(2)})`,
      });
      setPatientId('');
      setReason('');
      onBooked(); // tell the parent page: "reload the queue!"
    } catch (error) {
      setMessage({ type: 'error', text: `❌ ${(error as Error).message}` });
    } finally {
      setSaving(false);
    }
  }

  return (
    <section className="card">
      <h2>Book Appointment</h2>
      <form onSubmit={handleSubmit} noValidate>
        <label htmlFor="patientId">Patient ID</label>
        <input
          id="patientId"
          type="number"
          value={patientId}
          onChange={(e) => setPatientId(e.target.value)}
          placeholder="Find it on the Patients page"
        />

        <label htmlFor="reason">Reason (optional)</label>
        <input
          id="reason"
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          placeholder="e.g. Fever"
        />

        <button type="submit" disabled={saving || patientId === ''}>
          {saving ? 'Booking...' : "Add to today's queue"}
        </button>
      </form>

      {message && (
        <p id="message" className={message.type}>
          {message.text}
        </p>
      )}
    </section>
  );
}