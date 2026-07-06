import { Document, Types } from 'mongoose';
import { UserRole } from '../../constants/roles';

export interface IUser extends Document<Types.ObjectId> {
  name: string;
  email: string;
  password: string;
  role: UserRole;
  isActive: boolean;
  comparePassword(candidatePassword: string): Promise<boolean>;
}
