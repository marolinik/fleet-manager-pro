import { Router } from 'express';
import vehicleRoutes from './vehicleRoutes';
import userRoutes from './userRoutes';
import expenseRoutes from './expenseRoutes';
import documentRoutes from './documentRoutes';
import reportRoutes from './reportRoutes';
import driverRoutes from './driverRoutes';
import { checkRole } from '../middleware/rbac';

const router = Router();

// Apply global middleware for authenticated users
router.use('/vehicles', vehicleRoutes);
router.use('/users', checkRole(['ADMIN']), userRoutes);
router.use('/expenses', expenseRoutes);
router.use('/documents', documentRoutes);
router.use('/reports', reportRoutes);
router.use('/drivers', driverRoutes);

export default router;