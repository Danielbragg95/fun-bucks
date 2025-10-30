import express from 'express';
import {
  getAllPrizes,
  getPrizeById,
  createPrize,
  updatePrize,
  deletePrize,
  redeemPrize
} from '../controllers/prizesController.js';

const router = express.Router();

router.get('/', getAllPrizes);
router.get('/:id', getPrizeById);
router.post('/', createPrize);
router.put('/:id', updatePrize);
router.delete('/:id', deletePrize);
router.post('/:id/redeem', redeemPrize);

export default router;
