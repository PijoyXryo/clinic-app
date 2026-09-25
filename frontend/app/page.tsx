'use client';

import { useCallback, useEffect, useState } from 'react';
import NowServing from '@/components/NowServing';
import QueueTable from '@/components/QueueTable';
import BookAppointmentForm from '@/components/BookAppointmentForm';
import { api } from '@/lib/api';
import type { Appointment, AppointmentStatus } from '@/lib/types';

export default function QueuePage() {
  // ===== STATE: the page owns the data =====
  const [queue, setQueue] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<number | null>(null);

  // ===== LOAD today's queue =====
  const loadQueue = useCallback(async () => {
    try {
      const data = await api<Appointment[]>('/appointments/today');
      setQueue(data);
      setError(null);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  }, []);

  // ===== EFFECT: when the page appears, load now and every 5 seconds =====
  // (setState is only called inside timer callbacks, which is what React recommends)
  useEffect(() => {
    const first = setTimeout(loadQueue, 0);
    const timer = setInterval(loadQueue, 5000);
    return () => {
      // cleanup: stop both timers when leaving the page
      clearTimeout(first);
      clearInterval(timer);
    };
  }, [loadQueue]);

  // ===== Called by QueueTable when Call/Done is clicked =====
  async function changeStatus(id: number, status: AppointmentStatus) {
    setBusyId(id);
    try {
      await api(`/appointments/${id}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status }),
      });
      await loadQueue();
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusyId(null);
    }
  }

  // ===== DERIVED =====
  const current = queue.find((a) => a.status === 'called');

  // ===== WHAT TO SHOW =====
  return (
    <>
      <NowServing current={current} />
      <BookAppointmentForm onBooked={loadQueue} />

      <section className="card">
        <h2>Today&apos;s Queue ({queue.length})</h2>
        {error && <p className="error">⚠️ {error}</p>}
        {loading ? (
          <p>Loading...</p>
        ) : (
          <QueueTable queue={queue} busyId={busyId} onChangeStatus={changeStatus} />
        )}
      </section>
    </>
  );
}