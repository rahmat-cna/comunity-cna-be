import { User } from '../users/entities/user.entity'; // sesuaikan path

declare global {
  namespace Express {
    interface Request {
      user?: User & { userId?: number }; // tambahkan userId kalau memang ada
    }
  }
}
