const db = require('../../helpers/db');

const currency = (router) => {

    router.get('/currency', async (req,res)=>{
    
        let currency = await db('currency').select('price').where({id:1}).first();
              
        res.status(200).send({status: true, message: 'currency listed successfully',data: currency});
    });

    return router;
}

module.exports = currency;