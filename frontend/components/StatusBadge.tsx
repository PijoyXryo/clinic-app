type Props = {
  status: 'waiting' | 'called' | 'done';
};

export default function StatusBadge({ status }: Props) {
  return <span className={`badge ${status}`}>{status}</span>;
}