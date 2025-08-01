import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { checkPermission } from '../middleware/rbac';
import { z } from 'zod';

const router = Router();
const prisma = new PrismaClient();

const createExpenseSchema = z.object({
  vehicleId: z.string().uuid(),
  category: z.enum(['FUEL', 'MAINTENANCE', 'INSURANCE', 'REGISTRATION', 'PARKING', 'TOLLS', 'FINES', 'OTHER']),
  amount: z.number().positive(),
  date: z.string(),
  description: z.string().optional(),
  odometer: z.number().int().positive().optional(),
  supplier: z.string().optional()
});

// GET all expenses
router.get('/', checkPermission('expenses', 'read'), async (req: any, res) => {
  const { organizationId, checkOwnership } = req.user;
  
  const where: any = {
    vehicle: { organizationId }
  };

  if (checkOwnership) {
    const assignments = await prisma.vehicleAssignment.findMany({
      where: {
        userId: req.user.id,
        isActive: true
      },
      select: { vehicleId: true }
    });
    
    where.vehicleId = { in: assignments.map(a => a.vehicleId) };
  }

  const expenses = await prisma.expense.findMany({
    where,
    include: {
      vehicle: true,
      createdBy: true
    },
    orderBy: { date: 'desc' }
  });

  res.json(expenses);
});

// CREATE expense
router.post('/', checkPermission('expenses', 'create'), async (req: any, res) => {
  const validatedData = createExpenseSchema.parse(req.body);

  const expense = await prisma.expense.create({
    data: {
      ...validatedData,
      date: new Date(validatedData.date),
      createdById: req.user.id
    },
    include: {
      vehicle: true
    }
  });

  res.status(201).json(expense);
});

export default router;