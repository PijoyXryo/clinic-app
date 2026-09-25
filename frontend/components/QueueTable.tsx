import StatusBadge from './StatusBadge';
import type { Appointment, AppointmentStatus } from '@/lib/types';

type Props = {
  queue: Appointment[];
  busyId: number | null;
  onChangeStatus: (id: number, status: AppointmentStatus) => void;
};

export default function QueueTable({ queue, busyId, onChangeStatus }: Props) {
  if (queue.length === 0) {
    return <p>No appointments today yet.</p>;
  }

  return (
    <table>
      <thead>
        <tr>
          <th>#</th><th>Name</th><th>Age</th><th>Reason</th><th>Fee</th><th>Status</th><th>Actions</th>
        </tr>
      </thead>
      <tbody>
        {queue.map((a) => (
          <tr key={a.id}>
            <td>{a.queueNumber}</td>
            <td>{a.patient.fullName}</td>
            <td>{a.patient.age ?? '-'}</td>
            <td>{a.reason ?? '-'}</td>
            <td>RM{a.fee.toFixed(2)}</td>
            <td><StatusBadge status={a.status} /></td>
            <td>
              <button
                disabled={busyId === a.id || a.status === 'called'}
                onClick={() => onChangeStatus(a.id, 'called')}
              >
                Call
              </button>
              <button
                className="secondary"
                disabled={busyId === a.id || a.status === 'done'}
                onClick={() => onChangeStatus(a.id, 'done')}
              >
                Done
              </button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}