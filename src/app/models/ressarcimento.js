const mongoose = require('../../database');

const RessarcimentoSchema = new mongoose.Schema({
    pago:{
        type:Boolean,
        required: true,
    },
    dataRessarcimento: {
        type: Date,
    },
    competencias:{
        type: Number,
        get: v => Math.round(v),
        set: v => Math.round(v),
        alias: 'i',
        require: true,
    },
    valor: {
        type: Number,
        require: true,
    },
    socio: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Socio',
    },
});

const Ressarcimento = mongoose.model("Ressarcimento",RessarcimentoSchema);

module.exports = Ressarcimento;