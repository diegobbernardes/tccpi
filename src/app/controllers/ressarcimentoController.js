const express = require('express');
const authMiddleware = require('../middlewares/auth')
const Ressarcimento = require('../models/ressarcimento')
const Repasse = require('../models/repasse');
const Socio = require('../models/socio');

const router = express.Router();

router.use(authMiddleware);

function checkPermission(routePermission, userPermission, res){
    try{
        if(userPermission<routePermission)
            return res.status(400).send({ error: "Usuario sem permissão para acessar estes recursos." });
    }catch(err){
        return res.status(400).send({error: 'Ocorreu um erro ao verificar a permissão.'});
    }
}

async function asyncForEach(array, callback) {
    for (let index = 0; index < array.length; index++) {
        await callback(array[index], index, array);
    }
}

router.post('/', async (req, res) => {
    checkPermission(3,req.permission,res); 
    try{
        const { idsocio,competencias } = req.body; 
        if(!idsocio || !competencias)
            return res.status(400).send({error: 'Dados não informados'});
        
        //verifica se existe socio
        const socio = await Socio.findOne({ '_id' : idsocio});
        if(!socio)
            return res.status(400).send({error: 'Socio não encontrado'});

        //verifica se existe desconto e verifica quantidade de descontos
        const repasseVerificador = await Repasse.find({ 'numeroBeneficio' : socio.numeroBeneficio });
        if(!repasseVerificador)
            return res.status(400).send({error: 'Nenhum desconto encontrado'});
        numCompetenciasDescontadas = 0;
        await asyncForEach(repasseVerificador, async (element) => {
            numCompetenciasDescontadas +=1;
        });

        //verifica quantos descontos já foram ressarcidos
        numCompetenciasPagamento = 0;
        const ressarcimentoVerificador = await Ressarcimento.find({"socio":idsocio});
        if(ressarcimentoVerificador){
            await asyncForEach(ressarcimentoVerificador, async (element) => {
                numCompetenciasPagamento +=element.competencias;
            });
        }

        //verifica se já foi adicionada todas os descontos para ressarcimento
        if((numCompetenciasDescontadas-numCompetenciasPagamento)<=0){
            return res.status(400).send({error: 'Não há competencias para pagamento'});
        }

        //verifica o limite de descontos para ressarcimento
        limit = 0
        if((numCompetenciasDescontadas-numCompetenciasPagamento)<competencias){
            limit = numCompetenciasDescontadas-numCompetenciasPagamento;
        }else{
            limit = competencias
        }
        
        //busca descontos para ressarcimento com o limite
        const repasse = await Repasse.find({ 'numeroBeneficio' : socio.numeroBeneficio }).limit(limit);

        valorPagamento = 0;
        numCompetencias = 0;
        await asyncForEach(repasse, async (element) => {
            valorPagamento += element.valor;
            numCompetencias +=1;
        });
        if(numCompetencias == 0)
            return res.status(400).send({error: 'Nenhum desconto encontrado para este Socio'});
        
        const ressarcimento = await Ressarcimento.create({
            "pago":0,
            "competencias":numCompetencias,
            "valor": valorPagamento,
            "socio": idsocio
        });

        socio.ressarcimentos.push(ressarcimento._id);
        await socio.save();

        return res.send(ressarcimento);

    }catch(err){
        return res.status(400).send({error: 'Erro ao incluir pagamento'});
    }
});

router.post('/finalizar', async (req, res) => {
    checkPermission(3,req.permission,res);
    try{
        const { idressarcimento,datapagamento } = req.body;
        if(!idressarcimento || !datapagamento)
            return res.status(400).send({error: 'Dados não informados'});
        const ressarcimento = await Ressarcimento.findOne({ _id: idressarcimento });
        ressarcimento.pago = 1;
        ressarcimento.datapagamento = datapagamento;
        await ressarcimento.save();

        return res.send(ressarcimento);

    }catch(err){
        return res.status(400).send({error: 'Erro ao finalizar o pagamento'});
    }
});

router.get('/', async (req, res) => {
    checkPermission(2,req.permission,res);
    try{
        const ressarcimento = await Ressarcimento.find({});

        return res.send(ressarcimento);
    }catch(err){
        return res.status(400).send({error: 'Erro ao listar ressarcimentos'});
    }
});

module.exports = app => app.use('/ressarcimento', router);