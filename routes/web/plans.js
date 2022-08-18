const db = require('../../helpers/db');

const plans = (router) => {

    router.get('/plans/prices', async (req,res)=>{

        const pricing = await db('plans').min('price as minPrice').max('price as maxPrice');

        const minPrice = pricing[0].minPrice;
        const maxPrice = pricing[0].maxPrice;

        res.status(200).send({status: true, message: 'plans min max pricing listed successfully',data: [minPrice,maxPrice]});
    });

    router.get('/plans', async (req,res)=>{

        const limit = 10;
        let {page = 1,search,companies,plantypes,regions,coverages,minPrice,maxPrice,sortPrice} = req.query;
        const offset = limit * (page - 1);

        const getModel = () => db('plans')
        .join('plantypes','plantypes.id','plans.plantype')
        .join('regions','regions.id','plans.region')
        .join('hospitalcoverages','hospitalcoverages.planid','plans.id')
        .join('ambulatorycoverages','ambulatorycoverages.planid','plans.id')
        .join('companies','companies.id','plans.company')
        .select('plans.*','plantypes.name as planTypeName','regions.name as regionName','companies.name as companyName','companies.logo as companyLogo','companies.ges as companyGes')
        .modify(function(queryBuilder) {
            if (search) {
                queryBuilder.whereRaw(`LOWER(plans.name) LIKE ? OR LOWER(plans.code) LIKE ?`, [`%${search.toLowerCase()}%`,`%${search.toLowerCase()}%`]).orderBy('id','DESC');
            }
            if (companies && companies.length) {
                queryBuilder.whereIn('plans.company',companies)
            }
            if (plantypes && plantypes.length) {
                queryBuilder.whereIn('plans.plantype',plantypes)
            }
            if (regions && regions.length) {
                queryBuilder.whereIn('plans.region',regions)
            }
            if (coverages && coverages.length) {
                queryBuilder.whereIn('hospitalcoverages.coverageid',coverages)
                queryBuilder.orWhereIn('ambulatorycoverages.coverageid',coverages)
            }
            if (minPrice && minPrice > 0){
                queryBuilder.where('plans.price','>=',minPrice);
            }
            if (maxPrice && maxPrice > 0){
                queryBuilder.where('plans.price','<=',maxPrice);
            }
        })
        .groupBy('plans.id')
        .orderBy(sortPrice ? 'plans.price' : 'plans.id',sortPrice ? sortPrice : 'DESC');

        const totalCount = await getModel().count('plans.id as count');
        let plans = await getModel()
        .limit(limit)
        .offset(offset)
        .select();

        if (plans && plans.length){
            plans = await Promise.all(plans.map( async (plan)=>{
                let hospitalcoverages = await db('hospitalcoverages')
                .join('coverages','hospitalcoverages.coverageid','coverages.id')
                .select('hospitalcoverages.*','coverages.name as coveragename')
                .where({planid:plan.id});

                let ambulatorycoverages = await db('ambulatorycoverages')
                .join('coverages','ambulatorycoverages.coverageid','coverages.id')
                .select('ambulatorycoverages.*','coverages.name as coveragename')
                .where({planid:plan.id});

                return {
                    ...plan,
                    hospitalcoverages,
                    ambulatorycoverages
                }
            }));
        }

        res.status(200).send({status: true, message: 'plans listed successfully',data: {totalPages: Math.ceil(totalCount[0].count/limit),plans}});
    });

    return router;
}

module.exports = plans;