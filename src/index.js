const express = require('express');
const bodyParser = require('body-parser');
var cors = require('cors');

const app = express();
app.use(cors({
    'Access-Control-Allow-Origin': '*'
}));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

require('./app/controllers/index')(app);


app.use(function(req, res) {
    return res.status(404).send({error: 'Route not found'});
});

app.listen(3000);