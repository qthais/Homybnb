import { Request } from 'express';

export interface ExtendRequest extends Request {
  user: {
    email: string;
    sub: {
      userId: string;
    };
  };
}
