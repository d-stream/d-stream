const assert = require('assert');
const Web3 = require('web3');
const ganache = require('ganache-cli');
const web3 = new Web3(ganache.provider());



// Getting the compiled Video contract from the build Directory 
const {
    interface,
    bytecode
} = require('../ethereum/build/Video.json');

// Varaibles to be used for test cases
let accounts;
let videoContract;


// Initilize the variables before each test
beforeEach(async () => {

    // Get account from ganache netowrk
    accounts = await web3.eth.getAccounts();

    // Deplouing the contract Locally
    videoContract = await new web3.eth.Contract(
        JSON.parse(interface)
    ).deploy({
        data: bytecode,
        arguments: [
            accounts[0],
            "IPFS_HASH",
            "META_DATA_HASH",
            "CATEGORY"
        ]
    }).send({
        from: accounts[0],
        gas: '1000000'
    });

});

// Video Contract Test Suite
describe('Video Contract', () => {

    // Test if the contract is deployed successfully
    it('Deploy The Video Contract', () => {
        assert.ok(videoContract.options.address);
    })

});