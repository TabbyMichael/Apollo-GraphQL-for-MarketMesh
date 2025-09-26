import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

if (!JWT_SECRET) {
  throw new Error('JWT_SECRET environment variable is not set');
}

/**
 * Generates a JWT token for a given user ID and role.
 * @param userId The ID of the user.
 * @param role The role of the user.
 * @returns The generated JWT token.
 */
export const generateToken = (userId: string, role: string): string => {
  return jwt.sign({ userId, role }, JWT_SECRET, {
    expiresIn: JWT_EXPIRES_IN,
  });
};

/**
 * Verifies a JWT token and returns its payload.
 * @param token The JWT token to verify.
 * @returns The decoded token payload.
 */
export const verifyToken = (token: string): { userId: string; role: string } => {
  try {
    return jwt.verify(token, JWT_SECRET) as { userId: string; role: string };
  } catch (error) {
    throw new Error('Invalid or expired token');
  }
};