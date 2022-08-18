const getSRF = require('../../helpers/sort-range-filters');
const setContentRange = require('../../helpers/content-range');
const db = require('../../helpers/db');
const upload = require('../../helpers/upload');
const verifyToken = require('../../helpers/verify-token');
const { BASE_URL } = require('../../constants');

const currency = (router) => {
    
    router.get('/currency/1',verifyToken, async (req,res)=>{
    
        const currency = await db('currency').where({id:1}).first();
        response = {status: true, message: 'currency listed successfully',data: currency};
    
        res.status(200).send(response);
    });
    
    router.put('/currency/1',verifyToken, async (req,res)=>{
    
        let response = {status: false, message: 'Invalid currency id',data: {}};
        const {price} = req.body;
    
        if ( !price ){
            response = {status: false, message: 'price is required to update', data: {}};
        }else{
            await db('currency').where({id:1}).update({price});
            const currency = await db('currency').where({id:1}).first();
            response = {status: true, message: 'currency updated successfully',data: currency};
        }
        
        res.status(200).send(response);
    });

    return router;
}

module.exports = currency;