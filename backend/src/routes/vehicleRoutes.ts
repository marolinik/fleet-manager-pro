import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { checkPermission } from '../middleware/rbac';
import { AppError } from '../middleware/errorHandler';
import { z } from 'zod';

const router = Router();
const prisma = new PrismaClient();

// Validation schemas
const createVehicleSchema = z.object({
  vin: z.string().length(17),
  plateNumber: z.string().min(1),
  make: z.string().min(1),
  model: z.string().min(1),
  year: z.number().int().min(1900).max(new Date().getFullYear() + 1),
  mileage: z.number().int().min(0),
  fuelType: z.string().min(1),
  color: z.string().optional(),
  ownershipType: z.enum(['OWNED', 'LEASED', 'RENTED']),
  purchaseDate: z.string().optional(),
  purchasePrice: z.number().optional()
});

// GET all vehicles
router.get('/', checkPermission('vehicles', 'read'), async (req: any, res) => {
  const { organizationId, checkOwnership } = req.user;
  
  const where: any = { organizationId };
  
  if (checkOwnership) {
    // For drivers/owners, show only assigned vehicles
    const assignments = await prisma.vehicleAssignment.findMany({
      where: {
        userId: req.user.id,
        isActive: true
      },
      select: { vehicleId: true }
    });
    
    where.id = { in: assignments.map(a => a.vehicleId) };
  }

  const vehicles = await prisma.vehicle.findMany({
    where,
    include: {
      assignments: {
        where: { isActive: true },
        include: {
          driver: {
            include: { user: true }
          }
        }
      },
      leaseContract: true,
      insurancePolicies: {
        where: {
          endDate: { gte: new Date() }
        },
        orderBy: { endDate: 'desc' },
        take: 1
      },
      _count: {
        select: {
          expenses: true,
          documents: true,
          maintenanceRecords: true
        }
      }
    }
  });

  res.json(vehicles);
});

// GET single vehicle
router.get('/:id', checkPermission('vehicles', 'read'), async (req: any, res) => {
  const { id } = req.params;
  const { organizationId, checkOwnership } = req.user;

  const vehicle = await prisma.vehicle.findFirst({
    where: {
      id,
      organizationId
    },
    include: {
      assignments: {
        include: {
          driver: {
            include: { user: true }
          }
        },
        orderBy: { assignedDate: 'desc' }
      },
      expenses: {
        orderBy: { date: 'desc' },
        take: 10
      },
      documents: true,
      maintenanceRecords: {
        orderBy: { performedDate: 'desc' }
      },
      leaseContract: true,
      insurancePolicies: true,
      fuelCards: true
    }
  });

  if (!vehicle) {
    throw new AppError('Vehicle not found', 404);
  }

  if (checkOwnership) {
    const isAssigned = vehicle.assignments.some(
      a => a.userId === req.user.id && a.isActive
    );
    if (!isAssigned) {
      throw new AppError('Access denied', 403);
    }
  }

  res.json(vehicle);
});

// CREATE vehicle
router.post('/', checkPermission('vehicles', 'create'), async (req: any, res) => {
  const validatedData = createVehicleSchema.parse(req.body);
  const { organizationId } = req.user;

  const vehicle = await prisma.vehicle.create({
    data: {
      ...validatedData,
      organizationId,
      purchaseDate: validatedData.purchaseDate 
        ? new Date(validatedData.purchaseDate) 
        : undefined
    }
  });

  // Log activity
  await prisma.activityLog.create({
    data: {
      userId: req.user.id,
      action: 'created',
      entity: 'vehicle',
      entityId: vehicle.id,
      details: { plateNumber: vehicle.plateNumber }
    }
  });

  res.status(201).json(vehicle);
});

// UPDATE vehicle
router.put('/:id', checkPermission('vehicles', 'update'), async (req: any, res) => {
  const { id } = req.params;
  const { organizationId } = req.user;

  const existing = await prisma.vehicle.findFirst({
    where: { id, organizationId }
  });

  if (!existing) {
    throw new AppError('Vehicle not found', 404);
  }

  const vehicle = await prisma.vehicle.update({
    where: { id },
    data: req.body
  });

  await prisma.activityLog.create({
    data: {
      userId: req.user.id,
      action: 'updated',
      entity: 'vehicle',
      entityId: vehicle.id,
      details: { changes: req.body }
    }
  });

  res.json(vehicle);
});

// DELETE vehicle
router.delete('/:id', checkPermission('vehicles', 'delete'), async (req: any, res) => {
  const { id } = req.params;
  const { organizationId } = req.user;

  const existing = await prisma.vehicle.findFirst({
    where: { id, organizationId }
  });

  if (!existing) {
    throw new AppError('Vehicle not found', 404);
  }

  // Soft delete - just change status
  await prisma.vehicle.update({
    where: { id },
    data: { status: 'SOLD' }
  });

  await prisma.activityLog.create({
    data: {
      userId: req.user.id,
      action: 'deleted',
      entity: 'vehicle',
      entityId: id
    }
  });

  res.status(204).send();
});

// ASSIGN vehicle to driver
router.post('/:id/assign', checkPermission('vehicles', 'update'), async (req: any, res) => {
  const { id } = req.params;
  const { driverId, notes } = req.body;

  // End current assignment
  await prisma.vehicleAssignment.updateMany({
    where: {
      vehicleId: id,
      isActive: true
    },
    data: {
      isActive: false,
      returnedDate: new Date()
    }
  });

  // Create new assignment
  const assignment = await prisma.vehicleAssignment.create({
    data: {
      vehicleId: id,
      driverId,
      userId: req.user.id,
      notes
    },
    include: {
      driver: {
        include: { user: true }
      }
    }
  });

  res.json(assignment);
});

export default router;