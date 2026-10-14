const Notification = require('../models/Notification'), User = require('../models/User');
const PREF = { lead_assigned: 'leads', lead_status: 'leads', deal_stage: 'deals', deal_won: 'deals', deal_lost: 'deals', follow_up_due: 'followUps', activity_assigned: 'followUps', customer_created: 'system', system: 'system' };
// Creates a notification unless: no recipient, recipient is the actor, user disabled this category, or an identical unread one exists.
exports.notify = async ({ user, actor, title, message, type, entityType = 'system', entityId }) => {
  if (!user || (actor && String(user) === String(actor))) return null;
  const u = await User.findById(user).select('preferences');
  if (!u || u.preferences?.notifications?.[PREF[type]] === false) return null;
  if (await Notification.findOne({ user, type, title, relatedEntityId: entityId, isRead: false })) return null;
  return Notification.create({ user, title, message, type, relatedEntityType: entityType, relatedEntityId: entityId });
};
