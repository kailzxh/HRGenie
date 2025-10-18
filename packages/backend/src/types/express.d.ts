declare namespace Express {
  export interface Request {
    user?: {
      uid: string;
      role: string;
      email?: string;
    };
  }
}
import { RequestHandler } from 'express';

export interface AuthenticatedRequest extends Express.Request {
  body: { location?: string | undefined; };
  user?: {
    id: string;
    email: string;
    role: string;
    name?: string;
  };
}

// Generic handler that works with req.user
export type AuthHandler = RequestHandler<any, any, any, any, Record<string, any>>;