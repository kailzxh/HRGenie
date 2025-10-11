declare namespace Express {
  export interface Request {
    user?: {
      uid: string;
      role: string;
      email?: string;
    };
  }
}