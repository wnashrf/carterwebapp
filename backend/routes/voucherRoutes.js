const router = require('express').Router();
const { createVoucher, getVouchers, getVoucherById, updateVoucher, deleteVoucher } = require('../controllers/voucherController');
const verifyToken = require('../middleware/auth');

router.get('/', getVouchers);
router.get('/:id', getVoucherById);
router.post('/', verifyToken, createVoucher);
router.put('/:id', verifyToken, updateVoucher);
router.patch('/:id', verifyToken, updateVoucher);
router.delete('/:id', verifyToken, deleteVoucher);
 
module.exports = router;