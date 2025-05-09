import rateLimit from 'express-rate-limit';
import express from 'express';
import helmet from 'helmet';
import path from 'path';

import authRoutes from './routes/authRoutes.js';
import userRouter from './routes/userRoutes.js';
import doctorRouter from './routes/doctorRoutes.js';
import articleRouter from './routes/articleRoutes.js';
import globalErrorHandler from './controllers/errorController.js';
import AppError from './utils/appError.js';

const __dirname = path.dirname(new URL(import.meta.url).pathname);
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

app.use(express.static(`${__dirname}/public`));

app.use('/api/v0/admin/auth', authRoutes);
app.use('/api/v0/admin/users', userRouter);
app.use('/api/v0/admin/doctors', doctorRouter);
app.use('/api/v0/admin/articles', articleRouter);

app.all('*', (req, res, next) => {
  next(
    new AppError(
      `Não é possível encontrar ${req.originalUrl} neste servidor`,
      404,
    ),
  );
});

app.use(globalErrorHandler);

export default app;
