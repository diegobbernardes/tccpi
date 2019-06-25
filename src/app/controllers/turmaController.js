const express = require('express');
const authMiddleware = require('../middlewares/auth')
const Turma = require('../models/turma');
const Socio = require('../models/socio')

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
    try{
        const turma = await Turma.create(req.body);

        return res.send({ turma });
    }catch(err){
        return res.status(400).send({error: 'Erro ao dadastrar socio'});
    }
});

router.post('/adicionaraluno', async (req, res)=>{
    try{
        checkPermission(2,req.permission,res);
        const { idturma,idsocio } = req.body;
        if(await Turma.findOne({ "alunos":idsocio }))
            return res.status(400).send({error: 'Socio já está em uma turma.'});

        const turma = await Turma.findOne({ "_id":idturma });
        const socio = await Socio.findOne({ "_id":idsocio });

        socio.turma = idturma;
        await socio.save();

        turma.alunos.push(socio);
        await turma.save();
        
        return res.send({ turma,socio });
    }catch(err){
        return res.status(400).send({error: 'Erro ao adicionar socio a uma turma.'});
    }
});

router.get('/listar', async (req, res)=>{
    checkPermission(1,req.permission,res);
    try{
        const turma = await Turma.find({}).populate("alunos",["cpf","numeroBeneficio","nome"]);
        return res.send(turma);
    }catch(err){
        return res.status(400).send({error: 'Falha na consulta'});
    }
});

router.delete('/', async (req, res)=> {
    checkPermission(4,req.permission,res);
    try{
        const { idturma } = req.body;
        const turma = await Turma.findOne({ "_id":idturma });
        if(turma){
            await asyncForEach(turma.alunos, async (element) => {
                socio = await Socio.findOne({"_id":element});
                socio.turma = undefined;
                await socio.save();
            });
            await Turma.deleteOne({ _id: idturma })
            return res.send(turma);
        }else{
            return res.status(400).send({error: 'Turma não encontrada'});
        }        
    }catch(err){
        return res.status(400).send({error: 'Falha na consulta'}); 
    }
});

module.exports = app => app.use('/turma', router);