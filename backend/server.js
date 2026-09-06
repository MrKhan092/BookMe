import express from 'express';
import cors from 'cors';
import 'dotenv/config';
import http from 'http';
import { connectDB } from './config/db.js';
import authRoutes from './routes/authRouter.js';
import serviceRoutes from './routes/serviceRoutes.js';
import availabilityRoutes from './routes/availabilityRoutes.js';
import integrationRoutes from './routes/integrationRoutes.js';


const PORT=process.env.PORT || 5000;
const app = express();
app.use(cors());
app.use(express.json());

connectDB();


app.get('/', (req, res) => {
    res.send('Hello World!');
});

app.use('/api/auth', authRoutes);
app.use('/api/services',serviceRoutes); 
app.use('/api/availability',availabilityRoutes )
app.use('/api/integration',integrationRoutes)
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