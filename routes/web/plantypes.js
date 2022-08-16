const db = require('../../helpers/db');

const plantypes = (router) => {

    router.get('/plantypes', async (req,res)=>{
    
        let plantypes = await db('plantypes')
        .select(
            'plantypes.*',
            db('plans')
            .count('*')
            .whereRaw('?? = ??', ['plans.plantype', 'plantypes.id'])
            .as('plans')
        );
              
        res.status(200).send({status: true, message: 'plantypes listed successfully',data: plantypes});
    });

    return router;
}

module.exports = plantypes;