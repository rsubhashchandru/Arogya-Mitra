const express = require('express');
const router = express.Router();
const { getWeekInfo, getAllWeeks } = require('../controllers/pregnancyController');

router.get('/', getAllWeeks);
router.get('/:week', getWeekInfo);

module.exports = router;
