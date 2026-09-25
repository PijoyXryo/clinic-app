'use client';

import { useState, type FormEvent } from 'react';
import { api, ApiError } from '@/lib/api';
import { getFee } from '@/lib/fee';
import { ageFromIc } from '@/lib/ic';
import type { Appointment, Patient } from '@/lib/types';

// The screen is always in exactly ONE of these situations
type Lookup =
  | { status: 'idle' }
  | { status: 'checking' }
  | { status: 'found'; patient: Patient }
  | { status: 'new' };

type Message = { type: 'success' | 'error'; text: string } | null;

export default function CheckInForm({ onBooked }: { onBooked: () => void }) {
  const [icNumber, setIcNumber] = useState('');
  const [lookup, setLookup] = useState<Lookup>({ status: 'idle' });
  const [fullName, setFullName] = useState('');
  const [reason, setReason] = useState('');
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<Message>(null);

  // Derived from the IC
  const ic = icNumber.trim();
  const age = ageFromIc(ic);
  const icComplete = ic.length === 14;

  // Typing a different IC resets the search
  function handleIcChange(value: string) {
    setIcNumber(value);
    setLookup({ status: 'idle' });
    setMessage(null);
  }

  // ===== STEP 1: search by IC =====
  async function checkIc(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (age === null) return;

    setLookup({ status: 'checking' });
    try {
      const patient = await api<Patient>(`/patients/by-ic/${encodeURIComponent(ic)}`);
      setLookup({ status: 'found', patient });
    } catch (error) {
      if (error instanceof ApiError && error.status === 404) {
        setLookup({ status: 'new' }); // not an error! just a new patient
      } else {
        setLookup({ status: 'idle' });
        setMessage({ type: 'error', text: `❌ ${(error as Error).message}` });
      }
    }
  }

  // ===== STEP 2: (register if new) + add to queue =====
  async function addToQueue() {
    setSaving(true);
    setMessage(null);
    try {
      let patientId: number;

      if (lookup.status === 'found') {
        patientId = lookup.patient.id;
      } else if (lookup.status === 'new') {
        const created = await api<Patient>('/patients', {
          method: 'POST',
          body: JSON.stringify({ fullName: fullName.trim(), icNumber: ic }),
        });
        patientId = created.id;
      } else {
        return;
      }

      const body: { patientId: number; reason?: string } = { patientId };
      if (reason.trim()) body.reason = reason.trim();

      const appt = await api<Appointment>('/appointments', {
        method: 'POST',
        body: JSON.stringify(body),
      });

      setMessage({
        type: 'success',
        text: `✅ ${appt.patient.fullName} is #${appt.queueNumber} (RM${appt.fee.toFixed(2)})`,
      });
      setIcNumber('');
      setFullName('');
      setReason('');
      setLookup({ status: 'idle' });
      onBooked();
    } catch (error) {
      setMessage({ type: 'error', text: `❌ ${(error as Error).message}` });
    } finally {
      setSaving(false);
    }
  }

  return (
    <section className="card">
      <h2>Patient Check-in</h2>

      {/* STEP 1 */}
      <form onSubmit={checkIc} noValidate>
        <label htmlFor="checkin-ic">IC number</label>
        <input
          id="checkin-ic"
          value={icNumber}
          onChange={(e) => handleIcChange(e.target.value)}
          placeholder="e.g. 900101-14-5678"
          maxLength={14}
          autoFocus
        />
        {icComplete && age === null && (
          <p className="error">⚠️ The date of birth in this IC is not valid</p>
        )}
        <button type="submit" disabled={age === null || lookup.status === 'checking'}>
          {lookup.status === 'checking' ? 'Checking...' : 'Check IC'}
        </button>
      </form>

      {/* STEP 2a: returning patient */}
      {lookup.status === 'found' && (
        <div className="lookup-box found">
          <p>
            ✅ <strong>Returning patient:</strong> {lookup.patient.fullName}
            {' · '}Age {lookup.patient.age}
            {age !== null && <> · Fee RM{getFee(age)}</>}
          </p>
        </div>
      )}

      {/* STEP 2b: new patient */}
      {lookup.status === 'new' && (
        <div className="lookup-box new">
          <p>🆕 <strong>New patient</strong>: not registered yet. Enter their name:</p>
          <label htmlFor="checkin-name">Full name</label>
          <input
            id="checkin-name"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            placeholder="e.g. Ali bin Abu"
          />
        </div>
      )}

      {/* STEP 3: reason + button (for both cases) */}
      {(lookup.status === 'found' || lookup.status === 'new') && (
        <div className="stack">
          <label htmlFor="checkin-reason">Reason (optional)</label>
          <input
            id="checkin-reason"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="e.g. Fever"
          />
          <button
            type="button"
            onClick={addToQueue}
            disabled={saving || (lookup.status === 'new' && fullName.trim() === '')}
          >
            {saving ? 'Saving...' : lookup.status === 'new' ? 'Register & add to queue' : 'Add to queue'}
          </button>
        </div>
      )}

      {message && (
        <p id="message" className={message.type}>
          {message.text}
        </p>
      )}
    </section>
  );
}