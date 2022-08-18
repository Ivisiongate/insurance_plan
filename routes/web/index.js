const express = require('express');
let router = express.Router();

router.get('/',(req,res)=>{
    res.send('No Naught Business Please');
});

router = require('./companies')(router);
router = require('./regions')(router);
router = require('./plantypes')(router);
router = require('./coverages')(router);
router = require('./plans')(router);
router = require('./currency')(router);

module.exports = router;