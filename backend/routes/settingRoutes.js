const express = require('express');
const router = express.Router();
const settingController = require('../controllers/settingController');

router.get('/:user_id', settingController.getSettingWithUserId);
router.post('/', settingController.createSetting);
router.put('/:setting_id', settingController.updateSetting);

module.exports = router;