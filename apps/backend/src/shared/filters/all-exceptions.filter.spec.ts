import { HttpStatus } from '@nestjs/common';
import { QueryFailedError } from 'typeorm';
import { describeConstraintViolation } from './all-exceptions.filter';

const dbError = (code: string, detail: string) =>
  new QueryFailedError(
    'INSERT ...',
    [],
    Object.assign(new Error(), { code, detail }),
  );

describe('describeConstraintViolation', () => {
  it('maps a duplicate email to 409 without echoing the value', () => {
    const result = describeConstraintViolation(
      dbError('23505', 'Key (email)=(a@b.c) already exists.'),
    );
    expect(result).toEqual({
      statusCode: HttpStatus.CONFLICT,
      message: 'An account with this email already exists',
      error: 'Conflict',
    });
  });

  it('maps a taken jersey number to 409', () => {
    expect(
      describeConstraintViolation(
        dbError('23505', 'Key (jersey_number)=(10) already exists.'),
      )?.message,
    ).toBe('This jersey number is already taken by an active player');
  });

  it('maps a missing foreign key target to 400', () => {
    expect(
      describeConstraintViolation(
        dbError('23503', 'Key (player_id)=(999) is not present.'),
      )?.statusCode,
    ).toBe(HttpStatus.BAD_REQUEST);
  });

  it('leaves other errors alone', () => {
    expect(describeConstraintViolation(dbError('42P01', ''))).toBeUndefined();
    expect(describeConstraintViolation(new Error('boom'))).toBeUndefined();
  });
});
