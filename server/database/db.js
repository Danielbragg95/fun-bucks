import sqlite3 from 'sqlite3';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const dbPath = join(__dirname, '../../database/chores.db');

// Create database connection
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Error connecting to database:', err.message);
  } else {
    console.log('Connected to SQLite database at:', dbPath);
  }
});

// Enable foreign keys
db.run('PRAGMA foreign_keys = ON');

/**
 * Run a query that modifies the database (INSERT, UPDATE, DELETE)
 * @param {string} sql - SQL query
 * @param {Array} params - Query parameters
 * @returns {Promise} - Resolves with this context containing lastID and changes
 */
export const run = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function(err) {
      if (err) {
        reject(err);
      } else {
        resolve(this);
      }
    });
  });
};

/**
 * Get a single row from the database
 * @param {string} sql - SQL query
 * @param {Array} params - Query parameters
 * @returns {Promise} - Resolves with the row
 */
export const get = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    db.get(sql, params, (err, row) => {
      if (err) {
        reject(err);
      } else {
        resolve(row);
      }
    });
  });
};

/**
 * Get all rows from the database
 * @param {string} sql - SQL query
 * @param {Array} params - Query parameters
 * @returns {Promise} - Resolves with array of rows
 */
export const all = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
      if (err) {
        reject(err);
      } else {
        resolve(rows);
      }
    });
  });
};

/**
 * Initialize database schema
 */
export const initializeDatabase = async () => {
  const schemaPath = join(__dirname, 'schema.sql');
  const schema = fs.readFileSync(schemaPath, 'utf8');

  return new Promise((resolve, reject) => {
    db.exec(schema, (err) => {
      if (err) {
        reject(err);
      } else {
        console.log('Database schema initialized');
        resolve();
      }
    });
  });
};

/**
 * Seed the database with initial data
 */
export const seedDatabase = async () => {
  try {
    // Check if data already exists
    const existingPeople = await all('SELECT COUNT(*) as count FROM people');
    if (existingPeople[0].count > 0) {
      console.log('Database already seeded, skipping...');
      return;
    }

    console.log('Seeding database...');

    // Add people
    await run(
      'INSERT INTO people (name, type, avatar, color, fun_bucks) VALUES (?, ?, ?, ?, ?)',
      ['Emma', 'kid', '👧', 'pink', 25]
    );
    await run(
      'INSERT INTO people (name, type, avatar, color, fun_bucks) VALUES (?, ?, ?, ?, ?)',
      ['Lucas', 'kid', '👦', 'blue', 15]
    );

    // Get Emma and Lucas IDs
    const emma = await get('SELECT id FROM people WHERE name = ?', ['Emma']);
    const lucas = await get('SELECT id FROM people WHERE name = ?', ['Lucas']);

    // Add chores
    await run(
      'INSERT INTO chores (title, assigned_to, fun_bucks_reward, frequency) VALUES (?, ?, ?, ?)',
      ['Make your bed', emma.id, 2, 'daily']
    );
    await run(
      'INSERT INTO chores (title, assigned_to, fun_bucks_reward, frequency) VALUES (?, ?, ?, ?)',
      ['Feed the dog', lucas.id, 3, 'daily']
    );
    await run(
      'INSERT INTO chores (title, assigned_to, fun_bucks_reward, frequency) VALUES (?, ?, ?, ?)',
      ['Take out trash', emma.id, 5, 'weekly']
    );
    await run(
      'INSERT INTO chores (title, assigned_to, fun_bucks_reward, frequency) VALUES (?, ?, ?, ?)',
      ['Clean your room', lucas.id, 10, 'weekly']
    );

    // Add prizes
    await run(
      'INSERT INTO prizes (name, cost, emoji) VALUES (?, ?, ?)',
      ['Extra screen time 30 min', 20, '📱']
    );
    await run(
      'INSERT INTO prizes (name, cost, emoji) VALUES (?, ?, ?)',
      ['Pick dinner', 30, '🍕']
    );
    await run(
      'INSERT INTO prizes (name, cost, emoji) VALUES (?, ?, ?)',
      ['Stay up late', 40, '🌙']
    );
    await run(
      'INSERT INTO prizes (name, cost, emoji) VALUES (?, ?, ?)',
      ['Special treat', 50, '🍦']
    );
    await run(
      'INSERT INTO prizes (name, cost, emoji) VALUES (?, ?, ?)',
      ['Movie night pick', 60, '🎬']
    );

    console.log('Database seeded successfully');
  } catch (error) {
    console.error('Error seeding database:', error);
    throw error;
  }
};

export default db;
