const express = require('express');
const router = express.Router();
const Event = require('../models/event');
const User = require('../models/user');
const Tag = require('../models/tag');
const Buy = require('../models/buy');
const Sequelize = require('sequelize');


router.get('/', (req, res, next) => {
    let ets = [];
    let count = 0;
    Event.findAll().then(events => {
        let length = events.length;
        if (events.length > 0) {
            events.forEach(event => {
                let e = {};
                e.id = event.dataValues.id;
                e.name = event.dataValues.name;
                e.description = event.dataValues.description;
                event.getCategory({
                    raw: true
                }).then(category => {
                    e.category = category.type;
                    event.getPhotos({
                        raw: true
                    }).then(photos => {
                        e.image = photos[0].url;
                        event.getTags({
                            raw: true
                        }).then(tags => {
                            count++;
                            e.tags = [];
                            tags.forEach(t => {
                                e.tags.push(t.tag);
                            })
                            ets.push(e)
                            if (count == length) {
                                res.status(200).json(ets);
                            }
                        });
                    });
                });
            })
        } else {
            res.status(200).json(ets);
        }
    })
})

router.get('/details/:eventId', (req, res, next) => {
    Event.findOne({
        where: {
            id: req.params.eventId
        }
    }).then(event => {
        let e = event.dataValues;
        event.getCategory({
            raw: true
        }).then(category => {
            e.category = category.type;
            event.getPhotos({
                raw: true
            }).then(photos => {
                e.photos = [];
                photos.forEach(photo => {
                    e.photos.push(photo.url);
                })
                event.getTags({
                    raw: true
                }).then(tags => {
                    e.tags = [];
                    tags.forEach(t => {
                        e.tags.push(t.tag);
                    })
                    res.status(200).json(e);
                })
            })
        })
    })
})

router.post('/create', (req, res, next) => {
    console.log(req.body);
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
            let i = 0;
            let price = req.body.ticket.price;
            req.body.ticket.quantity.forEach(q => {
                event.createTicket({
                    quantity: q,
                    price: price[i],
                    description: req.body.ticket.description,
                    endDate: event.dataValues.date,
                    type: i
                })
                i++;
            })
        }).catch(err => {
            console.log(err);
            res.status(500).json({
                error: err
            });
        })
    res.status(200).json({
        message: "event created"
    })
})

router.get('/stats/:eventId', (req, res, next) => {
    const eventId = req.params.eventId;
    let stats = [];
    let tid = [];
    let count = 0;
    Event.findOne({
        where: {
            id: eventId
        }
    }).then(event => {
        event.getTickets({
            raw: true
        }).then(tickets => {
            tickets.forEach(ticket => {
                tid.push(ticket.id);
            })
            Buy.findAll({
                where: {
                    ticketId: tid
                },
                raw: true
            }).then(result => {
                result.forEach(r => {
                    let rob = {};
                    rob.quantity = r.quantity;
                    rob.type = r.type;
                    rob.id = r.id;
                    User.findOne({
                        where: {
                            id: r.userId
                        },
                        raw: true
                    }).then(user => {
                        count++;
                        rob.email = user.email;
                        rob.phone = user.phone;
                        stats.push(rob);
                        if (count == result.length)
                            res.status(200).json(stats);
                    })
                })
            })
        })
    })
})


router.get('/revenue/:eventId', (req, res, next) => {
    const eventId = req.params.eventId;
    let tid = [];
    let prices = [];
    let quantity = [];
    let result = [];
    const type = [];
    Event.findOne({
        where: {
            id: eventId
        }
    }).then(event => {
        event.getTickets({
            raw: true,
            order: Sequelize.literal('type ASC')
        }).then(tickets => {
            tickets.forEach(ticket => {
                tid.push(ticket.id);
                prices.push(ticket.price);
                type.push(ticket.type);
            })
            Buy.findAll({
                where: {
                    ticketId: tid
                },
                attributes: ['type', [Sequelize.fn('sum', Sequelize.col('quantity')), 'quantity']],
                raw: true,
                group: 'type',
                order: Sequelize.literal('type ASC')
            }).then(rows => {
                rows.forEach(row => {
                    quantity.push(row);
                })
            }).then(() => {
                let sum = 0;
                console.log(type);
                console.log(quantity);
                console.log(prices);
                for (t in type) {
                    let rob = {};
                    rob.type = type[t];
                    for (let i = 0; i < quantity.length; i++) {
                        if (quantity[i].type == t) {
                            rob.quantity = quantity[i].quantity;
                            break;
                        }
                    }
                    if(rob.quantity == undefined)
                        rob.quantity = 0;
                    sum += rob.quantity * prices[t];
                    result.push(rob);
                }
                res.status(200).json({stats:result,total:sum});
            })
        })
    })
})

router.post('/rating', (req, res, next) => {
    console.log(req.body);
    const eventId = req.body.eventId;
    const r = req.body.rating;
    Event.findOne({
        where: {
            id: eventId
        }
    }).then(event => {
        console.log(event.rating);
        event.update({
            rating: (r + event.rating) / 2
        }).then(() => {
            res.status(200).json({
                message: 'updated sucessfully'
            });
        })
    })
})

module.exports = router;