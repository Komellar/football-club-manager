import { type StaticPlayerData } from './types';
import { goalkeepers } from './goalkeepers.data';
import { defenders } from './defenders.data';
import { midfielders } from './midfielders.data';
import { forwards } from './forwards.data';

export const staticPlayers: StaticPlayerData[] = [
  ...goalkeepers,
  ...defenders,
  ...midfielders,
  ...forwards,
];

export * from './types';
export { goalkeepers, defenders, midfielders, forwards };
