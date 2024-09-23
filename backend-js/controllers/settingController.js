const Setting = require('../models/settings')

exports.getSettingWithUserId = async (req, res) => {
  try {
    const setting = await Setting.findOne({"user_id": req.params.user_id})
    if (!setting) {
      return res.status(404).json({ error: 'Not Found'});
    }
    res.json(setting);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

exports.createSetting = async (req, res) => {
  const setting = new Setting({
    user_id: req.body.user_id,
    client_id: req.body.client_id,
    client_secret: req.body.client_secret,
    jwt_token: req.body.jwt_token,
    user_name: req.body.user_name,
    password: req.body.password,
    device_id: req.body.device_id
  });

  try {
    const savedItem = await setting.save();
    res.json(savedItem);
  } catch (err) {
    res.status(400).json({ message: err.message })
  }
}

exports.updateSetting = async (req, res) => {
  try {
    const updatedItem = await Setting.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(updatedItem);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
}