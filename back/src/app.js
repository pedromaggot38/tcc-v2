import rateLimit from 'express-rate-limit';
import express from 'express';
import helmet from 'helmet';

import authRoutes from './routes/authRoutes.js';
import userRouter from './routes/userRoutes.js';
import doctorRouter from './routes/doctorRoutes.js';
import articleRouter from './routes/articleRoutes.js';
import globalErrorHandler from './controllers/errorController.js';

const app = express();

app.use(helmet());
app.use(
  helmet.contentSecurityPolicy({
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'"],
      objectSrc: ["'none'"],
      upgradeInsecureRequests: [],
    },
  }),
);

const limiter = rateLimit({
  max: 100,
  windowMs: 60 * 60 * 1000,
  message: 'Too many requests from this ip. Please try again in an hour',
});
app.use('/api', limiter);

app.use(express.json({ limit: '10kb' }));

app.use('/api/v0/auth', authRoutes);
app.use('/api/v0/users', userRouter);
app.use('/api/v0/doctors', doctorRouter);
app.use('/api/v0/articles', articleRouter);

app.use(globalErrorHandler);

export default app;
