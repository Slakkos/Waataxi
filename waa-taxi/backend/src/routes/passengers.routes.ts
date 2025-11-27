import { Router } from 'express';
import * as passengerController from '../app/controllers/passengerController';

const router = Router();

router.post('/', passengerController.createPassenger);
router.get('/', passengerController.getAllPassengers);
router.get('/:id', passengerController.getPassengerById);
router.patch('/:id', passengerController.updatePassengerProfile);

export default router;
