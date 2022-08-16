const db = require('../../helpers/db');

const companies = (router) => {

    router.get('/companies', async (req,res)=>{
    
        let companies = await db('companies')
        .select(
            'companies.*',
            db('plans')
            .count('*')
            .whereRaw('?? = ??', ['plans.company', 'companies.id'])
            .as('plans')
        );
              
        res.status(200).send({status: true, message: 'companies listed successfully',data: companies});
    });

    return router;
}

module.exports = companies;