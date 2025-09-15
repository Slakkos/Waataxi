import { Router } from 'express';
import {
    createUserHandler,
    getAllUsersHandler,
    getUserByIdHandler,
    getUserByPhoneHandler,
} from '../app/controllers/userController';

const router = Router();

router.post('/', createUserHandler);
router.get('/', getAllUsersHandler);
router.get('/id/:id', getUserByIdHandler);
router.get('/phone/:phone', getUserByPhoneHandler);

export default router;
