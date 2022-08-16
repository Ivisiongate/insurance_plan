const getSRF = require('../../helpers/sort-range-filters');
const setContentRange = require('../../helpers/content-range');
const db = require('../../helpers/db');
const verifyToken = require('../../helpers/verify-token');

const plantypes = (router) => {

    router.get('/plantypes',verifyToken, async (req,res)=>{

        const {sort,range,filter} = getSRF(req.query);
    
        let plantypes = await db('plantypes').orderBy(sort[0],sort[1]);
        
        if ( filter && filter.q ){
            plantypes = await db('plantypes').whereRaw(`LOWER(name) LIKE ?`, [`%${filter.q.toLowerCase()}%`]).orderBy(sort[0],sort[1]);
        }
    
        res = setContentRange(res,range,plantypes);
        
        res.status(200).send({status: true, message: 'plan types listed successfully',data: plantypes});
    });
    
    router.get('/plantypes/:id',verifyToken, async (req,res)=>{
    
        let response = {status: true, message: 'Invalid plantype id',data: {}};
        const {id} = req.params;
    
        const plantype = await db('plantypes').where({id}).first();
        if (plantype){
            response = {status: true, message: 'plan type listed successfully',data: plantype};
        }
    
        res.status(200).send(response);
    });
    
    router.post('/plantypes',verifyToken, async (req,res)=>{
    
        let response = {status: false, message: 'name is required',data: {}};
        const {name} = req.body;
    
        if (name){
            const inserted_id = await db('plantypes').insert({name});
            const plantype = await db('plantypes').where({id:inserted_id}).first();
            response = {status: true, message: 'plan type added successfully',data: plantype};
        }
        
        res.status(200).send(response);
    });
    
    router.put('/plantypes/:id',verifyToken, async (req,res)=>{
    
        let response = {status: false, message: 'Invalid plan type id',data: {}};
        const {id} = req.params;
        const {name} = req.body;
    
        let plantype = await db('plantypes').where({id}).first();
        
        if ( !name ){
            response = {status: false, message: 'name is required to update', data: {}};
        }else if (plantype){
            await db('plantypes').where({id:plantype.id}).update({name});
            plantype = await db('plantypes').where({id:plantype.id}).first();
            response = {status: true, message: 'plan type updated successfully',data: plantype};
        }
        
        res.status(200).send(response);
    });
    
    router.delete('/plantypes/:id',verifyToken, async (req,res)=>{
    
        let response = {status: false, message: 'Invalid plan type id',data: {}};
        const {id} = req.params;
    
        let plantype = await db('plantypes').where({id}).first();
    
        if (plantype){
            await db('plantypes').where({id:plantype.id}).delete();
            response = {status: true, message: 'plan type deleted successfully',data: plantype};
        }
        
        res.status(200).send(response);
    });

    return router;
}

module.exports = plantypes;