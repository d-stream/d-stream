const express = require('express');
const db = require('../../database/config/database');
const Users = require('../../database/models/Users');
const Videos = require('../../database/models/Videos');
const Uploads = require('../../database/models/Uploads');
const Likes = require('../../database/models/Likes');
const Dislikes = require('../../database/models/Dislikes');
const Views = require('../../database/models/Views');
const Requests = require('../../database/models/Requests');
const router = express.Router();
const IPFSHandler = require('../../ipfsHandler/handler');
const web3 = require('../../ethereum/web3');
const Video = require('../../ethereum/build/Video.json');
const Op = require('sequelize').Op;
router.get('/trending/', async (req, res, next) => {


    const videos = await Videos.findAll({});
    for (let i = 0; i < videos.length; i++) {
        const numViews = await Views.findAll({
            where: {
                videoId: videos[i].id

            }
        });
        videos[i].setDataValue('numViews', numViews.length);
    }

    videos.sort((a, b) => (b.dataValues.numViews > a.dataValues.numViews) ? 1 : ((a.dataValues.numViews > b.dataValues.numViews) ? -1 : 0));

    res.json(videos);
});




router.get('/similarVideos/', async (req, res, next) => {


    const videos = await Videos.findAll({});
    for (let i = 0; i < videos.length; i++) {
        const numViews = await Views.findAll({
            where: {
                videoId: videos[i].id

            }

        });
        const uploadedVideo = await Uploads.findOne({
            where: {
                videoId: videos[i].id
            }
        });
        const user = await Users.findOne({
            where: {
                id: uploadedVideo.userId
            }
        });
        videos[i].setDataValue('numViews', numViews.length);
        videos[i].setDataValue('userAddress', user.address);
    }


    res.json(videos);
});






router.get('/based/', async (req, res, next) => {
    const videos = await Videos.findAll({});

    res.json(videos);
});

router.get('/video/:hash', async (req, res, next) => {
    const video = await Videos.findOne({
        where: {
            hash: req.params.hash
        }

    });
    const numLikes = await Likes.findAll({
        where: {
            videoId: video.id
        }

    })
    const numDislikes = await Dislikes.findAll({
        where: {
            videoId: video.id
        }

    })

    const numViews = await Views.findAll({
        where: {
            videoId: video.id

        }
    })

    video.setDataValue('numLikes', numLikes.length);
    video.setDataValue('numDislikes', numDislikes.length);
    video.setDataValue('numViews', numViews.length);




    res.json(video);


});

router.get('/videoAddress/:hash', async (req, res, next) => {
    const video = await Videos.findOne({
        where: {
            hash: req.params.hash
        }
    });
    if (video) {
        res.json({ message: 'exists' });
    } else {
        res.json({ message: 'does not exist' });
    }

});

router.post('/upload', async (req, res, next) => {

    await Videos.create({
        hash: req.body.hash,
        title: req.body.title,
        description: req.body.description,
        category: req.body.category,
        address: req.body.address,
        thumbnail: req.body.thumbnail,
    });

    const video = await Videos.findOne({
        where: {
            hash: req.body.hash
        }
    });

    const user = await Users.findOne({
        where: {
            address: req.body.uploader
        }
    });

    await Uploads.create({
        videoId: video.id,
        userId: user.id
    });



    res.json({ message: 'done' });





});

router.post('/video/like', async (req, res, next) => {
    const accounts = await web3.eth.getAccounts();

    const videoContract = new web3.eth.Contract(
        JSON.parse(Video.interface),
        req.body.videoAddress
    )


    const videoId = req.body.videoId;
    const userAddress = req.body.userAddress;
    const sig = req.body.sig;

    await videoContract.methods.likeVideo(sig, userAddress).send({
        from: accounts[0],
        gas: '1500000'
    });
    const status = await videoContract.methods.userToVideoInteractionStatus(userAddress).call();

    //after liking a video, the status will be either liking or neutral
    //so in both cases the user is not disliking the video
    const user = await Users.findOne({
        where: {
            address: userAddress
        }
    });


    const dislike = await Dislikes.findOne({
        where: {
            videoId: videoId,
            userId: user.id
        }
    });
    if (dislike) {
        await Dislikes.destroy({
            where: {
                videoId: videoId,
                userId: user.id
            }
        });
    };


    //The new status is liking
    //We will add a new row in likes table
    if (status === '1') {

        await Likes.create({
            userId: user.id,
            videoId: videoId
        });

    } else {
        //The new status is neutral
        //We will remove the like row from likes table

        await Likes.destroy({
            where: {
                userId: user.id,
                videoId: videoId
            }

        });
    }

    const numLikes = await Likes.findAll({
        where: {
            videoId: videoId
        }
    })
    const numDislikes = await Dislikes.findAll({
        where: {
            videoId: videoId
        }
    })
    res.json({ numLikes: numLikes.length, numDislikes: numDislikes.length });

});

router.post('/video/dislike', async (req, res, next) => {
    const accounts = await web3.eth.getAccounts();

    const videoContract = new web3.eth.Contract(
        JSON.parse(Video.interface),
        req.body.videoAddress
    )


    const videoId = req.body.videoId;
    const userAddress = req.body.userAddress;
    const sig = req.body.sig;

    await videoContract.methods.dislikeVideo(sig, userAddress).send({
        from: accounts[0],
        gas: '1500000'
    });
    const status = await videoContract.methods.userToVideoInteractionStatus(userAddress).call();

    //after disliking a video, the status will be either disliking or neutral
    //so in both cases the user is not liking the video
    const user = await Users.findOne({
        where: {
            address: userAddress
        }
    });


    const like = await Likes.findOne({
        where: {
            videoId: videoId,
            userId: user.id
        }
    });
    if (like) {
        await Likes.destroy({
            where: {
                videoId: videoId,
                userId: user.id
            }
        });
    };


    //The new status is disliking
    //We will add a new row in dislikes table
    if (status === '2') {

        await Dislikes.create({
            userId: user.id,
            videoId: videoId
        });

    } else {
        //The new status is neutral
        //We will remove the dislike row from dislikes table

        await Dislikes.destroy({
            where: {
                userId: user.id,
                videoId: videoId
            }

        });
    }
    const numLikes = await Likes.findAll({
        where: {
            videoId: videoId
        }
    })
    const numDislikes = await Dislikes.findAll({
        where: {
            videoId: videoId
        }
    })
    res.json({ numLikes: numLikes.length, numDislikes: numDislikes.length });

});

router.post('/register', async (req, res, next) => {
    const user = await Users.findOne({
        where: {
            address: req.body.address

        }
    });
    if (!user) {
        await Users.create({
            address: req.body.address
        });
    }

    res.json({ message: 'done' });

});

router.get('/view/:hash/:userAddress', async (req, res, next) => {
    const video = await Videos.findOne({
        where: {
            hash: req.params.hash
        }
    });
    const user = await Users.findOne({
        where: {
            address: req.params.userAddress
        }
    })
    const view = await Views.findOne({
        where: {
            videoId: video.id,
            userId: user.id
        }
    });

    const request = await Requests.findOne({
        where: {
            videoId: video.id,
            userId: user.id
        }
    })

    if (view || request) {
        res.json({ firstView: '0' })
    } else {
        res.json({ firstView: '1' });
    }
});

router.post('/video/submitViewRequest', async (req, res, next) => {

    const sig = req.body.sig;
    const videoId = req.body.videoId;
    const userAddress = req.body.userAddress;

    const user = await Users.findOne({
        where: {
            address: userAddress
        }
    })
    const request = await Requests.findOne({
        where: {
            request: sig,
            videoId: videoId,
            userId: user.id
        }
    });
    if (!request) {
        await Requests.create({
            request: sig,
            videoId: videoId,
            userId: user.id

        });
    }


    res.json({ message: 'Request submitted successfully' })



});

router.get('/videos/processViewTX', async (req, res, next) => {
    const requests = await Requests.findAll({});
    const accounts = await web3.eth.getAccounts();
    for (let i = 0; i < requests.length; i++) {
        const request = requests[i];
        const user = await Users.findOne({
            where: {
                id: request.userId
            }
        });
        const userAddress = user.address;
        const video = await Videos.findOne({
            where: {
                id: request.videoId
            }
        });
        const videoAddress = video.address;
        const videoContract = new web3.eth.Contract(
            JSON.parse(Video.interface),
            videoAddress
        )
        const sig = request.request;

        console.log('sig: ', sig);
        console.log('account: ', accounts[0]);


        console.log('Processing TX now');

        try {
            await videoContract.methods.viewVideo(sig, userAddress).send({
                from: accounts[0],
                gas: '1500000'
            });
        } catch (e) {
            console.log('ERROR: ', e);

        }
        await Requests.destroy({
            where: {
                id: request.id
            }
        })

        await Views.create({
            userId: user.id,
            videoId: video.id
        });
    }
    res.json({ msg: 'finished processing requests' });

});
router.get('/search/:input', async (req, res, next) => {
    const input = req.params.input;

    const searchResults = await Videos.findAll({
        where: {
            title: {
                [Op.like]: `%${input}%`
            }
        }

    });
    for (let i = 0; i < searchResults.length; i++) {
        const numViews = await Views.findAll({
            where: {
                videoId: searchResults[i].id

            }
        });
        searchResults[i].setDataValue('numViews', numViews.length);
    }
    res.json(searchResults);
});
router.get('/profile/prevLiked/:address', async (req, res, next) => {
    const address = req.params.address;
    const user = await Users.findOne({
        where: {
            address: address
        }
    })
    const likedVideos = await Likes.findAll({
        where: {
            userId: user.id
        }
    });

    let videos = [];
    for (let i = 0; i < likedVideos.length; i++) {
        videos[i] = await Videos.findOne({
            where: {
                id: likedVideos[i].videoId
            }
        });
        const numViews = await Views.findAll({
            where: {
                videoId: videos[i].id

            }
        });
        videos[i].setDataValue('numViews', numViews.length);
    }

    res.json(videos);
});
router.get('/profile/uploaded/:address', async (req, res, next) => {
    const address = req.params.address;
    const user = await Users.findOne({
        where: {
            address: address
        }
    })
    const uploadedVideos = await Uploads.findAll({
        where: {
            userId: user.id
        }
    });

    let videos = [];
    for (let i = 0; i < uploadedVideos.length; i++) {
        videos[i] = await Videos.findOne({
            where: {
                id: uploadedVideos[i].videoId
            }
        });
        const numViews = await Views.findAll({
            where: {
                videoId: videos[i].id

            }
        });
        videos[i].setDataValue('numViews', numViews.length);
    }

    res.json(videos);
});
module.exports = router;