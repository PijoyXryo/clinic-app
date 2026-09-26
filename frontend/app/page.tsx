'use client';

import { useCallback, useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import NowServing from '@/components/NowServing';
import QueueTable from '@/components/QueueTable';
import CheckInForm from '@/components/CheckInForm';
import { api, API_URL } from '@/lib/api';
import type { Appointment, AppointmentStatus } from '@/lib/types';

export default function QueuePage() {
  const [queue, setQueue] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<number | null>(null);
  const [live, setLive] = useState(false); // NEW: is the WebSocket connected?

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

  // NEW: one open connection instead of asking every 5 seconds
  useEffect(() => {
    const socket = io(API_URL);

    socket.on('connect', () => {
      setLive(true);
      loadQueue(); // (re)connected: load the full queue in case we missed updates
    });
    socket.on('disconnect', () => setLive(false));

    // The server pushes the new queue whenever anything changes
    socket.on('queue:updated', (newQueue: Appointment[]) => {
      setQueue(newQueue);
      setError(null);
    });

    return () => {
      socket.disconnect(); // cleanup: close the connection when leaving the page
    };
  }, [loadQueue]);

  async function changeStatus(id: number, status: AppointmentStatus) {
    setBusyId(id);
    try {
      await api(`/appointments/${id}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status }),
      });
      // No need to reload: the server will push 'queue:updated' to everyone, including us
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusyId(null);
    }
  }

  const current = queue.find((a) => a.status === 'called');

  return (
    <>
      <NowServing current={current} />
      <CheckInForm onBooked={() => {}} />

      <section className="card">
        <h2>
          Today&apos;s Queue ({queue.length}){' '}
          <small className={live ? 'live' : 'offline'}>
            {live ? '● Live' : '● Reconnecting...'}
          </small>
        </h2>
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