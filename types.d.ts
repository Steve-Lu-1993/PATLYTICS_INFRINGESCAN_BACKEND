import { JwtPayload } from 'jsonwebtoken';

declare global {
  namespace Express {
    interface Request {
      user?: string | JwtPayload; // 添加 user 屬性，可根據需要調整其類型
      data:any
    }
  }
}