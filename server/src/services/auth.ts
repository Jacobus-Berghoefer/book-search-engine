import jwt from 'jsonwebtoken';
import { Request } from 'express';

const secret = process.env.JWT_SECRET || 'mysecret';
const expiration = '2h';

interface AuthContext {
  user: any | null;
}

export const authMiddleware = async ({ req }: { req: Request }): Promise<AuthContext> => {
  let token = req.headers.authorization || '';

  if (token.startsWith('Bearer ')) {
    token = token.split(' ')[1];
  }

  if (!token) {
    return { user: null };
  }

  try {
    const { data } = jwt.verify(token, secret) as any;
    return { user: data };
  } catch (err) {
    console.error('Invalid token');
    return { user: null };
  }
};


export const signToken = (user: any) => {
  return jwt.sign({ data: user }, secret, { expiresIn: expiration });
};

