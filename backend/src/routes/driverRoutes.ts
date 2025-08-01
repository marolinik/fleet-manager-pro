import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { checkPermission } from '../middleware/rbac';

const router = Router();
const prisma = new PrismaClient();

// GET all drivers
router.get('/', checkPermission('drivers', 'read'), async (req: any, res) => {
  const { organizationId } = req.user;

  const drivers = await prisma.driver.findMany({
    where: {
      user: { organizationId }
    },
    include: {
      user: true,
      assignments: {
        where: { isActive: true },
        include: { vehicle: true }
      }
    }
  });

  res.json(drivers);
});

// GET driver by id
router.get('/:id', checkPermission('drivers', 'read'), async (req: any, res) => {
  const { id } = req.params;

  const driver = await prisma.driver.findUnique({
    where: { id },
    include: {
      user: true,
      assignments: {
        include: { vehicle: true },
        orderBy: { assignedDate: 'desc' }
      }
    }
  });

  if (!driver) {
    return res.status(404).json({ error: 'Driver not found' });
  }

  res.json(driver);
});

export default router;