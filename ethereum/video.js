const Video = require('./build/Video.json');
const web3 = require('./web3');

export default (address) => {
    return new web3.eth.Contract(
        JSON.parse(Video.interface),
        address
    );
}