const assert = require('assert');
const db = require('../../database/config/database');
const Users = require('../../database/models/Users');
const Videos = require('../../database/models/Videos');
const Likes = require('../../database/models/Likes');
const Dislikes = require('../../database/models/Dislikes');
const Views = require('../../database/models/Views');
const Uploads = require('../../database/models/Uploads');
const Requests = require('../../database/models/Requests');

beforeEach(async () => {
    await db.sync({
        force: true
    });
});


describe('Database', () => {

    it('Connets to the database', async () => {
        try {
            await db.authenticate();
            assert(true);
        } catch (e) {
            assert(false);
        }
    });

    describe('Users Table', () => {

        it('Adds new user', async () => {
            await Users.create({
                address: '0x789'
            });

            const user = await Users.findOne({
                where: {
                    address: '0x789'
                }
            })
            assert.equal(user.address, '0x789');
        });



    });

    describe('Table Videos', () => {
        it('Adds new video', async () => {
            await Videos.create({
                address: '0xft',
                title: 'First video',
                description: 'description',
                category: 'Sports',
                hash: 'Qm'
            });

            const video = await Videos.findOne({
                where: {
                    address: '0xft'
                }
            })
            assert.equal(video.address, '0xft');

        });

    });

    describe('Table Requests', () => {
        let user, video;
        beforeEach(async () => {
            //We should first create a User to reference on his Primary Key
            await Users.create({
                address: '0x0'
            });

            //fetching the last inserted user row
            user = await Users.findOne();

            //We should create a Video to reference on its Primary Key
            await Videos.create({
                address: '0xabc',
                title: 'nice title',
                description: 'nice description',
                category: 'fun',
                hash: '0x00123'
            });

            //fetching the last inserted video row
            video = await Videos.findOne();
        });
        it(`Adds a request that matches an existing user id and video id`, async () => {


            //a request should be created by making userId reference the last inserted user's id
            //and videoId reference the last inserted video's id
            await Requests.create({
                userId: user.id,
                videoId: video.id,
                request: 'Please upload this video'
            });

            //getting the last inserted request
            const request = await Requests.findOne();

            //If the latest request's request is "Please upload this video", 
            //then our request has been added successfully
            assert.equal('Please upload this video', request.request);


        });

        it(`Prevents adding a request that references a wrong userId`, async () => {

            //We will let userId reference to a non-existing id in Users table

            try {
                await Requests.create({
                    userId: 99,
                    videoId: video.id,
                    request: 'Please upload this video'
                });
                assert(true);
            } catch (err) {
                assert(err);
            }




        });
        it(`Prevents adding a request that references a wrong videoId`, async () => {

            //We will let videoId reference to a non-existing id in Videos table

            try {
                await Requests.create({
                    userId: user.id,
                    videoId: 99,
                    request: 'Please upload this video'
                });
                assert(true);
            } catch (err) {
                assert(err);
            }




        });
        it(`Adds multiple requests for the same user on the same video`, async () => {

            //We will add the same request twice
            await Requests.create({
                userId: user.id,
                videoId: video.id,
                request: 'Please upload this video'
            });

            await Requests.create({
                userId: user.id,
                videoId: video.id,
                request: 'Please like this video'
            });


            //the number of rows in table request should be 2
            const numRequests = await Requests.count();
            assert.equal(numRequests, 2);


        });
    });

    describe('Table Uploads', () => {
        let user, video;
        beforeEach(async () => {
            //We should first create a User to reference on his Primary Key
            await Users.create({
                address: '0x0'
            });

            //fetching the last inserted user row
            user = await Users.findOne();

            //We should create a Video to reference on its Primary Key
            await Videos.create({
                address: '0xabc',
                title: 'nice title',
                description: 'nice description',
                category: 'fun',
                hash: '0x00123'
            });

            //fetching the last inserted video row
            video = await Videos.findOne();
        });
        it(`adds a new upload row that matches an existing user id and video id`, async () => {


            //a new upload row should be created by making userId reference the last inserted user's id
            //and videoId reference the last inserted video's id
            await Uploads.create({
                userId: user.id,
                videoId: video.id
            });

            //getting the last inserted upload row
            const upload = await Uploads.findOne();

            //If the latest upload row user's id is user.id, 
            //then our upload row has been added successfully
            assert.equal(upload.userId, user.id);


        });

        it(`Prevents adding an upload row that references a wrong userId`, async () => {

            //We will let userId reference to a non-existing id in Users table

            try {
                await Uploads.create({
                    userId: 99,
                    videoId: video.id,
                });
                assert(false);
            } catch (err) {
                assert(err);
            }




        });
        it(`Prevents adding an upload row that references a wrong videoId`, async () => {

            //We will let videoId reference to a non-existing id in Videos table

            try {
                await Uploads.create({
                    userId: user.id,
                    videoId: 99,
                });
                assert(false);
            } catch (err) {
                assert(err);
            }




        });
        it(`Prevents adding an already added upload row with the same user id and video id`, async () => {

            //We will insert the same upload row twice
            await Uploads.create({
                userId: user.id,
                videoId: video.id,
            });

            try {
                await Uploads.create({
                    userId: user.id,
                    videoId: video.id,
                });
                assert(false);
            } catch (err) {
                assert(err);
            }

        });
    });

    describe('Table Views', () => {
        let user, video;
        beforeEach(async () => {
            //We should first create a User to reference on his Primary Key
            await Users.create({
                address: '0x0'
            });

            //fetching the last inserted user row
            user = await Users.findOne();

            //We should create a Video to reference on its Primary Key
            await Videos.create({
                address: '0xabc',
                title: 'nice title',
                description: 'nice description',
                category: 'fun',
                hash: '0x00123'
            });

            //fetching the last inserted video row
            video = await Videos.findOne();
        });
        it(`adds a new view row that matches an existing user id and video id`, async () => {


            //a new view row should be created by making userId reference the last inserted user's id
            //and videoId reference the last inserted video's id
            await Views.create({
                userId: user.id,
                videoId: video.id
            });

            //getting the last inserted upload row
            const view = await Views.findOne();

            //If the latest upload row user's id is user.id, 
            //then our upload row has been added successfully
            assert.equal(view.userId, user.id);


        });

        it(`Prevents adding a view row that references a wrong userId`, async () => {

            //We will let userId reference to a non-existing id in Users table

            try {
                await Views.create({
                    userId: 99,
                    videoId: video.id,
                });
                assert(false);
            } catch (err) {
                assert(err);
            }




        });
        it(`Prevents adding a view row that references a wrong videoId`, async () => {

            //We will let videoId reference to a non-existing id in Videos table

            try {
                await Views.create({
                    userId: user.id,
                    videoId: 99,
                });
                assert(false);
            } catch (err) {
                assert(err);
            }




        });
        it(`Prevents adding an already added view row with the same user id and video id`, async () => {

            //We will insert the same view row twice
            await Views.create({
                userId: user.id,
                videoId: video.id,
            });

            try {
                await Views.create({
                    userId: user.id,
                    videoId: video.id,
                });
                assert(false);
            } catch (err) {
                assert(err);
            }

        });
    });



    describe('Table Likes', () => {
        let user, video;
        beforeEach(async () => {
            //We should first create a User to reference on his Primary Key
            await Users.create({
                address: '0x0'
            });

            //fetching the last inserted user row
            user = await Users.findOne();

            //We should create a Video to reference on its Primary Key
            await Videos.create({
                address: '0xabc',
                title: 'nice title',
                description: 'nice description',
                category: 'fun',
                hash: '0x00123'
            });

            //fetching the last inserted video row
            video = await Videos.findOne();
        });
        it(`adds a new like row that matches an existing user id and video id`, async () => {


            //a new view row should be created by making userId reference the last inserted user's id
            //and videoId reference the last inserted video's id
            await Likes.create({
                userId: user.id,
                videoId: video.id
            });

            //getting the last inserted upload row
            const like = await Likes.findOne();

            //If the latest upload row user's id is user.id, 
            //then our upload row has been added successfully
            assert.equal(like.userId, user.id);


        });

        it(`Prevents adding a like row that references a wrong userId`, async () => {

            //We will let userId reference to a non-existing id in Users table

            try {
                await Likes.create({
                    userId: 99,
                    videoId: video.id,
                });
                assert(false);
            } catch (err) {
                assert(err);
            }




        });
        it(`Prevents adding a like row that references a wrong videoId`, async () => {

            //We will let videoId reference to a non-existing id in Videos table

            try {
                await Likes.create({
                    userId: user.id,
                    videoId: 99,
                });
                assert(false);
            } catch (err) {
                assert(err);
            }




        });
        it(`Prevents adding an already added like row with the same user id and video id`, async () => {

            //We will insert the same like row twice
            await Likes.create({
                userId: user.id,
                videoId: video.id,
            });

            try {
                await Likes.create({
                    userId: user.id,
                    videoId: video.id,
                });
                assert(false);
            } catch (err) {
                assert(err);
            }

        });
    });



    describe('Table Dislikes', () => {
        let user, video;
        beforeEach(async () => {
            //We should first create a User to reference on his Primary Key
            await Users.create({
                address: '0x0'
            });

            //fetching the last inserted user row
            user = await Users.findOne();

            //We should create a Video to reference on its Primary Key
            await Videos.create({
                address: '0xabc',
                title: 'nice title',
                description: 'nice description',
                category: 'fun',
                hash: '0x00123'
            });

            //fetching the last inserted video row
            video = await Videos.findOne();
        });
        it(`adds a new dislike row that matches an existing user id and video id`, async () => {


            //a new dislike row should be created by making userId reference the last inserted user's id
            //and videoId reference the last inserted video's id
            await Dislikes.create({
                userId: user.id,
                videoId: video.id
            });

            //getting the last inserted upload row
            const dislike = await Dislikes.findOne();

            //If the latest upload row user's id is user.id, 
            //then our upload row has been added successfully
            assert.equal(dislike.userId, user.id);


        });

        it(`Prevents adding a like row that references a wrong userId`, async () => {

            //We will let userId reference to a non-existing id in Users table

            try {
                await Dislikes.create({
                    userId: 99,
                    videoId: video.id,
                });
                assert(false);
            } catch (err) {
                assert(err);
            }




        });
        it(`Prevents adding a like row that references a wrong videoId`, async () => {

            //We will let videoId reference to a non-existing id in Videos table

            try {
                await Dislikes.create({
                    userId: user.id,
                    videoId: 99,
                });
                assert(false);
            } catch (err) {
                assert(err);
            }




        });
        it(`Prevents adding an already added like row with the same user id and video id`, async () => {

            //We will insert the same like row twice
            await Dislikes.create({
                userId: user.id,
                videoId: video.id,
            });

            try {
                await Dislikes.create({
                    userId: user.id,
                    videoId: video.id,
                });
                assert(false);
            } catch (err) {
                assert(err);
            }

        });
    });





});