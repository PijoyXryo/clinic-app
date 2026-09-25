import dayjs from 'dayjs';
import { patients } from './patients.js';
import { getFee } from './fees.js';

console.log(`Clinic report for ${dayjs().format('DD-MMM-YYYY')}`);

for (const p of patients) {
    const fee = getFee(p.age);
    const lastVisit = dayjs(p.lastVisit);
    const followUp = lastVisit.add(7, 'day');

    console.log(
        `${p.name} (${p.age}) - RM${fee} - last visit ${lastVisit.format('DD-MMM-YYYY')} - follow-up ${followUp.format('DD-MMM-YYYY')}`
    );
}
