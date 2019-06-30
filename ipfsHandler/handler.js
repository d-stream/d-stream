const ipfsAPI = require('ipfs-http-client');
const fileType = require('file-type');
//Connceting to the ipfs network via infura gateway
const ipfs = ipfsAPI('ipfs.infura.io', '5001', { protocol: 'https' })

module.exports = async (validCID) => {

    console.log(validCID);

    let ext;
    try {
        const files = await ipfs.get(validCID);
        const type = fileType(files[0].content);
        ext = type.ext;
    }
    catch (e) {
        return ('Cannot fetch');
    }

    return (ext);
};
