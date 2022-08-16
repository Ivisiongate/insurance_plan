const db = require('../../helpers/db');

const regions = (router) => {

    router.get('/regions', async (req,res)=>{
    
        let regions = await db('regions')
        .select(
            'regions.*',
            db('plans')
            .count('*')
            .whereRaw('?? = ??', ['plans.region', 'regions.id'])
            .as('plans')
        );
              
        res.status(200).send({status: true, message: 'regions listed successfully',data: regions});
    });

    return router;
}

module.exports = regions;