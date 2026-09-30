import { StadiumSettingsSchema } from '@repo/core';

describe('stadium settings validation', () => {
  const settings = {
    name: 'Club Ground',
    capacity: 10000,
    defaultTicketPrice: 20,
    expectedOccupancy: 60,
    monthlyMaintenance: 1000,
    securityCost: 200,
    staffingCost: 300,
    cleaningCost: 100,
    utilitiesCost: 50,
  };
  it.each([
    { capacity: 0 },
    { capacity: 1.5 },
    { expectedOccupancy: 101 },
    { expectedOccupancy: -1 },
    { defaultTicketPrice: -1 },
    { defaultTicketPrice: 10.001 },
    { securityCost: -1 },
    { name: ' ' },
  ])('rejects invalid settings %j', (invalid) => {
    expect(
      StadiumSettingsSchema.safeParse({ ...settings, ...invalid }).success,
    ).toBe(false);
  });
  it('accepts free admission and zero costs', () => {
    expect(
      StadiumSettingsSchema.parse({
        ...settings,
        defaultTicketPrice: 0,
        utilitiesCost: 0,
      }).defaultTicketPrice,
    ).toBe(0);
  });
});
