import type { StadiumSettings } from "../schemas/stadium";

export interface MatchdayForecast {
  stadium: StadiumSettings;
  ticketPrice: number;
  expectedAttendance: number;
  operatingCosts: number;
  expectedRevenue: number;
  expectedProfit: number;
}
export interface MatchdaySnapshot extends MatchdayForecast {
  attendance: number;
  ticketRevenue: number;
  operatingProfit: number;
}

export function forecastMatchday(
  stadium: StadiumSettings,
  ticketPrice = stadium.defaultTicketPrice,
): MatchdayForecast {
  // The reference floor keeps free-default admission well-defined.
  const referencePrice = Math.max(1, stadium.defaultTicketPrice);
  const priceFactor =
    (referencePrice + stadium.defaultTicketPrice) /
    (referencePrice + ticketPrice);
  const expectedAttendance = Math.min(
    stadium.capacity,
    Math.max(
      0,
      Math.round(
        ((stadium.capacity * stadium.expectedOccupancy) / 100) * priceFactor,
      ),
    ),
  );
  const operatingCosts =
    [
      stadium.securityCost,
      stadium.staffingCost,
      stadium.cleaningCost,
      stadium.utilitiesCost,
    ].reduce((sum, cost) => sum + Math.round(cost * 100), 0) / 100;
  const expectedRevenue =
    (expectedAttendance * Math.round(ticketPrice * 100)) / 100;
  return {
    stadium,
    ticketPrice,
    expectedAttendance,
    operatingCosts,
    expectedRevenue,
    expectedProfit: Math.round((expectedRevenue - operatingCosts) * 100) / 100,
  };
}

export function simulateMatchday(
  stadium: StadiumSettings,
  ticketPrice = stadium.defaultTicketPrice,
  random = Math.random,
): MatchdaySnapshot {
  const forecast = forecastMatchday(stadium, ticketPrice);
  const attendance = Math.min(
    stadium.capacity,
    Math.max(
      0,
      Math.round(forecast.expectedAttendance * (0.9 + random() * 0.2)),
    ),
  );
  const ticketRevenue = (attendance * Math.round(ticketPrice * 100)) / 100;
  return {
    ...forecast,
    attendance,
    ticketRevenue,
    operatingProfit:
      Math.round((ticketRevenue - forecast.operatingCosts) * 100) / 100,
  };
}
