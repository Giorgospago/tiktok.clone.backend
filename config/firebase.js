const {credential} = require('firebase-admin');
const {initializeApp} = require('firebase-admin/app');

global.fire = initializeApp({
    credential: credential.cert(JSON.parse(process.env.SERVICE_ACCOUNT_STR))
});