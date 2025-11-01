import {
  ContractType,
  ContractStatus,
  PlayerPosition,
  ValidCountry,
} from '@repo/core';

export interface StaticPlayerData {
  name: string;
  position: PlayerPosition;
  dateOfBirth: Date;
  country: ValidCountry;
  height: number;
  weight: number;
  jerseyNumber?: number;
  marketValue: number;
  isActive: boolean;
  contractType: ContractType;
  contractStatus: ContractStatus;
  contractStart: Date;
  contractEnd: Date;
  salary: number;
  bonuses: number;
  signOnFee: number;
  releaseClause?: number;
  agentFee: number;
}
