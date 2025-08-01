import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { checkPermission } from '../middleware/rbac';

const router = Router();
const prisma = new PrismaClient();

// GET expense summary report
router.get('/expenses/summary', checkPermission('reports', 'read'), async (req: any, res) => {
  const { organizationId } = req.user;
  const { startDate, endDate, vehicleId } = req.query;

  const where: any = {
    vehicle: { organizationId }
  };

  if (startDate && endDate) {
    where.date = {
      gte: new Date(startDate as string),
      lte: new Date(endDate as string)
    };
  }

  if (vehicleId) {
    where.vehicleId = vehicleId;
  }

  const expenses = await prisma.expense.groupBy({
    by: ['category'],
    where,
    _sum: {
      amount: true
    },
    _count: true
  });

  const total = await prisma.expense.aggregate({
    where,
    _sum: {
      amount: true
    }
  });

  res.json({
    categories: expenses,
    total: total._sum.amount || 0
  });
});

// GET vehicle utilization report
router.get('/vehicles/utilization', checkPermission('reports', 'read'), async (req: any, res) => {
  const { organizationId } = req.user;

  const vehicles = await prisma.vehicle.findMany({
    where: { organizationId },
    include: {
      assignments: {
        where: {
          assignedDate: {
            gte: new Date(new Date().setDate(new Date().getDate() - 30))
          }
        }
      },
      expenses: {
        where: {
          date: {
            gte: new Date(new Date().setDate(new Date().getDate() - 30))
          }
        }
      }
    }
  });

  const report = vehicles.map(vehicle => ({
    id: vehicle.id,
    plateNumber: vehicle.plateNumber,
    make: vehicle.make,
    model: vehicle.model,
    assignmentDays: vehicle.assignments.length,
    totalExpenses: vehicle.expenses.reduce((sum, exp) => sum + Number(exp.amount), 0),
    mileage: vehicle.mileage
  }));

  res.json(report);
});

export default router;