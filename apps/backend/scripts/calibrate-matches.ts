import { calibrateMatches } from '../src/modules/match-events/services/match-calibration';

const samples = Number(process.argv[2] ?? 2000);
const prefix = process.argv[3] ?? 'calibration';
console.log(JSON.stringify(calibrateMatches(samples, prefix), null, 2));
