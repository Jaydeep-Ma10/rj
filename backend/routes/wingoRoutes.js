import express from 'express';
import * as wingoController from '../controllers/wingoController.js';

const router = express.Router();

router.post('/bet', wingoController.placeBet);
router.get('/round/current', wingoController.getCurrentRound);
router.post('/round/settle', wingoController.settleRound);
router.get('/history', wingoController.getGameHistory);
router.get('/my-bets', wingoController.getMyBets);

export default router;
