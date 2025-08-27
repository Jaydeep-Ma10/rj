import express from 'express';
import * as wingoController from '../controllers/wingoController.js';
import idempotency from '../middleware/idempotency.js';
import { auth } from '../middleware/auth.js';
import { bettingRateLimit, validateBet } from '../middleware/security.js';

const router = express.Router();

// Protected routes with authentication and idempotency
router.post('/bet', auth, bettingRateLimit, validateBet, idempotency, wingoController.placeBet);
router.post('/round/settle', auth, wingoController.settleRound);

// Public routes
router.get('/round/current', wingoController.getCurrentRound);
router.get('/history', wingoController.getGameHistory);
router.get('/my-bets', auth, wingoController.getMyBets);

export default router;
