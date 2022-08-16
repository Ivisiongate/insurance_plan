module.exports = (query) => {

    let sort = ['id','ASC'];
    let range = [0,9];
    let filter = {};

    if ( query && query.sort ){
        sort = JSON.parse(query.sort);
    }
    if ( query && query.range ){
        range = JSON.parse(query.range);
    }
    if ( query && query.filter ){
        filter = JSON.parse(query.filter);
    }

    return {sort,range,filter};
}