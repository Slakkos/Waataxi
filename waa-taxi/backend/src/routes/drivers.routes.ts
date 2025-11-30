import { Router } from 'express';
import { createDriver, getAllDrivers, getNearbyDrivers, updateDriverLocation, getDriverLocation } from '../app/controllers/driverController';

const router = Router();

router.post('/', createDriver);
router.get('/', getAllDrivers);
router.get('/nearby', getNearbyDrivers);
router.patch('/:id/location', updateDriverLocation);
router.get('/:id/location', getDriverLocation);

export default router;
