import 'reflect-metadata';
import dotenv from 'dotenv';
dotenv.config(); // ✅ Charger les variables dès le début

import express, { Request, Response } from 'express';
import cors from 'cors';

import { AppDataSource } from './config/data-source';
import { env } from './config/env';

import usersRoutes from './routes/users.routes';
import ridesRoutes from './routes/rides.routes';
import passengersRoutes from './routes/passengers.routes';
import driverRoutes from './routes/drivers.routes';
import authRoutes from './routes/auth.routes';
import chatRoutes from './routes/chat.routes';

import { errorHandler } from './app/middlewares/errorHandler';
import http from 'http';
import { initChatSocket } from './chat/socket';

const app = express();
const PORT = parseInt(env.PORT, 10);
const server = http.createServer(app);

// 🛡️ Middlewares
app.use(cors());
app.use(express.json());

// 📦 Routes principales
app.get('/', (_: Request, res: Response) => {
    res.send('🚀 WAA TAXI backend is running!');
});

app.use('/api/auth', authRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/rides', ridesRoutes);
app.use('/api/passengers', passengersRoutes);
app.use('/api/drivers', driverRoutes);
app.use('/api/chat', chatRoutes);

// ✅ Route de test (accessible depuis PC ou téléphone)
app.get('/api/ping', (_: Request, res: Response) => {
    res.json({ ok: true, message: 'Backend WAA TAXI connecté ✅' });
});

// 🧯 Gestion d'erreurs globales
app.use(errorHandler);

// 🚀 Démarrage de l'app
AppDataSource.initialize()
    .then(() => {
        console.log('✅ Database connected');
        initChatSocket(server);
        server.listen(PORT, () => {
            console.log(`🚀 Server listening on port ${PORT}`);
        });
    })
    .catch((err: unknown) => {
        const msg = err instanceof Error ? err.message : String(err);
        console.error('❌ Database connection failed:', msg);
        console.error(err);
        process.exit(1);
    });
