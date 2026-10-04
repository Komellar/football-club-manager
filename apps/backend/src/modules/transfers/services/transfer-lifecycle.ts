import {
  TransferDirection,
  TransferStatus,
  TransferType,
  type CreateTransferDto,
} from '@repo/core';

type Entry = CreateTransferDto & { id?: number };

/** Replays completed movements; historical transfers do not permanently lock a player. */
export function getTransferOwnership(
  entries: Entry[],
  asOf?: Date,
): { currentClub?: string } {
  let atClub: boolean | undefined;
  let currentClub: string | undefined;
  const strict = asOf === undefined;
  let loan:
    | { entry: Entry; previousClub: string; previousAtClub: boolean }
    | undefined;
  const movements = entries
    .filter((entry) => entry.transferStatus === TransferStatus.COMPLETED)
    .sort(
      (a, b) =>
        new Date(a.transferDate).getTime() -
          new Date(b.transferDate).getTime() ||
        (a.id ?? Number.MAX_SAFE_INTEGER) - (b.id ?? Number.MAX_SAFE_INTEGER),
    );
  const expireLoan = (date: Date) => {
    if (
      loan?.entry.loanEndDate &&
      date.toISOString().slice(0, 10) >
        new Date(loan.entry.loanEndDate).toISOString().slice(0, 10)
    ) {
      atClub = loan.previousAtClub;
      currentClub = loan.previousClub;
    }
  };
  for (const entry of movements) {
    const date = new Date(entry.transferDate);
    if (asOf && date > asOf) break;
    expireLoan(date);
    const incoming = entry.transferDirection === TransferDirection.INCOMING;
    const activeLoan =
      loan?.entry.loanEndDate &&
      date.toISOString().slice(0, 10) <=
        new Date(loan.entry.loanEndDate).toISOString().slice(0, 10);
    if (entry.transferType === TransferType.LOAN_RETURN) {
      if (
        !loan ||
        incoming ===
          (loan.entry.transferDirection === TransferDirection.INCOMING) ||
        entry.otherClubName?.toLowerCase() !==
          loan.entry.otherClubName?.toLowerCase()
      ) {
        if (strict)
          throw new Error(
            'A loan return must match an earlier loan and reverse its direction',
          );
        atClub = incoming;
        currentClub = incoming
          ? 'My Club'
          : entry.otherClubName || 'Free Agent';
        loan = undefined;
        continue;
      }
      atClub = loan.previousAtClub;
      currentClub = loan.previousClub;
      loan = undefined;
      continue;
    }
    if (strict && activeLoan)
      throw new Error(
        'Complete or return the active loan before another transfer',
      );
    if (strict && incoming && atClub === true)
      throw new Error('Player is already at My Club');
    if (strict && !incoming && atClub === false)
      throw new Error('Player is not currently at My Club');
    if (entry.transferType === TransferType.LOAN) {
      loan = {
        entry,
        previousAtClub: !incoming,
        previousClub: incoming ? entry.otherClubName! : 'My Club',
      };
    } else {
      loan = undefined;
    }
    atClub = incoming;
    currentClub = incoming ? 'My Club' : entry.otherClubName || 'Free Agent';
  }
  if (asOf) expireLoan(asOf);
  return { currentClub };
}
