import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { z } from 'zod';
import { AppError } from '../middleware/errorHandler';

const router = Router();
const prisma = new PrismaClient();

const createUserSchema = z.object({
  email: z.string().email(),
  name: z.string().min(2),
  role: z.enum(['ADMIN', 'FLEET_MANAGER', 'ACCOUNTANT', 'DRIVER', 'VEHICLE_OWNER']),
  phoneNumber: z.string().optional()
});

// GET all users in organization
router.get('/', async (req: any, res) => {
  const { organizationId } = req.user;

  const users = await prisma.user.findMany({
    where: { organizationId },
    include: {
      driver: true
    }
  });

  res.json(users);
});

// CREATE user
router.post('/', async (req: any, res) => {
  const validatedData = createUserSchema.parse(req.body);
  const { organizationId } = req.user;

  const user = await prisma.user.create({
    data: {
      ...validatedData,
      organizationId,
      auth0Id: `pending_${Date.now()}` // Will be updated when user logs in
    }
  });

  // If role is DRIVER, create driver record
  if (validatedData.role === 'DRIVER') {
    await prisma.driver.create({
      data: {
        userId: user.id,
        licenseNumber: '',
        licenseExpiry: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000) // 1 year from now
      }
    });
  }

  res.status(201).json(user);
});

// UPDATE user role
router.put('/:id/role', async (req: any, res) => {
  const { id } = req.params;
  const { role } = req.body;

  const user = await prisma.user.update({
    where: { id },
    data: { role }
  });

  res.json(user);
});

// DELETE user (deactivate)
router.delete('/:id', async (req: any, res) => {
  const { id } = req.params;

  await prisma.user.update({
    where: { id },
    data: { isActive: false }
  });

  res.status(204).send();
});

export default router;