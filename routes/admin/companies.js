const getSRF = require('../../helpers/sort-range-filters');
const setContentRange = require('../../helpers/content-range');
const db = require('../../helpers/db');
const upload = require('../../helpers/upload');
const verifyToken = require('../../helpers/verify-token');
const { BASE_URL } = require('../../constants');

const companies = (router) => {

    router.get('/companies',verifyToken, async (req,res)=>{

        const {sort,range,filter} = getSRF(req.query);
    
        let companies = await db('companies').orderBy(sort[0],sort[1]);
        
        if ( filter && filter.q ){
            companies = await db('companies').whereRaw(`LOWER(name) LIKE ?`, [`%${filter.q.toLowerCase()}%`]).orderBy(sort[0],sort[1]);
        }
    
        res = setContentRange(res,range,companies);
        
        res.status(200).send({status: true, message: 'companies listed successfully',data: companies});
    });
    
    router.get('/companies/:id',verifyToken, async (req,res)=>{
    
        let response = {status: true, message: 'Invalid company id',data: {}};
        const {id} = req.params;
    
        const company = await db('companies').where({id}).first();
        if (company){
            response = {status: true, message: 'company listed successfully',data: company};
        }
    
        res.status(200).send(response);
    });
    
    router.post('/companies',[verifyToken,upload.single('logo.rawFile')], async (req,res)=>{
    
        let response = {status: false, message: 'name is required',data: {}};
        const {name} = req.body;
    
        if (name){
            let logo = null;
            if ( req.file ){
                logo = BASE_URL+'/'+req.file.filename
            }
            const inserted_id = await db('companies').insert({name,logo});
            const company = await db('companies').where({id:inserted_id}).first();
            response = {status: true, message: 'company added successfully',data: company};
        }
        
        res.status(200).send(response);
    });
    
    router.put('/companies/:id',[verifyToken,upload.single('logo.rawFile')], async (req,res)=>{
    
        let response = {status: false, message: 'Invalid company id',data: {}};
        const {id} = req.params;
        const {name} = req.body;
    
        let company = await db('companies').where({id}).first();
        
        let logo = company.logo;
        if ( req.file ){
            logo = BASE_URL+'/'+req.file.filename
        }
        if ( !name ){
            response = {status: false, message: 'name is required to update', data: {}};
        }else if (company){
            await db('companies').where({id:company.id}).update({name,logo});
            company = await db('companies').where({id:company.id}).first();
            response = {status: true, message: 'company updated successfully',data: company};
        }
        
        res.status(200).send(response);
    });
    
    router.delete('/companies/:id',verifyToken, async (req,res)=>{
    
        let response = {status: false, message: 'Invalid company id',data: {}};
        const {id} = req.params;
    
        let company = await db('companies').where({id}).first();
    
        if (company){
            await db('companies').where({id:company.id}).delete();
            response = {status: true, message: 'company deleted successfully',data: company};
        }
        
        res.status(200).send(response);
    });

    return router;
}

module.exports = companies;