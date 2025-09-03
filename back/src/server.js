import db from './config/db.js';
import app from './app.js'; 

const PORT = process.env.PORT || 3000;

async function startServer() {
  try {
    await db.$connect();
    console.log('Database connected successfully');

    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Error connecting to the database', error);
    process.exit(1);
  }
}

startServer();

// Graceful shutdown
const shutdown = async () => {
  try {
    await db.$disconnect();
  } finally {
    process.exit(0);
  }
};

process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);
