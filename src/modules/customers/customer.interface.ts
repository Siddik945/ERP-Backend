import { Document, Types } from 'mongoose';

export interface ICustomer extends Document<Types.ObjectId> {
  name: string;
  email?: string;
  phone?: string;
  address?: string;
}
