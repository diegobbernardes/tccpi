const express = require('express');
const bcrypt = require('bcryptjs');
const User = require('../models/user');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');

const authConfig = require("../../config/auth");

const router = express.Router();

function generateToken(params = {}){
    return token = jwt.sign(params, authConfig.secret, {
        expiresIn: 86400,
    });
}

router.post('/register', async (req,res)=>{
    const { email } = req.body;
    try{
        if(await User.findOne({ email }))
            return res.status(400).send({ error: "user already exist" });
        const user = await User.create(req.body);

        user.password = undefined;

        return res.send({
            user,
            token : generateToken({ id: user.id, permission: user.permission }),
        });
    }catch(err){
        return res.status(400).send({error: 'Registration failed'});
    }
});

router.get('/users', async(req,res)=>{
    try{
        const users = await User.find({}).select('+password');
        return res.send(users);
    }catch(err){
        return res.status(400).send({error: 'Falha na consulta'});
    }
});

router.post('/authenticate', async (req,res) =>{
    const{ email, password } = req.body;

    const user = await User.findOne({ email }).select('+password');

    if( !user )
        return res.status(400).send({ error: "User not found" });
    
    if(!await bcrypt.compare(password, user.password))
        return res.status(400).send({ error: 'Invalid password' });

    user.password = undefined;

    res.send({
        user,
        token : generateToken({ id: user.id, permission: user.permission }),
    });
});

router.post("/forgot_password", async (req, res)=> {
    const{ email } = req.body;

    try {
        
        const  user = await User.findOne({ email })

        if( !user )
            return res.status(400).send({ error: "User not found" });
        
        const token = crypto.randomBytes(20).toString('hex');

    } catch(err){
        res.status(400).send({ error : 'error on forgot password, try again later' });
    }
});

module.exports = app => app.use('/auth', router);