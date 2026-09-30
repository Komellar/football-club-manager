import {
  forecastMatchday,
  simulateMatchday,
  type StadiumSettings,
  UpdateFixtureSchema,
} from '@repo/core';

const stadium: StadiumSettings = {
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
describe('matchday demand and money', () => {
  it('forecasts default occupancy and excludes monthly maintenance from matchday costs', () => {
    expect(forecastMatchday(stadium)).toMatchObject({
      expectedAttendance: 6000,
      operatingCosts: 650,
      expectedRevenue: 120000,
      expectedProfit: 119350,
    });
  });
  it('reduces demand when price rises and caps discounted admission at capacity', () => {
    expect(forecastMatchday(stadium, 40).expectedAttendance).toBe(4000);
    expect(forecastMatchday(stadium, 0)).toMatchObject({
      expectedAttendance: 10000,
      expectedRevenue: 0,
      expectedProfit: -650,
    });
  });
  it('handles free defaults and empty stands without invalid numbers', () => {
    expect(
      forecastMatchday({ ...stadium, defaultTicketPrice: 0 }),
    ).toMatchObject({ expectedAttendance: 6000, expectedRevenue: 0 });
    expect(
      simulateMatchday({ ...stadium, expectedOccupancy: 0 }, 20, () => 1)
        .attendance,
    ).toBe(0);
  });
  it('bounds random attendance and keeps decimal ticket totals exact', () => {
    const snapshot = simulateMatchday(
      { ...stadium, expectedOccupancy: 100 },
      20,
      () => 1,
    );
    expect(snapshot.attendance).toBe(10000);
    const decimal = simulateMatchday(
      {
        ...stadium,
        capacity: 3,
        defaultTicketPrice: 0.1,
        expectedOccupancy: 100,
      },
      0.1,
      () => 0.5,
    );
    expect(decimal.ticketRevenue).toBe(0.3);
  });
  it('supports clearing a price override while preserving free admission', () => {
    expect(UpdateFixtureSchema.parse({ ticketPrice: null })).toEqual({
      ticketPrice: null,
    });
    expect(UpdateFixtureSchema.parse({ ticketPrice: 0 })).toEqual({
      ticketPrice: 0,
    });
    expect(UpdateFixtureSchema.safeParse({ ticketPrice: 0.001 }).success).toBe(
      false,
    );
  });
});
