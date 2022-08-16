module.exports = (res, range, results) => {
    res.header('Content-Range','company '+(range[0] >= results.length ? results.length-1 : (range[0] > range[1] ? range[1] : range[0]))+'-'+(results.length < range[1] ? results.length -1 : range[1])+'/'+results.length);
    return res;
}