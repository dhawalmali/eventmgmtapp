const express = require('express');
const router = express.Router();
const Event = require('../models/event');
const Ticket = require('../models/ticket');
const Buy = require('../models/buy');
const nodemailer = require('nodemailer');
const User = require('../models/user');
const qrcode = require('qrcode');

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'dhawalmali99@gmail.com',
        pass: 'Smart@123'
    }
});

function sendEmail(id) {
    const mailOptions = {
        from: 'dhawalmali99@gmail.com',
        to: id,
        subject: 'Subject of your email',
        html: '<p>Your html here</p>'
    };
    transporter.sendMail(mailOptions, function (err, info) {
        if (err)
            console.log("err", err)
        else
            console.log(info);
    });
}

router.get('/:eventId', (req, res, next) => {
    let tts = [];
    const eventId = req.params.eventId;
    Event.findOne({
        where: {
            id: eventId
        }
    }).then(event => {
        let ename = event.dataValues.name;
        event.getTickets({
            raw: true
        }).then(tickets => {
            tickets.forEach(ticket => {
                tts.push(ticket)
            })
            res.status(200).json({
                ename: ename,
                tickets: tts
            })
        })
    }).catch(err => {
        console.log(err);
        res.status(500).json({
            error: err
        })
    })
})



router.post('/buy', (req, res, next) => {
    const eventId = req.body.eventId;
    const userId = req.body.userId;
    const type = req.body.type;
    const quantity = req.body.quantity;
    Ticket.findOne({
        where: {
            eventId: eventId,
            type: type
        }
    }).then(ticket => {
        if (ticket.quantity >= quantity) {
            let rem = ticket.quantity - quantity;
            Buy.create({
                ticketId: ticket.id,
                userId: userId,
                quantity: quantity,
                type: type
            }).then(ticket.update({
                quantity: rem
            })).then(() => {
                User.findOne({
                    where: {
                        id: userId
                    },
                    attributes: ['email'],
                    raw: true
                }).then(user => {
                    sendEmail(user.email);
                    res.status(200).json({
                        message: "bought successfully"
                    })
                })
            })
        } else {
            res.status(500).json({
                err: "Not sufficient tickets"
            })
        }
    })
})

router.get('/sendInvoice/:userId/:ticketId', (req, res, next) => {
    const ticketId = req.params.ticketId;
    const userId = req.params.userId;
    User.findOne({
        where: {
            id: userId
        },
        attributes: ['email'],
        raw: true
    }).then(user => {
        sendEmail(user.email);
        res.status(200).json({
            message: 'sent successfully'
        })
    })
})

router.get('/qrcode/:ticketId', (req, res, next) => {
    const ticketId = req.params.ticketId;
    Buy.findOne({
        where: {
            id: ticketId
        },
        attributes: ['type', 'quantity'],
        raw: true
    }).then(ticket => {
        qrcode.toDataURL(JSON.stringify(ticket)).then(url => {
            res.status(200).json({
                url: url
            });
        }).catch(err => {
            console.log(err);
        })
    })
})

router.get('/user/:userId', (req, res, next) => {
    const userId = req.params.userId;
    let result = [];
    let count = 0
    Buy.findAll({
        where: {
            userId: userId
        },
        raw: true
    }).then(tickets => {
        if (tickets.length > 0) {
            tickets.forEach(t => {
                let rts = t;
                qrcode.toDataURL(JSON.stringify(t)).then(url => {
                    rts.url = url;
                    Ticket.findOne({
                        where: {
                            id: t.ticketId
                        },
                        raw: true
                    }).then(tic => {
                        rts.price = tic.price;
                        Event.findOne({
                            where: {
                                id: tic.eventId
                            },
                            raw: true
                        }).then(e => {
                            count++;
                            rts.eventId = e.id;
                            rts.name = e.name;
                            rts.date = e.date;
                            rts.total = rts.price * rts.quantity;
                            result.push(rts);
                            if (count == tickets.length)
                                res.status(200).json(result);
                        })
                    })
                })
            })
        } else {
            res.status(200).json([]);
        }
    })
})


module.exports = router;