const getSRF = require('../../helpers/sort-range-filters');
const setContentRange = require('../../helpers/content-range');
const db = require('../../helpers/db');
const verifyToken = require('../../helpers/verify-token');

const regions = (router) => {

    router.get('/regions',verifyToken, async (req,res)=>{

        const {sort,range,filter} = getSRF(req.query);
    
        let regions = await db('regions').orderBy(sort[0],sort[1]);
        
        if ( filter && filter.q ){
            regions = await db('regions').whereRaw(`LOWER(name) LIKE ?`, [`%${filter.q.toLowerCase()}%`]).orderBy(sort[0],sort[1]);
        }
    
        res = setContentRange(res,range,regions);
        
        res.status(200).send({status: true, message: 'regions listed successfully',data: regions});
    });
    
    router.get('/regions/:id',verifyToken, async (req,res)=>{
    
        let response = {status: true, message: 'Invalid region id',data: {}};
        const {id} = req.params;
    
        const region = await db('regions').where({id}).first();
        if (region){
            response = {status: true, message: 'region listed successfully',data: region};
        }
    
        res.status(200).send(response);
    });
    
    router.post('/regions',verifyToken, async (req,res)=>{
    
        let response = {status: false, message: 'name is required',data: {}};
        const {name} = req.body;
    
        if (name){
            const inserted_id = await db('regions').insert({name});
            const region = await db('regions').where({id:inserted_id}).first();
            response = {status: true, message: 'region added successfully',data: region};
        }
        
        res.status(200).send(response);
    });
    
    router.put('/regions/:id',verifyToken, async (req,res)=>{
    
        let response = {status: false, message: 'Invalid region id',data: {}};
        const {id} = req.params;
        const {name} = req.body;
    
        let region = await db('regions').where({id}).first();
        
        if ( !name ){
            response = {status: false, message: 'name is required to update', data: {}};
        }else if (region){
            await db('regions').where({id:region.id}).update({name});
            region = await db('regions').where({id:region.id}).first();
            response = {status: true, message: 'region updated successfully',data: region};
        }
        
        res.status(200).send(response);
    });
    
    router.delete('/regions/:id',verifyToken, async (req,res)=>{
    
        let response = {status: false, message: 'Invalid region id',data: {}};
        const {id} = req.params;
    
        let region = await db('regions').where({id}).first();
    
        if (region){
            await db('regions').where({id:region.id}).delete();
            response = {status: true, message: 'region deleted successfully',data: region};
        }
        
        res.status(200).send(response);
    });

    return router;
}

module.exports = regions;