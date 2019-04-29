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

    // Deploying the contract Locally
    videoContract = await new web3.eth.Contract(
        JSON.parse(interface)
    ).deploy({
        data: bytecode,
        arguments: [
            accounts[0],
            "QM",
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
                from: accounts[1],
                gas: '1000000'
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
                from: accounts[1],
                gas: '1000000'
            });

            //Liking the video again
            await videoContract.methods.likeVideo(v, r, s, accounts[0]).send({
                from: accounts[1],
                gas: '1000000'
            });

            const numLikes = await videoContract.methods.numLikes().call();

            //User interaction should return neutral again which is equal to (0)
            const userInteraction = await videoContract.methods.userToVideoInteractionStatus(accounts[0]).call();

            assert.equal(userInteraction, 0);
            assert.equal(numLikes, 0);

        });

        it('likes a previously disliked video', async () => {


            msg = web3.utils.sha3("dislike".concat(ipfsHash));
            sig = await web3.eth.sign(msg, accounts[0]);

            v = parseInt(sig.substr(130, 2)) + 27;
            r = sig.substr(0, 66);
            s = "0x" + sig.substr(66, 64);

            //Disliking the video
            await videoContract.methods.dislikeVideo(v, r, s, accounts[0]).send({
                from: accounts[1],
                gas: '1000000'
            });

            const numLikes = await videoContract.methods.numLikes().call();
            const numDislikes = await videoContract.methods.numDislikes().call();


            msg = web3.utils.sha3("like".concat(ipfsHash));
            sig = await web3.eth.sign(msg, accounts[0]);

            v = parseInt(sig.substr(130, 2)) + 27;
            r = sig.substr(0, 66);
            s = "0x" + sig.substr(66, 64);

            //Liking the disliked video
            await videoContract.methods.likeVideo(v, r, s, accounts[0]).send({
                from: accounts[1],
                gas: '1000000'
            });

            const finalNumLikes = await videoContract.methods.numLikes().call();
            const finalNumDislikes = await videoContract.methods.numDislikes().call();

            //User interaction should be liking which is equal to (1)
            const userInteraction = await videoContract.methods.userToVideoInteractionStatus(accounts[0]).call();

            //The number of likes should be increased by 1 
            assert.equal(finalNumLikes, parseInt(numLikes + 1));

            //The number of dislikes should be decreased by 1
            assert.equal(finalNumDislikes, parseInt(numDislikes - 1));

            assert.equal(userInteraction, 1);
        });
    });

    describe('DisLike video', () => {

        it('Dislikes the videos without making the user pays for TX fees', async () => {
            // Sign the request from the user by his private key
            let msg = web3.utils.sha3("dislikeQM");
            let sig = await web3.eth.sign(msg, accounts[1]);
            var r = sig.substr(0, 66)
            var s = "0x" + sig.substr(66, 64)
            var v = parseInt(sig.substr(130, 2)) + 27;

            /* Remix Test
                28,"0xae9afcf7ce70466134e50383e97d0e529c5cb8786e11ea9ec86cc7a61f02223a","0x79df5ec8d51978749859c96b5818d99403c91d992315665c4e8e8a856203d368","0xCE0e4847FacEfD1752Ae9B9DF07E47C294EBDf03"
                27,"0x4c40671338eb0987e6bdba670e04f3415d8f7b323e84825a0e4aebc62a461e6b","0x5de8a4fef940c3ac70f13437ea81ca3896e65e8ae7b4c71c956c86d198be6020","0xfB2078F4a536CB329bE6071aBE450d2cE32F716e"
            */

            /* 
                Sending the request to ganache by an account who didn't make the request
                i.e paying transaction for the user
            */

            await videoContract.methods.dislikeVideo(v, r, s, accounts[1]).send({
                from: accounts[0]
            });

            // Getting the num of Dislikes After transaction
            let numOfDislikes = await videoContract.methods.numDislikes().call({
                from: accounts[0]
            })

            // asserting that the num of likes increased by 1
            assert.equal(parseInt(numOfDislikes), 1);
        });


        it('Refuses tampered dislikes requests', async () => {
            // Sign the request from the user by his private key
            let msg = web3.utils.sha3("dislikeQM");
            let sig = await web3.eth.sign(msg, accounts[1]);
            var r = sig.substr(0, 66)
            var s = "0x" + sig.substr(66, 64)
            var v = parseInt(sig.substr(130, 2)) + 27;

            /*
                Sending the invalid account ito dislikeVideo function
                i.e account who didn't sign the request
             */
            try {
                await videoContract.methods.dislikeVideo(v, r, s, accounts[0]).send({
                    from: accounts[0]
                });
            } catch (err) {
                assert(err);
            }

        });


        it(`Dislikes the video if the user hasn't interacted with it`, async () => {
            // Sign the request from the user by his private key
            let msg = web3.utils.sha3("dislikeQM");
            let sig = await web3.eth.sign(msg, accounts[1]);
            var r = sig.substr(0, 66)
            var s = "0x" + sig.substr(66, 64)
            var v = parseInt(sig.substr(130, 2)) + 27;

            // Sending the request to ganache
            await videoContract.methods.dislikeVideo(v, r, s, accounts[1]).send({
                from: accounts[0]
            });

            // Getting the num of Dislikes After transaction
            let numOfDislikes = await videoContract.methods.numDislikes().call({
                from: accounts[0]
            })

            // asserting that the num of Dislikes increased by 1
            assert.equal(parseInt(numOfDislikes), 1);
        });

        it(`Neutralise the user interaction to the video if the user dislikes a disliked video`, async () => {
            // Sign the request from the user by his private key
            let msg = web3.utils.sha3("dislikeQM");
            let sig = await web3.eth.sign(msg, accounts[1]);
            var r = sig.substr(0, 66)
            var s = "0x" + sig.substr(66, 64)
            var v = parseInt(sig.substr(130, 2)) + 27;

            // User Dislikes the video
            await videoContract.methods.dislikeVideo(v, r, s, accounts[1]).send({
                from: accounts[0]
            });

            // User Dislikes the video Again
            await videoContract.methods.dislikeVideo(v, r, s, accounts[1]).send({
                from: accounts[0]
            });

            // Getting the num of Dislikes After transaction
            let numOfDislikes = await videoContract.methods.numDislikes().call({
                from: accounts[0]
            })

            // asserting that the num of Dislikes remain the same 
            assert.equal(parseInt(numOfDislikes), 0);
        });


        it(`Allows multiple Dislikes to the video`, async () => {
            // Sign the request from the user by his private key
            let msg = web3.utils.sha3("dislikeQM");
            let sig = await web3.eth.sign(msg, accounts[1]);
            var r = sig.substr(0, 66)
            var s = "0x" + sig.substr(66, 64)
            var v = parseInt(sig.substr(130, 2)) + 27;

            // Sending the request to ganache
            await videoContract.methods.dislikeVideo(v, r, s, accounts[1]).send({
                from: accounts[0]
            });

            // Sign the request from another user by his private key
            msg = web3.utils.sha3("dislikeQM");
            sig = await web3.eth.sign(msg, accounts[2]);
            r = sig.substr(0, 66)
            s = "0x" + sig.substr(66, 64)
            v = parseInt(sig.substr(130, 2)) + 27;

            // Sending another request to ganache
            await videoContract.methods.dislikeVideo(v, r, s, accounts[2]).send({
                from: accounts[0]
            });

            // Getting the num of Dislikes After transaction
            let numOfDislikes = await videoContract.methods.numDislikes().call({
                from: accounts[0]
            })

            // asserting that the num of Dislikes increased by 2
            assert.equal(parseInt(numOfDislikes), 2);
        });


        it(`Dislikes the video if the user has liked it before`, async () => {
            // Sign the like request from the user by his private key
            let msg = web3.utils.sha3("likeQM");
            let sig = await web3.eth.sign(msg, accounts[1]);
            var r = sig.substr(0, 66)
            var s = "0x" + sig.substr(66, 64)
            var v = parseInt(sig.substr(130, 2)) + 27;


            // Sending the like request to ganache
            await videoContract.methods.likeVideo(v, r, s, accounts[1]).send({
                from: accounts[0]
            });


            // Sign the dislike request from the user by his private key
            msg = web3.utils.sha3("dislikeQM");
            sig = await web3.eth.sign(msg, accounts[1]);
            r = sig.substr(0, 66)
            s = "0x" + sig.substr(66, 64)
            v = parseInt(sig.substr(130, 2)) + 27;

            // Sending the dislike request to ganache
            await videoContract.methods.dislikeVideo(v, r, s, accounts[1]).send({
                from: accounts[0]
            });

            // Getting the num of likes After transaction
            let numOflikes = await videoContract.methods.numLikes().call({
                from: accounts[0]
            });

            // Getting the num of Dislikes After transaction
            let numOfDislikes = await videoContract.methods.numDislikes().call({
                from: accounts[0]
            });

            // asserting that the num of likes is equal 0
            assert.equal(parseInt(numOflikes), 0);

            // asserting that the num of Dislikes increased by 1
            assert.equal(parseInt(numOfDislikes), 1);
        });
    });




    //viewVideo() test suite
    describe('View video', () => {

        let ipfsHash, msg, sig, v, r, s;
        beforeEach(async () => {
            ipfsHash = await videoContract.methods.IPFSHash().call();
            //the user will sign the message ("Like" concatenated with the video's ipfs hash)
            msg = web3.utils.sha3("view".concat(ipfsHash));
            //the signature is signed with the user's private key
            sig = await web3.eth.sign(msg, accounts[0]);

            //v,r,s are parts of the signature
            v = parseInt(sig.substr(130, 2)) + 27;
            r = sig.substr(0, 66);
            s = "0x" + sig.substr(66, 64);


        });

        it('Increments the number of views for watching the video for the first time', async () => {

            //we are sending a TX to say that accounts[0] has viewed a video
            //accounts[1] (DStream ) is responsible for submitting this TX
            await videoContract.methods.viewVideo(v, r, s, accounts[0]).send({
                from: accounts[1], gas: '1000000'
            });

            const numViews = await videoContract.methods.numViews().call();

            //checking the user view status  after viewing the video, it should be true
            const userStatus = await videoContract.methods.userToVideoViewStatus(accounts[0]).call();

            assert.equal(userStatus, 1);
            assert.equal(numViews, 1);
        });

        it('Do nothing for users that already watched the video', async () => {
            //we are sending a TX to say that accounts[0] has viewed a video
            //accounts[1] (DStream ) is responsible for submitting this TX
            await videoContract.methods.viewVideo(v, r, s, accounts[0]).send({
                from: accounts[1], gas: '1000000'
            });


            try {
                //trying to call viewVideo() again for the same user that has already watched the video
                await videoContract.methods.viewVideo(v, r, s, accounts[0]).send({
                    from: accounts[1], gas: '1000000'
                });
                assert(false);
            } catch (err) {

                //An error should be thrown because the require statement in the viewVideo() function will not succeed 
                //because the user is marked as viewer
                assert(err);
            }

        });


    });










});