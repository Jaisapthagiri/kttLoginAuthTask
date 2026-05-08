const crypto = require('crypto');

const token = crypto.randomBytes(20);
console.log(token);
console.log(token.toString('hex'));
