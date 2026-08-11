import { Prisma } from '@prisma/client';

export const toNumber = (v: Prisma.Decimal | number | null | undefined): number =>
  v == null ? 0 : typeof v === 'number' ? v : v.toNumber();
