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


    })



});