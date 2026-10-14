// Internal log only. To go live, call SendGrid/Resend/Nodemailer inside send() and return its status.
exports.send = async (log) => ({ status: log.status || 'Sent' });
