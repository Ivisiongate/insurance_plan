const db = require('./db');
const jwt = require('jsonwebtoken');
const { JWT_SECRET } = require('../constants');
module.exports = async (req,res,next) => {

    if ( req.headers && req.headers['authorization'] ){
        const bearer = req.headers['authorization'];
        const token = bearer.split(' ')[1];

        const user = await db('users').where({token}).first();

        const decoded = jwt.verify(token,JWT_SECRET);
        if ( user && decoded.email == user.email ){
            req.user = user;
            return next();
        }
    }

    res.status(403).send({status: false, message: 'You are not authorized', data: []});
}