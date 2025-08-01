import { Request, Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';
import { AppError } from './errorHandler';

const prisma = new PrismaClient();

interface AuthRequest extends Request {
  auth?: {
    sub: string;
  };
  user?: any;
}

export const checkRole = (allowedRoles: string[]) => {
  return async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      if (!req.auth?.sub) {
        throw new AppError('Unauthorized', 401);
      }

      const user = await prisma.user.findUnique({
        where: { auth0Id: req.auth.sub },
        include: { organization: true }
      });

      if (!user) {
        throw new AppError('User not found', 404);
      }

      if (!allowedRoles.includes(user.role)) {
        throw new AppError('Insufficient permissions', 403);
      }

      req.user = user;
      next();
    } catch (error) {
      next(error);
    }
  };
};

export const checkPermission = (resource: string, action: string) => {
  return async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      if (!req.user) {
        throw new AppError('User not authenticated', 401);
      }

      const permissions = getPermissionsForRole(req.user.role);
      const permission = `${resource}:${action}`;
      const hasWildcard = permissions.includes(`${resource}:*`) || permissions.includes('*');
      
      if (!permissions.includes(permission) && !hasWildcard) {
        // Check for own resource permission
        const ownPermission = `${resource}:${action}:own`;
        if (!permissions.includes(ownPermission)) {
          throw new AppError('Insufficient permissions', 403);
        }
        // Set flag to check ownership in controller
        req.user.checkOwnership = true;
      }

      next();
    } catch (error) {
      next(error);
    }
  };
};

function getPermissionsForRole(role: string): string[] {
  const rolePermissions: Record<string, string[]> = {
    ADMIN: ['*'],
    FLEET_MANAGER: [
      'vehicles:read',
      'vehicles:update',
      'drivers:read',
      'expenses:read',
      'reports:read',
      'notifications:manage'
    ],
    ACCOUNTANT: [
      'expenses:*',
      'reports:financial',
      'vehicles:read',
      'invoices:*'
    ],
    DRIVER: [
      'vehicles:read:own',
      'expenses:create:fuel',
      'documents:read:own',
      'maintenance:report'
    ],
    VEHICLE_OWNER: [
      'vehicles:*:own',
      'expenses:*:own',
      'documents:*:own',
      'reports:read:own'
    ]
  };

  return rolePermissions[role] || [];
}