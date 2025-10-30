import { run, get, all } from '../database/db.js';

/**
 * Get all chores with person information
 */
export const getAllChores = async (req, res) => {
  try {
    const chores = await all(`
      SELECT
        chores.*,
        people.name as assigned_name,
        people.avatar as assigned_avatar,
        people.color as assigned_color
      FROM chores
      LEFT JOIN people ON chores.assigned_to = people.id
      ORDER BY chores.created_at DESC
    `);
    res.json(chores);
  } catch (error) {
    console.error('Error fetching chores:', error);
    res.status(500).json({ error: 'Failed to fetch chores' });
  }
};

/**
 * Get a single chore by ID
 */
export const getChoreById = async (req, res) => {
  try {
    const { id } = req.params;
    const chore = await get(`
      SELECT
        chores.*,
        people.name as assigned_name,
        people.avatar as assigned_avatar,
        people.color as assigned_color
      FROM chores
      LEFT JOIN people ON chores.assigned_to = people.id
      WHERE chores.id = ?
    `, [id]);

    if (!chore) {
      return res.status(404).json({ error: 'Chore not found' });
    }

    res.json(chore);
  } catch (error) {
    console.error('Error fetching chore:', error);
    res.status(500).json({ error: 'Failed to fetch chore' });
  }
};

/**
 * Create a new chore
 */
export const createChore = async (req, res) => {
  try {
    const { title, assigned_to, fun_bucks_reward, frequency } = req.body;

    // Validation
    if (!title || !assigned_to || fun_bucks_reward === undefined || !frequency) {
      return res.status(400).json({
        error: 'Missing required fields: title, assigned_to, fun_bucks_reward, frequency'
      });
    }

    if (!['daily', 'weekly', 'monthly'].includes(frequency)) {
      return res.status(400).json({
        error: 'Frequency must be "daily", "weekly", or "monthly"'
      });
    }

    if (fun_bucks_reward < 0) {
      return res.status(400).json({ error: 'Fun Bucks reward cannot be negative' });
    }

    // Check if assigned person exists
    const person = await get('SELECT * FROM people WHERE id = ?', [assigned_to]);
    if (!person) {
      return res.status(404).json({ error: 'Assigned person not found' });
    }

    const result = await run(
      'INSERT INTO chores (title, assigned_to, fun_bucks_reward, frequency) VALUES (?, ?, ?, ?)',
      [title, assigned_to, fun_bucks_reward, frequency]
    );

    const newChore = await get(`
      SELECT
        chores.*,
        people.name as assigned_name,
        people.avatar as assigned_avatar,
        people.color as assigned_color
      FROM chores
      LEFT JOIN people ON chores.assigned_to = people.id
      WHERE chores.id = ?
    `, [result.lastID]);

    res.status(201).json(newChore);
  } catch (error) {
    console.error('Error creating chore:', error);
    res.status(500).json({ error: 'Failed to create chore' });
  }
};

/**
 * Update a chore
 */
export const updateChore = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, assigned_to, fun_bucks_reward, frequency } = req.body;

    // Check if chore exists
    const existingChore = await get('SELECT * FROM chores WHERE id = ?', [id]);
    if (!existingChore) {
      return res.status(404).json({ error: 'Chore not found' });
    }

    // Validation
    if (frequency && !['daily', 'weekly', 'monthly'].includes(frequency)) {
      return res.status(400).json({
        error: 'Frequency must be "daily", "weekly", or "monthly"'
      });
    }

    if (fun_bucks_reward !== undefined && fun_bucks_reward < 0) {
      return res.status(400).json({ error: 'Fun Bucks reward cannot be negative' });
    }

    if (assigned_to) {
      const person = await get('SELECT * FROM people WHERE id = ?', [assigned_to]);
      if (!person) {
        return res.status(404).json({ error: 'Assigned person not found' });
      }
    }

    // Build update query dynamically
    const updates = [];
    const params = [];

    if (title !== undefined) {
      updates.push('title = ?');
      params.push(title);
    }
    if (assigned_to !== undefined) {
      updates.push('assigned_to = ?');
      params.push(assigned_to);
    }
    if (fun_bucks_reward !== undefined) {
      updates.push('fun_bucks_reward = ?');
      params.push(fun_bucks_reward);
    }
    if (frequency !== undefined) {
      updates.push('frequency = ?');
      params.push(frequency);
    }

    if (updates.length === 0) {
      return res.status(400).json({ error: 'No fields to update' });
    }

    params.push(id);

    await run(
      `UPDATE chores SET ${updates.join(', ')} WHERE id = ?`,
      params
    );

    const updatedChore = await get(`
      SELECT
        chores.*,
        people.name as assigned_name,
        people.avatar as assigned_avatar,
        people.color as assigned_color
      FROM chores
      LEFT JOIN people ON chores.assigned_to = people.id
      WHERE chores.id = ?
    `, [id]);

    res.json(updatedChore);
  } catch (error) {
    console.error('Error updating chore:', error);
    res.status(500).json({ error: 'Failed to update chore' });
  }
};

/**
 * Delete a chore
 */
export const deleteChore = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if chore exists
    const existingChore = await get('SELECT * FROM chores WHERE id = ?', [id]);
    if (!existingChore) {
      return res.status(404).json({ error: 'Chore not found' });
    }

    await run('DELETE FROM chores WHERE id = ?', [id]);
    res.json({ message: 'Chore deleted successfully' });
  } catch (error) {
    console.error('Error deleting chore:', error);
    res.status(500).json({ error: 'Failed to delete chore' });
  }
};

/**
 * Mark chore as complete and award Fun Bucks
 */
export const completeChore = async (req, res) => {
  try {
    const { id } = req.params;

    // Get chore details
    const chore = await get('SELECT * FROM chores WHERE id = ?', [id]);
    if (!chore) {
      return res.status(404).json({ error: 'Chore not found' });
    }

    // Check if already completed
    if (chore.completed) {
      return res.status(400).json({ error: 'Chore is already completed' });
    }

    // Get person details
    const person = await get('SELECT * FROM people WHERE id = ?', [chore.assigned_to]);
    if (!person) {
      return res.status(404).json({ error: 'Assigned person not found' });
    }

    const now = new Date().toISOString();

    // Mark chore as complete
    await run(
      'UPDATE chores SET completed = 1, last_completed_at = ? WHERE id = ?',
      [now, id]
    );

    // Award Fun Bucks if person is a kid
    if (person.type === 'kid') {
      await run(
        'UPDATE people SET fun_bucks = fun_bucks + ? WHERE id = ?',
        [chore.fun_bucks_reward, person.id]
      );

      // Record transaction
      await run(
        'INSERT INTO transactions (person_id, type, amount, description, chore_id) VALUES (?, ?, ?, ?, ?)',
        [person.id, 'earned', chore.fun_bucks_reward, `Completed: ${chore.title}`, id]
      );
    }

    // Get updated chore
    const updatedChore = await get(`
      SELECT
        chores.*,
        people.name as assigned_name,
        people.avatar as assigned_avatar,
        people.color as assigned_color,
        people.fun_bucks as assigned_fun_bucks
      FROM chores
      LEFT JOIN people ON chores.assigned_to = people.id
      WHERE chores.id = ?
    `, [id]);

    res.json(updatedChore);
  } catch (error) {
    console.error('Error completing chore:', error);
    res.status(500).json({ error: 'Failed to complete chore' });
  }
};

/**
 * Mark chore as incomplete and remove Fun Bucks
 */
export const uncompleteChore = async (req, res) => {
  try {
    const { id } = req.params;

    // Get chore details
    const chore = await get('SELECT * FROM chores WHERE id = ?', [id]);
    if (!chore) {
      return res.status(404).json({ error: 'Chore not found' });
    }

    // Check if already incomplete
    if (!chore.completed) {
      return res.status(400).json({ error: 'Chore is already incomplete' });
    }

    // Get person details
    const person = await get('SELECT * FROM people WHERE id = ?', [chore.assigned_to]);
    if (!person) {
      return res.status(404).json({ error: 'Assigned person not found' });
    }

    // Mark chore as incomplete
    await run(
      'UPDATE chores SET completed = 0 WHERE id = ?',
      [id]
    );

    // Remove Fun Bucks if person is a kid
    if (person.type === 'kid') {
      await run(
        'UPDATE people SET fun_bucks = fun_bucks - ? WHERE id = ?',
        [chore.fun_bucks_reward, person.id]
      );

      // Delete the transaction
      await run(
        'DELETE FROM transactions WHERE chore_id = ? AND person_id = ? AND type = ?',
        [id, person.id, 'earned']
      );
    }

    // Get updated chore
    const updatedChore = await get(`
      SELECT
        chores.*,
        people.name as assigned_name,
        people.avatar as assigned_avatar,
        people.color as assigned_color,
        people.fun_bucks as assigned_fun_bucks
      FROM chores
      LEFT JOIN people ON chores.assigned_to = people.id
      WHERE chores.id = ?
    `, [id]);

    res.json(updatedChore);
  } catch (error) {
    console.error('Error uncompleting chore:', error);
    res.status(500).json({ error: 'Failed to uncomplete chore' });
  }
};
