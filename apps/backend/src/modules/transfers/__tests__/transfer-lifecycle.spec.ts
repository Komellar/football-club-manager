import {
  TransferDirection as Direction,
  TransferType as Type,
  TransferStatus,
  type CreateTransferDto,
} from '@repo/core';
import { getTransferOwnership } from '../services/transfer-lifecycle';

const movement = (
  type: Type,
  direction: Direction,
  date: string,
  fields: Partial<CreateTransferDto> = {},
): CreateTransferDto => ({
  playerId: 1,
  transferType: type,
  transferDirection: direction,
  transferDate: new Date(date),
  transferStatus: TransferStatus.COMPLETED,
  otherClubName: 'Other Club',
  ...fields,
});
describe('Transfer lifecycle', () => {
  const signing = movement(Type.SIGNING, Direction.INCOMING, '2026-01-01');
  it('allows a sale after a signing, followed by a later signing', () => {
    const sale = movement(Type.SALE, Direction.OUTGOING, '2026-07-01');
    expect(getTransferOwnership([signing, sale])).toEqual({
      currentClub: 'Other Club',
    });
    expect(
      getTransferOwnership([
        signing,
        sale,
        movement(Type.SIGNING, Direction.INCOMING, '2026-08-01'),
      ]),
    ).toEqual({ currentClub: 'My Club' });
  });
  it('rejects duplicate incoming movements and sales of an absent player', () => {
    expect(() =>
      getTransferOwnership([
        signing,
        movement(Type.SIGNING, Direction.INCOMING, '2026-02-01'),
      ]),
    ).toThrow('already at');
    expect(() =>
      getTransferOwnership([
        movement(Type.SALE, Direction.OUTGOING, '2026-01-01'),
        movement(Type.SALE, Direction.OUTGOING, '2026-02-01'),
      ]),
    ).toThrow('not currently');
  });
  it('matches loan returns to the club and opposite direction', () => {
    const loan = movement(Type.LOAN, Direction.OUTGOING, '2026-02-01', {
      loanEndDate: new Date('2026-06-30'),
    });
    const returned = movement(
      Type.LOAN_RETURN,
      Direction.INCOMING,
      '2026-06-01',
    );
    expect(getTransferOwnership([signing, loan, returned])).toEqual({
      currentClub: 'My Club',
    });
    expect(() => getTransferOwnership([signing, returned])).toThrow(
      'earlier loan',
    );
    expect(() =>
      getTransferOwnership([
        signing,
        loan,
        { ...returned, otherClubName: 'Wrong Club' },
      ]),
    ).toThrow('earlier loan');
  });
  it('rejects overlapping loans but restores ownership after expiry', () => {
    const loan = movement(Type.LOAN, Direction.OUTGOING, '2026-02-01', {
      loanEndDate: new Date('2026-06-30'),
    });
    expect(() =>
      getTransferOwnership([
        signing,
        loan,
        movement(Type.LOAN, Direction.OUTGOING, '2026-03-01', {
          loanEndDate: new Date('2026-07-31'),
        }),
      ]),
    ).toThrow('active loan');
    expect(
      getTransferOwnership([signing, loan], new Date('2026-07-01')),
    ).toEqual({ currentClub: 'My Club' });
    expect(
      getTransferOwnership([
        signing,
        loan,
        movement(Type.SALE, Direction.OUTGOING, '2026-07-01'),
      ]),
    ).toEqual({ currentClub: 'Other Club' });
  });
  it('ignores pending and future transfers when reporting current ownership', () => {
    expect(
      getTransferOwnership(
        [signing, movement(Type.SALE, Direction.OUTGOING, '2026-12-01')],
        new Date('2026-10-02'),
      ),
    ).toEqual({ currentClub: 'My Club' });
    expect(
      getTransferOwnership([
        { ...signing, transferStatus: TransferStatus.PENDING },
      ]),
    ).toEqual({ currentClub: undefined });
  });
});
