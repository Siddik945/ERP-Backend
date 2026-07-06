import { ApiError } from '../../utils/ApiError';
import { signToken } from '../../utils/jwt';
import { User } from '../users/user.model';

const login = async (email: string, password: string) => {
  const user = await User.findOne({ email: email.toLowerCase() }).select('+password');
  if (!user || !user.isActive) {
    throw new ApiError(401, 'Invalid email or password');
  }

  const isPasswordMatched = await user.comparePassword(password);
  if (!isPasswordMatched) {
    throw new ApiError(401, 'Invalid email or password');
  }

  const token = signToken({ userId: user._id.toString(), email: user.email, role: user.role });
  return {
    token,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role
    }
  };
};

const me = async (userId: string) => {
  return User.findById(userId).select('-password');
};

export const AuthService = { login, me };
