import express from 'express';
import cors from 'cors';
import cron from 'node-cron';
import { initializeDatabase, seedDatabase, run, all } from './database/db.js';

// Import routes
import peopleRoutes from './routes/people.js';
import choresRoutes from './routes/chores.js';
import prizesRoutes from './routes/prizes.js';
import transactionsRoutes from './routes/transactions.js';

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Request logging
app.use((req, res, next) => {
  console.log(`${req.method} ${req.path}`);
  next();
});

// Routes
app.use('/api/people', peopleRoutes);
app.use('/api/chores', choresRoutes);
app.use('/api/prizes', prizesRoutes);
app.use('/api/transactions', transactionsRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Server is running' });
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    message: 'Family Chore Tracker API',
    version: '1.0.0',
    endpoints: {
      people: '/api/people',
      chores: '/api/chores',
      prizes: '/api/prizes',
      transactions: '/api/transactions'
    }
  });
});

/**
 * Reset chores based on their frequency
 * - Daily chores reset every day at midnight
 * - Weekly chores reset every Monday at midnight
 * - Monthly chores reset on the 1st of each month at midnight
 */
async function resetChores() {
  try {
    const now = new Date();
    const today = now.toISOString().split('T')[0];
    const dayOfWeek = now.getDay(); // 0 = Sunday, 1 = Monday, etc.
    const dayOfMonth = now.getDate();

    console.log('Running chore reset check...');

    // Get all completed chores
    const completedChores = await all('SELECT * FROM chores WHERE completed = 1');

    for (const chore of completedChores) {
      let shouldReset = false;

      if (chore.last_completed_at) {
        const lastCompleted = new Date(chore.last_completed_at);
        const lastCompletedDate = lastCompleted.toISOString().split('T')[0];

        // Daily: Reset if last completed on a different day
        if (chore.frequency === 'daily' && lastCompletedDate !== today) {
          shouldReset = true;
        }

        // Weekly: Reset if it's Monday and last completed was in a previous week
        if (chore.frequency === 'weekly' && dayOfWeek === 1) {
          const daysSinceCompleted = Math.floor((now - lastCompleted) / (1000 * 60 * 60 * 24));
          if (daysSinceCompleted >= 1) {
            shouldReset = true;
          }
        }

        // Monthly: Reset if it's the 1st and last completed was in a previous month
        if (chore.frequency === 'monthly' && dayOfMonth === 1) {
          if (lastCompleted.getMonth() !== now.getMonth() || lastCompleted.getFullYear() !== now.getFullYear()) {
            shouldReset = true;
          }
        }

        if (shouldReset) {
          await run('UPDATE chores SET completed = 0 WHERE id = ?', [chore.id]);
          console.log(`Reset chore: ${chore.title} (${chore.frequency})`);
        }
      }
    }
  } catch (error) {
    console.error('Error resetting chores:', error);
  }
}

/**
 * Schedule automatic chore resets
 * Runs every day at midnight
 */
function scheduleChoreResets() {
  // Run at midnight every day (0 0 * * *)
  cron.schedule('0 0 * * *', () => {
    console.log('Scheduled chore reset triggered');
    resetChores();
  });

  console.log('Chore reset scheduler initialized (runs daily at midnight)');
}

/**
 * Initialize server
 */
async function startServer() {
  try {
    console.log('Initializing database...');
    await initializeDatabase();

    console.log('Seeding database...');
    await seedDatabase();

    // Run initial chore reset check on startup
    console.log('Running initial chore reset check...');
    await resetChores();

    // Schedule automatic resets
    scheduleChoreResets();

    // Start server
    app.listen(PORT, () => {
      console.log(`\n🚀 Server running on port ${PORT}`);
      console.log(`   Health check: http://localhost:${PORT}/api/health`);
      console.log(`   API endpoints: http://localhost:${PORT}/api`);
      console.log(`\n   People:       http://localhost:${PORT}/api/people`);
      console.log(`   Chores:       http://localhost:${PORT}/api/chores`);
      console.log(`   Prizes:       http://localhost:${PORT}/api/prizes`);
      console.log(`   Transactions: http://localhost:${PORT}/api/transactions`);
      console.log(`\nPress Ctrl+C to stop the server\n`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

// Start the server
startServer();
