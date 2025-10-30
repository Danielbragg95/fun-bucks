import { run, get, all } from '../database/db.js';

/**
 * Get all people
 */
export const getAllPeople = async (req, res) => {
  try {
    const people = await all('SELECT * FROM people ORDER BY created_at ASC');
    res.json(people);
  } catch (error) {
    console.error('Error fetching people:', error);
    res.status(500).json({ error: 'Failed to fetch people' });
  }
};

/**
 * Get a single person by ID
 */
export const getPersonById = async (req, res) => {
  try {
    const { id } = req.params;
    const person = await get('SELECT * FROM people WHERE id = ?', [id]);

    if (!person) {
      return res.status(404).json({ error: 'Person not found' });
    }

    res.json(person);
  } catch (error) {
    console.error('Error fetching person:', error);
    res.status(500).json({ error: 'Failed to fetch person' });
  }
};

/**
 * Create a new person
 */
export const createPerson = async (req, res) => {
  try {
    const { name, type, avatar, color } = req.body;

    // Validation
    if (!name || !type || !avatar || !color) {
      return res.status(400).json({ error: 'Missing required fields: name, type, avatar, color' });
    }

    if (!['kid', 'parent'].includes(type)) {
      return res.status(400).json({ error: 'Type must be either "kid" or "parent"' });
    }

    const funBucks = type === 'kid' ? 0 : null;

    const result = await run(
      'INSERT INTO people (name, type, avatar, color, fun_bucks) VALUES (?, ?, ?, ?, ?)',
      [name, type, avatar, color, funBucks]
    );

    const newPerson = await get('SELECT * FROM people WHERE id = ?', [result.lastID]);
    res.status(201).json(newPerson);
  } catch (error) {
    console.error('Error creating person:', error);
    res.status(500).json({ error: 'Failed to create person' });
  }
};

/**
 * Update a person
 */
export const updatePerson = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, type, avatar, color } = req.body;

    // Check if person exists
    const existingPerson = await get('SELECT * FROM people WHERE id = ?', [id]);
    if (!existingPerson) {
      return res.status(404).json({ error: 'Person not found' });
    }

    // Validation
    if (type && !['kid', 'parent'].includes(type)) {
      return res.status(400).json({ error: 'Type must be either "kid" or "parent"' });
    }

    // Build update query dynamically
    const updates = [];
    const params = [];

    if (name !== undefined) {
      updates.push('name = ?');
      params.push(name);
    }
    if (type !== undefined) {
      updates.push('type = ?');
      params.push(type);
    }
    if (avatar !== undefined) {
      updates.push('avatar = ?');
      params.push(avatar);
    }
    if (color !== undefined) {
      updates.push('color = ?');
      params.push(color);
    }

    if (updates.length === 0) {
      return res.status(400).json({ error: 'No fields to update' });
    }

    params.push(id);

    await run(
      `UPDATE people SET ${updates.join(', ')} WHERE id = ?`,
      params
    );

    const updatedPerson = await get('SELECT * FROM people WHERE id = ?', [id]);
    res.json(updatedPerson);
  } catch (error) {
    console.error('Error updating person:', error);
    res.status(500).json({ error: 'Failed to update person' });
  }
};

/**
 * Delete a person
 */
export const deletePerson = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if person exists
    const existingPerson = await get('SELECT * FROM people WHERE id = ?', [id]);
    if (!existingPerson) {
      return res.status(404).json({ error: 'Person not found' });
    }

    await run('DELETE FROM people WHERE id = ?', [id]);
    res.json({ message: 'Person deleted successfully' });
  } catch (error) {
    console.error('Error deleting person:', error);
    res.status(500).json({ error: 'Failed to delete person' });
  }
};
