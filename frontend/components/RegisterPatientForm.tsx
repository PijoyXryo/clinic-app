'use client';

import { useState, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { getFee } from '@/lib/fee';
import { ageFromIc, birthDateFromIc } from '@/lib/ic';

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000';

type Message = { type: 'success' | 'error'; text: string } | null;

export default function RegisterPatientForm() {
  const router = useRouter();

  // ===== STATE: only what the user types =====
  const [fullName, setFullName] = useState('');
  const [icNumber, setIcNumber] = useState('');
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<Message>(null);

  // ===== DERIVED: calculated from state on every render =====
  const ic = icNumber.trim();
  const birthDate = birthDateFromIc(ic);
  const age = ageFromIc(ic);
  const icComplete = ic.length === 14;

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (age === null) {
      setMessage({ type: 'error', text: '❌ Please enter a valid IC number, e.g. 900101-14-5678' });
      return;
    }

    setSaving(true);
    setMessage(null);
    try {
      const res = await fetch(`${API_URL}/patients`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fullName: fullName.trim(), icNumber: ic }),
      });
      const data = await res.json();

      if (!res.ok) {
        const text = Array.isArray(data.message) ? data.message.join(', ') : data.message;
        setMessage({ type: 'error', text: `❌ ${text}` });
        return;
      }

      setMessage({ type: 'success', text: `✅ ${data.fullName} registered with ID ${data.id}` });
      setFullName('');
      setIcNumber('');
      router.refresh();
    } catch {
      setMessage({ type: 'error', text: '❌ Cannot reach the server. Is the backend running?' });
    } finally {
      setSaving(false);
    }
  }

  return (
    <section className="card">
      <h2>Register Patient</h2>
      <form onSubmit={handleSubmit} noValidate>
        <label htmlFor="fullName">Full name</label>
        <input
          id="fullName"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          placeholder="e.g. Ali bin Abu"
        />

        <label htmlFor="icNumber">IC number</label>
        <input
          id="icNumber"
          value={icNumber}
          onChange={(e) => setIcNumber(e.target.value)}
          placeholder="e.g. 900101-14-5678"
          maxLength={14}
        />

        {birthDate && age !== null && (
          <p>
            Born <strong>{birthDate.toLocaleDateString('en-MY', { day: '2-digit', month: 'short', year: 'numeric' })}</strong>
            {' · '}Age <strong>{age}</strong>
            {' · '}Fee <strong>RM{getFee(age)}</strong>
          </p>
        )}
        {icComplete && age === null && <p className="error">⚠️ The date of birth in this IC is not valid</p>}

        <button type="submit" disabled={saving}>
          {saving ? 'Saving...' : 'Register'}
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