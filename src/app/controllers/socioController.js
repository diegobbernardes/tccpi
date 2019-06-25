const express = require('express');
const authMiddleware = require('../middlewares/auth')
const Socio = require('../models/socio');
const Turma = require('../models/turma');
const Repasse = require('../models/repasse');
const Ressarcimento = require('../models/ressarcimento')

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

router.post('/cadastrar', async (req, res)=>{
    checkPermission(2,req.permission,res);
    const { numeroBeneficio } = req.body;
    try{
        if(await Socio.findOne({ numeroBeneficio }))
            return res.status(400).send({ error: "Socio já cadastrado" });
        const socio = await Socio.create(req.body);
        
        const repasse = await Repasse.find({"numeroBeneficio":socio.numeroBeneficio});
        if(repasse){
            await asyncForEach(repasse, async (element) => {
                element.socio = socio._id;
                await element.save();

                socio.descontos.push(element._id);
            });
            await socio.save();         
        }      

        return res.send({ socio });
    }catch(err){
        return res.status(400).send({error: 'Erro ao dadastrar socio'});
    }
});

router.get('/listar', async (req, res)=>{
    checkPermission(1,req.permission,res);
    try{
        const socios = await Socio.find({}).populate('turma','turma').populate('descontos',['valor','competencia']).populate('ressarcimentos',['valor','pago','dataPagamento','descontos']);
        return res.send(socios);
    }catch(err){
        return res.status(400).send({error: 'Falha na consulta'});
    }
});

router.delete('/excluir', async (req, res)=> {
    checkPermission(4,req.permission,res);
    try{ 
        const { idsocio } = req.body;    
        socio = await Socio.findOne({ _id: idsocio });   
        if(socio){                      
            idturma = socio.turma;
            turma = await Turma.findOne({"_id":idturma});
            if(turma){  
                turma.alunos.pull(idsocio);
                await turma.save();
            }

            const repasse = await Repasse.find({"socio":socio._id});
            if(repasse){
                await asyncForEach(repasse, async (element) => {
                    element.socio = undefined;
                    await element.save();
                });
            }

            const ressarcimento = await Ressarcimento.find({"socio":socio._id});
            if(ressarcimento){
                await asyncForEach(ressarcimento, async (element) => {
                    await Ressarcimento.deleteOne({ _id: element._id });
                });
            }

            socios = await Socio.deleteOne({ _id: idsocio })
            return res.send(socios);
        }else{
            return res.status(400).send({error: 'Socio não encontrado.'});
        }
    }catch(err){
        console.log(err);
        return res.status(400).send({error: 'Ocorreu um erro ao excluir o socio'});
    }
});

module.exports = app => app.use('/socio', router);