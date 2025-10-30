import express from 'express';
import {
  getAllChores,
  getChoreById,
  createChore,
  updateChore,
  deleteChore,
  completeChore,
  uncompleteChore
} from '../controllers/choresController.js';

const router = express.Router();

router.get('/', getAllChores);
router.get('/:id', getChoreById);
router.post('/', createChore);
router.put('/:id', updateChore);
router.delete('/:id', deleteChore);
router.post('/:id/complete', completeChore);
router.post('/:id/uncomplete', uncompleteChore);

export default router;
