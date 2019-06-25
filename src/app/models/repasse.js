const mongoose = require('../../database');

const RepasseSchema = new mongoose.Schema({
    cpf: {
        type: String,
        require: true,
    },
    numeroBeneficio: {
        type: String, 
        require: true,
    },
    competencia: {
        type: Date,
        require: true,
    },
    valor: {
        type: Number,
        require: true,
    },
});

const Repasse = mongoose.model("Repasse",RepasseSchema, "repasse_bmg");

module.exports = Repasse;