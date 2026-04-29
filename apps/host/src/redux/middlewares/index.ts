import { authMiddleware } from './auth-middleware';
import { logoutMiddleware } from './logout-middleware';

export default [authMiddleware, logoutMiddleware];
