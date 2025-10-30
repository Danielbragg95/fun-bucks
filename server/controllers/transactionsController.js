import { all } from '../database/db.js';

/**
 * Get transaction history for a person
 */
export const getTransactionsByPerson = async (req, res) => {
  try {
    const { personId } = req.params;

    const transactions = await all(`
      SELECT
        transactions.*,
        chores.title as chore_title,
        prizes.name as prize_name
      FROM transactions
      LEFT JOIN chores ON transactions.chore_id = chores.id
      LEFT JOIN prizes ON transactions.prize_id = prizes.id
      WHERE transactions.person_id = ?
      ORDER BY transactions.created_at DESC
    `, [personId]);

    res.json(transactions);
  } catch (error) {
    console.error('Error fetching transactions:', error);
    res.status(500).json({ error: 'Failed to fetch transactions' });
  }
};

/**
 * Get all transactions (optional - for admin view)
 */
export const getAllTransactions = async (req, res) => {
  try {
    const transactions = await all(`
      SELECT
        transactions.*,
        people.name as person_name,
        people.avatar as person_avatar,
        chores.title as chore_title,
        prizes.name as prize_name
      FROM transactions
      LEFT JOIN people ON transactions.person_id = people.id
      LEFT JOIN chores ON transactions.chore_id = chores.id
      LEFT JOIN prizes ON transactions.prize_id = prizes.id
      ORDER BY transactions.created_at DESC
    `);

    res.json(transactions);
  } catch (error) {
    console.error('Error fetching all transactions:', error);
    res.status(500).json({ error: 'Failed to fetch transactions' });
  }
};
