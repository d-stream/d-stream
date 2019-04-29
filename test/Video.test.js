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

    //likeVideo() test suite
    describe('Like video', () => {

        let ipfsHash, msg, sig, v, r, s;
        beforeEach(async () => {
            ipfsHash = await videoContract.methods.IPFSHash().call();
            //the user will sign the message ("Like" concatenated with the video's ipfs hash)
            msg = web3.utils.sha3("like".concat(ipfsHash));
            //the signature is signed with the user's private key
            sig = await web3.eth.sign(msg, accounts[0]);

            //v,r,s are parts of the signature
            v = parseInt(sig.substr(130, 2)) + 27;
            r = sig.substr(0, 66);
            s = "0x" + sig.substr(66, 64);


        });

        it('likes a video for the first time', async () => {

            //we are sending a TX to say that accounts[0] has liked a video
            //accounts[1] (DStream ) is responsible for submitting this TX
            await videoContract.methods.likeVideo(v, r, s, accounts[0]).send({
                from: accounts[1], gas: '1000000'
            });

            const numLikes = await videoContract.methods.numLikes().call();

            //checking the user interaction after liking the video, it should be LIKING which is equal to (1)
            const userInteraction = await videoContract.methods.userToVideoInteractionStatus(accounts[0]).call();

            assert.equal(userInteraction, 1);
            assert.equal(numLikes, 1);
        });

        it('resets the like of an already liked video', async () => {

            //Liking a video for the first time
            await videoContract.methods.likeVideo(v, r, s, accounts[0]).send({
                from: accounts[1], gas: '1000000'
            });

            //Liking the video again
            await videoContract.methods.likeVideo(v, r, s, accounts[0]).send({
                from: accounts[1], gas: '1000000'
            });

            const numLikes = await videoContract.methods.numLikes().call();

            //User interaction should return neutral again which is equal to (0)
            const userInteraction = await videoContract.methods.userToVideoInteractionStatus(accounts[0]).call();

            assert.equal(userInteraction, 0);
            assert.equal(numLikes, 0);

        });

        /*it('likes a previously disliked video', async () => {


            //Disliking the video
            await videoContract.methods.dislikeVideo(v, r, s, accounts[0]).send({
                from: accounts[1], gas: '1000000'
            });

            const numLikes = await videoContract.methods.numLikes().call();
            const numDislikes = await videoContract.methods.numDislikes().call();

            //Liking the disliked video
            await videoContract.methods.likeVideo(v, r, s, accounts[0]).send({
                from: accounts[1], gas: '1000000'
            });

            const finalNumLikes = await videoContract.methods.numLikes().call();
            const finalNumDislikes = await videoContract.methods.numDislikes().call();

            //User interaction should be liking which is equal to (1)
            const userInteraction = await videoContract.methods.userToVideoInteractionStatus(accounts[0]).call();

            //The number of likes should be increased by 1 
            assert.equal(finalNumLikes, numLikes + 1);

            //The number of dislikes should be decreased by 1
            assert.equal(finalNumDislikes, numDislikes - 1);
            assert.equal(userInteraction,1);
        });*/
    });


});