import RegisterPatientForm from '@/components/RegisterPatientForm';

type Patient = {
  id: number;
  fullName: string;
  icNumber: string;
  dateOfBirth: string;
  age: number | null;
  createdAt: string;
};

const API_URL = process.env.API_URL ?? 'http://localhost:3000';

export default async function PatientsPage() {
  const res = await fetch(`${API_URL}/patients`, { cache: 'no-store' });
  if (!res.ok) {
    throw new Error(`Failed to load patients (status ${res.status})`);
  }
  const patients: Patient[] = await res.json();

  return (
    <>
      <RegisterPatientForm />

      <section className="card">
        <h2>Latest Patients ({patients.length})</h2>
        <table>
          <thead>
            <tr><th>ID</th><th>Name</th><th>IC Number</th><th>Date of Birth</th><th>Age</th></tr>
          </thead>
          <tbody>
            {patients.map((p) => (
              <tr key={p.id}>
                <td>{p.id}</td>
                <td>{p.fullName}</td>
                <td>{p.icNumber}</td>
                <td>{new Date(p.dateOfBirth).toLocaleDateString('en-MY')}</td>
                <td>{p.age ?? '-'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </>
  );
}
