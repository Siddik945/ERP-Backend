import { QueryBuilder } from '../../utils/queryBuilder';
import { User } from './user.model';
import { IUser } from './user.interface';

const createUser = async (payload: Pick<IUser, 'name' | 'email' | 'password' | 'role'>) => {
  const user = await User.create(payload);
  const safeUser = user.toObject();
  delete (safeUser as Partial<IUser>).password;
  return safeUser;
};

const getUsers = async (query: Record<string, unknown>) => {
  const result = await new QueryBuilder(User, query, ['name', 'email', 'role'])
    .search()
    .filterBy(['role', 'isActive'])
    .sort()
    .paginate()
    .execute();
  return result;
};

const updateUser = async (id: string, payload: Partial<IUser>) => {
  return User.findByIdAndUpdate(id, payload, { new: true, runValidators: true }).select('-password');
};

export const UserService = { createUser, getUsers, updateUser };
