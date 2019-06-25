const express = require('express');
const authMiddleware = require('../middlewares/auth')
const Repasse = require('../models/repasse');
const Socio = require('../models/socio');

const router = express.Router();

router.get('/', async (req,res) => {
    const numeroBeneficio = req.param('numeroBeneficio');
    const cpf = req.param('cpf');
    const competencia = req.param('competencia');
    where = {};
    try{
        if(numeroBeneficio)
            where = {"numeroBeneficio":numeroBeneficio};
        else if(cpf)
            where = {"cpf":cpf};
        else if(competencia)
            where = {"competencia":competencia}
            
        repasse = await Repasse.find(where);

        return res.send({ repasse });
    }catch(err){
        return res.status(400).send({error: 'Erro ao buscar repasse.'});
    }
});

module.exports = app => app.use('/repasse', router);