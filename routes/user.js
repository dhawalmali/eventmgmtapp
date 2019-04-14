const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/user');

router.post('/signup', (req, res, next) => {
    User.findOne({
        where: {
            email: req.body.email
        }
    }).then(user => {
        console.log(user);
        if (user) {
            return res.status(409).json({
                code: 1,
                message: 'Mail Exists'
            })
        } else {
            bcrypt.hash(req.body.password, 10, (err, hash) => {
                if (err) {
                    return res.status(500).json({
                        code: 0,
                        error: err
                    })
                } else {
                    User.create({
                        name: req.body.name,
                        email: req.body.email,
                        phone: req.body.phone,
                        password: hash
                    }).then(result => {
                        res.status(201).json({
                            code: 2,
                            message: 'User Created'
                        })
                    }).catch(err => {
                        res.status(500).json({
                            error: err
                        })
                    })
                }
            })
        }
    })
})


router.post('/login', (req, res, next) => {
    User.findOne({
        where: {
            email: req.body.email
        }
    }).then(user => {
        if (user) {
            bcrypt.compare(req.body.password, user.password, (err, result) => {
                if (err) {
                    return res.status(401).json({
                        code: 0,
                        message: 'Auth Failed'
                    })
                }
                if (result) {
                    const token = jwt.sign({
                        email: user.email,
                        id: user.id,
                        phone: user.phone
                    }, process.env.JWT_KEY, {
                        expiresIn: "1h"
                    })
                    return res.status(200).json({
                        code: 2,
                        user: user,
                        message: 'Auth Successful',
                        token: token
                    })
                } else {
                    return res.status(401).json({
                        code: 0,
                        message: 'Auth Failed'
                    })
                }
            })
        } else {
            return res.status(401).json({
                code: 0,
                message: 'Auth Failed'
            })
        }
    })
})

router.post('/verify',(req,res,next)=>{
    try{
        const user = jwt.verify(req.body.token,process.env.JWT_KEY);
        return res.status(200).json({
            user: user,
            message: 'Auth Successful'
        })
    }
    catch(error)
    {
        return res.status(401).json({
            message: 'Auth Failed'
        })
    }
})

router.get('/events/:userId',(req,res,next)=>{
    const userId = req.params.userId;
    let aevents = [];
    let pevents = [];
    User.findOne({where:{id:userId}}).then(user=>{
        user.getEvents({raw: true}).then(events=>{
            events.forEach(event=>{
                if(new Date(event.date) >= new Date())
                    aevents.push(event);
                else
                    pevents.push(event);
            })
            res.status(200).json({
                aevents:aevents,
                pevents:pevents
            });
        })
    })
})

module.exports = router;