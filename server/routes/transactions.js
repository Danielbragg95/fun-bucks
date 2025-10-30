import express from 'express';
import {
  getTransactionsByPerson,
  getAllTransactions
} from '../controllers/transactionsController.js';

const router = express.Router();

router.get('/', getAllTransactions);
router.get('/:personId', getTransactionsByPerson);

export default router;
