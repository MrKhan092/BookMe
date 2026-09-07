import express from 'express';
import cors from 'cors';
import 'dotenv/config';
import http from 'http';
import { connectDB } from './config/db.js';
import authRoutes from './routes/authRouter.js';
import adminRoute from './routes/adminRoute.js'
import serviceRoutes from './routes/serviceRoutes.js';
import availabilityRoutes from './routes/availabilityRoutes.js';
import integrationRoutes from './routes/integrationRoutes.js';
import bookingRoutes from './routes/bookingRoutes.js';
import paymentRoutes from './routes/paymentRoutes.js';
import  publicRoutes from './routes/publicRoutes.js'
const PORT=process.env.PORT || 5000;
const app = express();
app.use(cors());
app.use(express.json());

connectDB();


app.get('/', (req, res) => {
    res.send('Hello World!');
});

app.use('/api/auth', authRoutes);
app.use('/api/admin',adminRoute)
app.use('/api/services',serviceRoutes); 
app.use('/api/availability',availabilityRoutes )
app.use('/api/integration',integrationRoutes)
app.use('/api/bookings',bookingRoutes);
app.use('/api/payments',paymentRoutes);
app.use('/api/public',publicRoutes);
app.use('/public',publicRoutes)

const server = http.createServer(app);
server.on('error', (err) => {
    if(err.code === 'EADDRINUSE') {
        console.error(`Port ${PORT} is already in use.`);
        process.exit(1);
    }
    throw err;
});
server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});