import { run, get, all } from '../database/db.js';

/**
 * Get all prizes
 */
export const getAllPrizes = async (req, res) => {
  try {
    const prizes = await all('SELECT * FROM prizes ORDER BY cost ASC');
    res.json(prizes);
  } catch (error) {
    console.error('Error fetching prizes:', error);
    res.status(500).json({ error: 'Failed to fetch prizes' });
  }
};

/**
 * Get a single prize by ID
 */
export const getPrizeById = async (req, res) => {
  try {
    const { id } = req.params;
    const prize = await get('SELECT * FROM prizes WHERE id = ?', [id]);

    if (!prize) {
      return res.status(404).json({ error: 'Prize not found' });
    }

    res.json(prize);
  } catch (error) {
    console.error('Error fetching prize:', error);
    res.status(500).json({ error: 'Failed to fetch prize' });
  }
};

/**
 * Create a new prize
 */
export const createPrize = async (req, res) => {
  try {
    const { name, cost, emoji } = req.body;

    // Validation
    if (!name || cost === undefined || !emoji) {
      return res.status(400).json({
        error: 'Missing required fields: name, cost, emoji'
      });
    }

    if (cost < 0) {
      return res.status(400).json({ error: 'Cost cannot be negative' });
    }

    const result = await run(
      'INSERT INTO prizes (name, cost, emoji) VALUES (?, ?, ?)',
      [name, cost, emoji]
    );

    const newPrize = await get('SELECT * FROM prizes WHERE id = ?', [result.lastID]);
    res.status(201).json(newPrize);
  } catch (error) {
    console.error('Error creating prize:', error);
    res.status(500).json({ error: 'Failed to create prize' });
  }
};

/**
 * Update a prize
 */
export const updatePrize = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, cost, emoji } = req.body;

    // Check if prize exists
    const existingPrize = await get('SELECT * FROM prizes WHERE id = ?', [id]);
    if (!existingPrize) {
      return res.status(404).json({ error: 'Prize not found' });
    }

    // Validation
    if (cost !== undefined && cost < 0) {
      return res.status(400).json({ error: 'Cost cannot be negative' });
    }

    // Build update query dynamically
    const updates = [];
    const params = [];

    if (name !== undefined) {
      updates.push('name = ?');
      params.push(name);
    }
    if (cost !== undefined) {
      updates.push('cost = ?');
      params.push(cost);
    }
    if (emoji !== undefined) {
      updates.push('emoji = ?');
      params.push(emoji);
    }

    if (updates.length === 0) {
      return res.status(400).json({ error: 'No fields to update' });
    }

    params.push(id);

    await run(
      `UPDATE prizes SET ${updates.join(', ')} WHERE id = ?`,
      params
    );

    const updatedPrize = await get('SELECT * FROM prizes WHERE id = ?', [id]);
    res.json(updatedPrize);
  } catch (error) {
    console.error('Error updating prize:', error);
    res.status(500).json({ error: 'Failed to update prize' });
  }
};

/**
 * Delete a prize
 */
export const deletePrize = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if prize exists
    const existingPrize = await get('SELECT * FROM prizes WHERE id = ?', [id]);
    if (!existingPrize) {
      return res.status(404).json({ error: 'Prize not found' });
    }

    await run('DELETE FROM prizes WHERE id = ?', [id]);
    res.json({ message: 'Prize deleted successfully' });
  } catch (error) {
    console.error('Error deleting prize:', error);
    res.status(500).json({ error: 'Failed to delete prize' });
  }
};

/**
 * Redeem a prize for a person
 */
export const redeemPrize = async (req, res) => {
  try {
    const { id } = req.params;
    const { person_id } = req.body;

    // Validation
    if (!person_id) {
      return res.status(400).json({ error: 'person_id is required' });
    }

    // Get prize details
    const prize = await get('SELECT * FROM prizes WHERE id = ?', [id]);
    if (!prize) {
      return res.status(404).json({ error: 'Prize not found' });
    }

    // Get person details
    const person = await get('SELECT * FROM people WHERE id = ?', [person_id]);
    if (!person) {
      return res.status(404).json({ error: 'Person not found' });
    }

    // Check if person is a kid
    if (person.type !== 'kid') {
      return res.status(400).json({ error: 'Only kids can redeem prizes' });
    }

    // Check if person has enough Fun Bucks
    if (person.fun_bucks < prize.cost) {
      return res.status(400).json({
        error: 'Insufficient Fun Bucks',
        required: prize.cost,
        available: person.fun_bucks
      });
    }

    // Deduct Fun Bucks
    await run(
      'UPDATE people SET fun_bucks = fun_bucks - ? WHERE id = ?',
      [prize.cost, person_id]
    );

    // Record transaction
    await run(
      'INSERT INTO transactions (person_id, type, amount, description, prize_id) VALUES (?, ?, ?, ?, ?)',
      [person_id, 'spent', prize.cost, `Redeemed: ${prize.name}`, id]
    );

    // Get updated person
    const updatedPerson = await get('SELECT * FROM people WHERE id = ?', [person_id]);

    res.json({
      message: 'Prize redeemed successfully',
      prize,
      person: updatedPerson,
      new_balance: updatedPerson.fun_bucks
    });
  } catch (error) {
    console.error('Error redeeming prize:', error);
    res.status(500).json({ error: 'Failed to redeem prize' });
  }
};
