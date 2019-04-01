const express = require('express');
const router = express.Router();
const Event = require('../models/event');
const User = require('../models/user');
const Tag = require('../models/tag');


router.get('/', (req, res, next) => {
    let ets = [];
    let count = 0;
    Event.findAll().then(events => {
        let length = events.length;
        if (events.length > 0) {
            events.forEach(event => {
                let e = event.dataValues;
                event.getCategory({
                    raw: true
                }).then(category => {
                    e.category = category;
                    event.getPhotos({
                        raw: true
                    }).then(photos => {
                        e.photos = photos;
                        event.getTags({
                            raw: true
                        }).then(tags => {
                            count++;
                            e.tags = tags;
                            ets.push(e)
                            if (count == length) {
                                res.status(200).json({
                                    events: ets
                                });
                            }
                        });
                    });
                });
            })
        } else {
            res.status(200).json({
                events: []
            });
        }
    })
})



router.post('/create', (req, res, next) => {
    User.findOne({
            where: {
                id: req.body.userId
            }
        }).then(user => {
            return user.createEvent({
                name: req.body.name,
                date: req.body.date,
                lat: req.body.lat,
                long: req.body.long,
                description: req.body.description,
                time: req.body.time,
                venue: req.body.venue
            })
        })
        .then(event => {
            event.createCategory({
                type: req.body.category
            });
            req.body.tags.forEach(tag => {
                event.createTag({
                    tag: tag
                })
            })
            req.body.photos.forEach(photo => {
                event.createPhoto({
                    url: photo
                })
            })
        }).catch(err => {
            console.log(err);
            res.status(500).json({error: err});
        })
        res.status(200).json({
            message: "event created"
        })
})


module.exports = router;