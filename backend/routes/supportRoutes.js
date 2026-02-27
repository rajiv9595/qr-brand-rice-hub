
const express = require('express');
const router = express.Router();
const { createTicket, getMyTickets, addTicketMessage } = require('../controllers/supportController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);

router.post('/', createTicket);
router.get('/my-tickets', getMyTickets);
router.post('/:id/message', addTicketMessage);

module.exports = router;
