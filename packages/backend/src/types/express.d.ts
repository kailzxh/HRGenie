import { Request, RequestHandler } from 'express';

// Extend Express namespace to include user
declare namespace Express {
  export interface Request {
    user?: {
      uid: string;
      role: string;
      email?: string;
    };
  }
}

// ✅ Generic AuthenticatedRequest interface
// You can now specify your param/body types in each controller.
export interface AuthenticatedRequest<
  Params = Record<string, any>, // route params
  ResBody = any,                // response body
  ReqBody = Record<string, any>,// request body
  ReqQuery = Record<string, any>// query string
> extends Request<Params, ResBody, ReqBody, ReqQuery> {
  user?: {
    id: string;
    email: string;
    role: string;
    name?: string;
  };
}

// ✅ Generic handler type (optional)
export type AuthHandler = RequestHandler<any, any, any, any, Record<string, any>>;
