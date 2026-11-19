import { CreatePlayerSchema, UpdatePlayerSchema } from '@repo/core';

const player = (dateOfBirth: string) => ({
  name: 'Veteran Player',
  position: 'goalkeeper',
  dateOfBirth,
  country: 'ESP',
  isActive: true,
});

const yearsAgo = (years: number) => {
  const date = new Date();
  date.setFullYear(date.getFullYear() - years);
  return date.toISOString().slice(0, 10);
};

describe('player input schemas', () => {
  it('applies the 15–50 signing age only when creating', () => {
    expect(CreatePlayerSchema.safeParse(player(yearsAgo(51))).success).toBe(
      false,
    );
    expect(UpdatePlayerSchema.safeParse(player(yearsAgo(51))).success).toBe(
      true,
    );
    expect(CreatePlayerSchema.safeParse(player(yearsAgo(25))).success).toBe(
      true,
    );
  });

  it('still rejects impossible birth dates on update', () => {
    expect(UpdatePlayerSchema.safeParse(player('2999-01-01')).success).toBe(
      false,
    );
    expect(UpdatePlayerSchema.safeParse(player('1850-01-01')).success).toBe(
      false,
    );
  });
});
