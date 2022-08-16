const getSRF = require('../../helpers/sort-range-filters');
const setContentRange = require('../../helpers/content-range');
const db = require('../../helpers/db');
const verifyToken = require('../../helpers/verify-token');

const plans = (router) => {

    router.get('/plans',verifyToken, async (req,res)=>{

        const {sort,range,filter} = getSRF(req.query);
    
        let plans = await db('plans')
        .join('plantypes','plantypes.id','plans.plantype')
        .join('regions','regions.id','plans.region')
        .join('companies','companies.id','plans.company')
        .select('plans.*','plantypes.name as planTypeName','regions.name as regionName','companies.name as companyName')
        .modify(function(queryBuilder) {
            if (filter && filter.q) {
                queryBuilder.whereRaw(`LOWER(plans.name) LIKE ? OR LOWER(plans.code) LIKE ?`, [`%${filter.q.toLowerCase()}%`,`%${filter.q.toLowerCase()}%`]).orderBy(sort[0],sort[1]);
            }
        })
        .orderBy(sort[0],sort[1]);
    
        res = setContentRange(res,range,plans);
        
        res.status(200).send({status: true, message: 'plans listed successfully',data: plans});
    });
    
    router.get('/plans/:id',verifyToken, async (req,res)=>{
    
        let response = {status: true, message: 'Invalid plan id',data: {}};
        const {id} = req.params;
    
        const plan = await db('plans')
        .join('plantypes','plantypes.id','plans.plantype')
        .join('regions','regions.id','plans.region')
        .join('companies','companies.id','plans.company')
        .select('plans.*','plantypes.name as planTypeName','regions.name as regionName','companies.name as companyName')
        .where({'plans.id':id}).first();
        
        if (plan){

            let hospitalcoverages = await db('hospitalcoverages')
            .join('coverages','hospitalcoverages.coverageid','coverages.id')
            .select('hospitalcoverages.*','coverages.name as coveragename')
            .where({planid:plan.id});

            let hospitalcoverage_percentages = [];
            plan['hospitalcoverages'] = hospitalcoverages;
            plan['hospitalcoverageids'] = hospitalcoverages.map((item)=>item.coverageid)
            
            for(let a=0;a<Math.max(...plan['hospitalcoverageids'])+1;a++){
                const obj = hospitalcoverages.find((item)=>item.coverageid == a);
                hospitalcoverage_percentages.push(obj?.percentage || null);
            }

            plan['hospitalcoverage_percentages'] = hospitalcoverage_percentages;

            let ambulatorycoverages = await db('ambulatorycoverages')
            .join('coverages','ambulatorycoverages.coverageid','coverages.id')
            .select('ambulatorycoverages.*','coverages.name as coveragename')
            .where({planid:plan.id});

            let ambulatorycoverage_percentages = [];
            plan['ambulatorycoverages'] = ambulatorycoverages;
            plan['ambulatorycoverageids'] = ambulatorycoverages.map((item)=>item.coverageid)
            
            for(let a=0;a<Math.max(...plan['ambulatorycoverageids'])+1;a++){
                const obj = ambulatorycoverages.find((item)=>item.coverageid == a);
                ambulatorycoverage_percentages.push(obj?.percentage || null);
            }

            plan['ambulatorycoverage_percentages'] = ambulatorycoverage_percentages;

            response = {status: true, message: 'plan listed successfully',data: plan};
        }
    
        res.status(200).send(response);
    });
    
    router.post('/plans',verifyToken, async (req,res)=>{

        let response = {status: false, message: 'all fields are required',data: {}};
        const {name,code,baseprice,price,region,company,plantype,hospitalcoverages,hospitalcoverage_percentages,ambulatorycoverages,ambulatorycoverage_percentages} = req.body;
    
        if (name && code && baseprice && price && region && company && plantype){
            const inserted_id = await db('plans').insert({name,code,baseprice,price,region,company,plantype});
            const plan = await db('plans').where({id:inserted_id}).first();

            if ( hospitalcoverages && hospitalcoverages.length ){
                hospitalcoverages.map(async(item)=>{
                    await db('hospitalcoverages').insert({planid:plan.id,coverageid:item,percentage:hospitalcoverage_percentages[item]});
                    return item;
                })
            }

            if ( ambulatorycoverages && ambulatorycoverages.length ){
                ambulatorycoverages.map(async(item)=>{
                    await db('ambulatorycoverages').insert({planid:plan.id,coverageid:item,percentage:ambulatorycoverage_percentages[item]});
                    return item;
                })
            }

            response = {status: true, message: 'plan added successfully',data: plan};
        }
        
        res.status(200).send(response);
    });
    
    router.put('/plans/:id',verifyToken, async (req,res)=>{
    
        let response = {status: false, message: 'Invalid plan id',data: {}};
        const {id} = req.params;
        const {name,code,baseprice,price,region,company,plantype,hospitalcoverageids,hospitalcoverage_percentages,ambulatorycoverageids,ambulatorycoverage_percentages} = req.body;
    
        
        let plan = await db('plans').where({id}).first();
        
        if (!name || !code || !baseprice || !price || !region || !company || !plantype){
            response = {status: false, message: 'all fields are required to update', data: {}};
        }else if (plan){
            await db('plans').where({id:plan.id}).update({name,code,baseprice,price,region,company,plantype});
            plan = await db('plans').where({id:plan.id}).first();

            await db('hospitalcoverages').where({planid:plan.id}).delete();
            await db('ambulatorycoverages').where({planid:plan.id}).delete();

            if ( hospitalcoverageids && hospitalcoverageids.length ){
                hospitalcoverageids.map(async(item)=>{
                    await db('hospitalcoverages').insert({planid:plan.id,coverageid:item,percentage:hospitalcoverage_percentages[item]});
                    return item;
                })
            }

            if ( ambulatorycoverageids && ambulatorycoverageids.length ){
                ambulatorycoverageids.map(async(item)=>{
                    await db('ambulatorycoverages').insert({planid:plan.id,coverageid:item,percentage:ambulatorycoverage_percentages[item]});
                    return item;
                })
            }

            response = {status: true, message: 'plan updated successfully',data: plan};
        }
        
        res.status(200).send(response);
    });
    
    router.delete('/plans/:id',verifyToken, async (req,res)=>{
    
        let response = {status: false, message: 'Invalid plan id',data: {}};
        const {id} = req.params;
    
        let plan = await db('plans').where({id}).first();

        
        if (plan){
            await db('hospitalcoverages').where({planid:plan.id}).delete();
            await db('ambulatorycoverages').where({planid:plan.id}).delete();
            await db('plans').where({id:plan.id}).delete();
            response = {status: true, message: 'plan deleted successfully',data: plan};
        }
        
        res.status(200).send(response);
    });

    return router;
}

module.exports = plans;