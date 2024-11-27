const express = require('express');
const router = express.Router();
const ewaybillController = require('../controller/ewaybillController');

router.post('/create/:id', ewaybillController.createEwaybill);
router.get('/report/:clientid', ewaybillController.generateEwayBillReport);
router.get('/report/date/:clientid', ewaybillController.generateEwayBillReportdate);
module.exports = router;