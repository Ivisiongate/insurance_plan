const express = require('express');
const app = express();
const authRoutes = require('./routes/auth');
const adminRoutes = require('./routes/admin');
const webRoutes = require('./routes/web');
const cors = require('cors');
require('dotenv').config();

app.use(express.json());
const hostname = '127.0.0.1';
const port = process.env.PORT || 4200;

app.get('/',(req,res)=>{
    res.send('Node app');
})

app.use('/api/auth',authRoutes);
app.use('/api/admin',adminRoutes);
app.use('/api/web',webRoutes);

app.use(cors());
app.use(express.static('uploads'))

app.listen(port, hostname, ()=>{
    console.log('server is running at port http://'+hostname+':'+port);
});