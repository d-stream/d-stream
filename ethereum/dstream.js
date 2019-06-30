const compiledDStream = require('./build/DStream.json');
const web3 = require('./web3');

const instance = new web3.eth.Contract(
    JSON.parse(compiledDStream.interface),
    '0xa779f3829da1333de297b87ef77f51240b27c66e'
);
module.exports = instance;