const express = require('express');
const router = express.Router();
const db = require('../../helpers/db');
const jwt = require('jsonwebtoken');
const md5 = require('md5');
const { JWT_SECRET } = require('../../constants');

router.post('/login', async (req,res)=>{

    let statusCode = 401;
    let response = {status: false, message: 'Invalid Credentials', data: []};

    const {email,password} = req.body;

    if (email && password){
        let user = await db('users').where({email}).first();
        if ( user && user.password == md5(password) ){
            const token = jwt.sign({email: user.email, name: user.name},JWT_SECRET);
            await db('users').where({id: user.id}).update({token});
            user.token = token;
            statusCode = 200;
            response = {status: true, message: 'Loggedin Successfully', data: user};
        }
    }

    return res.status(statusCode).send(response);
});

router.post('/logout', async (req,res)=>{
    let statusCode = 401;
    let response = {status: false, message: 'invalid token', data: []};

    const {token} = req.body;

    if (token){
        let user = await db('users').where({token}).first();
        if ( user ){
            
            await db('users').where({id: user.id}).update({token:null});

            statusCode = 200;
            response = {status: true, message: 'Logout Successfully', data: user};
        }
    }

    return res.status(statusCode).send(response);
});

module.exports = router;