const {credential} = require('firebase-admin');
const {initializeApp} = require('firebase-admin/app');



try {
    global.fire = initializeApp({
        credential: credential.cert(JSON.parse(process.env.SERVICE_ACCOUNT_STR))
    });
} catch (e) {
    console.log(e);
}