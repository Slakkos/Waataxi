import { Router } from 'express';
import * as rideController from '../app/controllers/rideController';

const router = Router();

// 🛠 Création de ride
router.post('/create', rideController.createRide);

// 🔍 Obtenir toutes les rides en attente
router.get('/pending', rideController.getPendingRides);

// ✅ Compléter une ride
router.post('/complete/:rideId', rideController.completeRide);

// 👨‍✈️ Assigner un chauffeur
router.post('/assign', rideController.assignDriver);

// ❌ Annuler une ride (par passager ou admin)
router.post('/cancel', rideController.cancelRide);

// 🚫 Rejet d’une ride par un chauffeur
router.post('/reject', rideController.rejectRide);

// 🔍 Détail d’une ride par ID
router.get('/:rideId', rideController.getRideById);

// 📚 Historique d'un utilisateur
router.get('/user/:userId', rideController.getRidesByUser);
// 📚 Historique d'un driver
router.get('/driver/:driverId', rideController.getRidesByDriver);
// 📚 Historique d'un passager
router.get('/passenger/:passengerId', rideController.getRidesByPassenger);

// 🏷️ Rides par statut
router.get('/status/:status', rideController.getRidesByStatus);

export default router;
