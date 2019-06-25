const mongoose = require('../../database');

const TurmaSchema = new mongoose.Schema({
    turma: {
        type: String,
        require: true,
    },
    dataInicio: {
        type: Date,
    },
    alunos:  [{ 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Socio',
        unique: true,
    }],
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

const Turma = mongoose.model("Turma",TurmaSchema);

module.exports = Turma;