const assert = require('assert');
const Web3 = require('web3');
const ganache = require('ganache-cli');
const web3 = new Web3(ganache.provider());
const compiledDStream = require('../../ethereum/build/DStreamTest.json');
const compiledVideo = require('../../ethereum/build/VideoTest.json');
let accounts, dstream, videoAddress, video;

beforeEach(async () => {
    accounts = await web3.eth.getAccounts();

    dstream = await new web3.eth.Contract(JSON.parse(compiledDStream.interface))
        .deploy({
            data: compiledDStream.bytecode
        })
        .send({
            from: accounts[0],
            gas: '1500000'
        });

    await dstream.methods.uploadVideo('IPFS_HASH', 'META_DATA_HASH', 'CATEGORY').send({
        from: accounts[0],
        gas: '1000000'
    });

    [videoAddress] = await dstream.methods.getUploadedVideos().call();

    video = await new web3.eth.Contract(JSON.parse(compiledVideo.interface), videoAddress);

});


describe('DStream', () => {
    it('deploys a dstream and a video contract', () => {
        assert.ok(dstream.options.address);
        assert.ok(video.options.address);

    });

    it('uploads a video', async () => {
        const uploadedVideos = await dstream.methods.getUploadedVideos().call();
        assert.equal(uploadedVideos.length, 1);
    });


    it(`doesn't upload an already uploaded video`, async () => {
        try {
            await dstream.methods.uploadVideo('IPFS_HASH', 'META_DATA_HASH', 'CATEGORY').send({
                from: accounts[0],
                gas: '1000000'
            });
            assert(false);
        } catch (err) {
            assert(err);
        }
    });

    it('assigns the owner of the video to be its uploader ', async () => {
        const owner = await video.methods.owner().call();
        assert.equal(accounts[0], owner);
    });
});