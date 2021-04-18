//Criado a partir desse tutorial:
//https://www.enterprisedb.com/postgres-tutorials/how-quickly-build-api-using-nodejs-postgresql

const express = require('express');
const getTextoBiblico = require('./AdicionarTextoBiblico');
const { handleError, ErrorHandler } = require('./ErrorHandler.js');

const app = express();

const port = process.env.port ?? 8080;

app.use(express.json());

const servicos = {
    servicos: {
        funcao: (_req, res, _next) => res.status(200).json({servicos}),
        descricao: 'Lista os serviços disponíveis.',
    },
    texto: {
        funcao: (req, res, next) => {
        getTextoBiblico(req.params.strReferencia, req.params.strVersao)
            .then((resultado) =>
                res.status(200).json(resultado)
            )
            .catch((error) => next(error));
        },
        descricao: 'Retorna o texto bíblico definido pela referência indicada no próximo caminho, na versão indicada no caminho seguinte (ou NVI se a versão não for informada).'
    },
    versoes: {
        funcao: (_req, res, _next) => {
            let versoes = require('./Versoes.json');
            res.status(200).json(versoes);
        },
        descricao: 'Retorna a lista de versões da bíblia disponíveis.',
    }
}

app.get(
    '/:service?/:strReferencia?/:strVersao?', 
    (req, res, next) => {
        let service;
        res.header('Access-Control-Allow-Origin', '*')
        res.header('Access-Control-Allow-Credentials', true)
        res.header('Access-Control-Allow-Methods', 'GET, OPTIONS')
        res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept')
        try {
            service = servicos[req.params.service ?? 'servicos'];
            if (!service) throw new ErrorHandler(404, 'Serviço não existe.');
            service.funcao(req, res, next)
        }
        catch (error) {
            next(error);
        }
    }
)

app.use((err, _req, res, _next) => {
    handleError(err, res);
});

app.listen(port, () => console.log(`Api bíblia funcionando na porta ${port}!`))