require('dotenv').config();
const app = require('./app'), connect = require('./config/db');
connect().then(() => app.listen(process.env.PORT || 5000, () => console.log('API running')))
  .catch(e => { console.error(e.message); process.exit(1); });
