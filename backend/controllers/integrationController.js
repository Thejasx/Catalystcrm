const Setting = require('../models/Setting');
const AuditLog = require('../models/AuditLog');

const defaultIntegrations = {
  google_calendar_sync: { enabled: false, clientId: '', clientSecret: '' },
  whatsapp_api: { enabled: false, phoneId: '', accessToken: '' },
  email_smtp: { enabled: false, smtpHost: '', smtpPort: '', smtpUser: '', smtpPass: '' },
  sms_gateway: { enabled: false, twilioSid: '', twilioToken: '', twilioPhone: '' },
  payment_gateway: { enabled: false, stripePublicKey: '', stripeSecretKey: '' }
};

exports.getIntegrations = async (req, res) => {
  try {
    const integrations = {};
    for (const key of Object.keys(defaultIntegrations)) {
      const dbSetting = await Setting.findOne({ where: { key } });
      if (dbSetting) {
        integrations[key] = JSON.parse(dbSetting.value);
      } else {
        integrations[key] = defaultIntegrations[key];
      }
    }
    res.status(200).json({ success: true, integrations });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error fetching integrations' });
  }
};

exports.saveIntegrationSettings = async (req, res) => {
  const { key, config } = req.body;

  if (!key || !config) {
    return res.status(400).json({ success: false, message: 'Key and configuration are required' });
  }

  if (!Object.keys(defaultIntegrations).includes(key)) {
    return res.status(400).json({ success: false, message: 'Invalid integration key' });
  }

  try {
    const [setting, created] = await Setting.findOrCreate({
      where: { key },
      defaults: { value: JSON.stringify(config) }
    });

    if (!created) {
      setting.value = JSON.stringify(config);
      await setting.save();
    }

    await AuditLog.create({
      userId: req.user.id,
      action: 'UPDATE_INTEGRATION',
      details: `User ${req.user.username} updated configuration for integration: "${key}" (${config.enabled ? 'Enabled' : 'Disabled'})`
    });

    res.status(200).json({ success: true, message: 'Integration settings saved successfully', setting });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error saving integration settings' });
  }
};
