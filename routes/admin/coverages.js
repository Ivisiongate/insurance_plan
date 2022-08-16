const getSRF = require('../../helpers/sort-range-filters');
const setContentRange = require('../../helpers/content-range');
const db = require('../../helpers/db');
const verifyToken = require('../../helpers/verify-token');

const coverages = (router) => {

    router.get('/coverages',verifyToken, async (req,res)=>{

        const {sort,range,filter} = getSRF(req.query);

        console.log(sort,range,filter);

        let coverages = await db('coverages').orderBy(sort[0],sort[1]);
        
        if ( filter && filter.q ){
            coverages = await db('coverages').whereRaw(`LOWER(name) LIKE ?`, [`%${filter.q.toLowerCase()}%`]).orderBy(sort[0],sort[1]);
        }

        if ( filter && filter.id ){
            coverages = await db('coverages').whereIn('id', filter.id).orderBy(sort[0],sort[1]);
        }
    
        res = setContentRange(res,range,coverages);
        
        res.status(200).send({status: true, message: 'coverages listed successfully',data: coverages});
    });
    
    router.get('/coverages/:id',verifyToken, async (req,res)=>{
    
        let response = {status: true, message: 'Invalid coverage id',data: {}};
        const {id} = req.params;
    
        const coverage = await db('coverages').where({id}).first();
        if (coverage){
            response = {status: true, message: 'coverage listed successfully',data: coverage};
        }
    
        res.status(200).send(response);
    });
    
    router.post('/coverages',verifyToken, async (req,res)=>{
    
        let response = {status: false, message: 'name is required',data: {}};
        const {name} = req.body;
    
        if (name){
            const inserted_id = await db('coverages').insert({name});
            const coverage = await db('coverages').where({id:inserted_id}).first();
            response = {status: true, message: 'coverage added successfully',data: coverage};
        }
        
        res.status(200).send(response);
    });
    
    router.put('/coverages/:id',verifyToken, async (req,res)=>{
    
        let response = {status: false, message: 'Invalid coverage id',data: {}};
        const {id} = req.params;
        const {name} = req.body;
    
        let coverage = await db('coverages').where({id}).first();
        
        if ( !name ){
            response = {status: false, message: 'name is required to update', data: {}};
        }else if (coverage){
            await db('coverages').where({id:coverage.id}).update({name});
            coverage = await db('coverages').where({id:coverage.id}).first();
            response = {status: true, message: 'coverage updated successfully',data: coverage};
        }
        
        res.status(200).send(response);
    });
    
    router.delete('/coverages/:id',verifyToken, async (req,res)=>{
    
        let response = {status: false, message: 'Invalid coverage id',data: {}};
        const {id} = req.params;
    
        let coverage = await db('coverages').where({id}).first();
    
        if (coverage){
            await db('coverages').where({id:coverage.id}).delete();
            response = {status: true, message: 'coverage deleted successfully',data: coverage};
        }
        
        res.status(200).send(response);
    });

    return router;
}

module.exports = coverages;