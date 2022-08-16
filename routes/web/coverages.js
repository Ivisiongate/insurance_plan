const db = require('../../helpers/db');

const coverages = (router) => {

    router.get('/coverages', async (req,res)=>{
    
        let coverages = await db('coverages')
        .select('coverages.*');
              
        res.status(200).send({status: true, message: 'coverages listed successfully',data: coverages});
    });

    return router;
}

module.exports = coverages;