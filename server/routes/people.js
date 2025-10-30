import express from 'express';
import {
  getAllPeople,
  getPersonById,
  createPerson,
  updatePerson,
  deletePerson
} from '../controllers/peopleController.js';

const router = express.Router();

router.get('/', getAllPeople);
router.get('/:id', getPersonById);
router.post('/', createPerson);
router.put('/:id', updatePerson);
router.delete('/:id', deletePerson);

export default router;
