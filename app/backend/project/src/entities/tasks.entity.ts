import { Decimal } from '@prisma/client/runtime/library';

export class Task {
  id: number;
  name: string;
  cost: Decimal;
  dueDate: Date;
  order: number;
  createdAt: Date;
  updatedAt: Date;
}
