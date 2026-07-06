import { ApiError } from "../../utils/ApiError";
import { signToken } from "../../utils/jwt";
import { Role } from "../roles/role.model";
import { User } from "../users/user.model";

const login = async (email: string, password: string) => {
  const user = await User.findOne({ email: email.toLowerCase() }).select(
    "+password",
  );
  if (!user || !user.isActive) {
    throw new ApiError(401, "Invalid email or password");
  }

  const isPasswordMatched = await user.comparePassword(password);
  if (!isPasswordMatched) {
    throw new ApiError(401, "Invalid email or password");
  }

  const role = await Role.findOne({ name: user.role }).select("permissions");
  if (!role) {
    throw new ApiError(
      403,
      "Role permissions are not configured. Please run npm run seed.",
    );
  }

  const token = signToken({
    userId: user._id.toString(),
    email: user.email,
    role: user.role,
  });
  return {
    token,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      permissions: role.permissions,
    },
  };
};

const me = async (userId: string) => {
  const user = await User.findById(userId).select("-password").lean();
  if (!user) return null;

  const role = await Role.findOne({ name: user.role })
    .select("permissions")
    .lean();

  return {
    ...user,
    permissions: role?.permissions || [],
  };
};

export const AuthService = { login, me };
