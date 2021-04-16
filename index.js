//Criado a partir desse tutorial:
//https://www.enterprisedb.com/postgres-tutorials/how-quickly-build-api-using-nodejs-postgresql

const express = require('express');
const getTextoBiblico = require('./AdicionarTextoBiblico');
const { handleError, ErrorHandler } = require('./ErrorHandler.js');

const app = express();

const port = process.env.PORT ?? 8080;

app.use(express.json());

const services = { 
    texto: (req, res, next) => {
        getTextoBiblico(req.params.strReferencia, req.params.strVersao, next)
            .then((resultado) =>
                res.status(200).json(resultado)
            )
            .catch((error) => next(error));
    },
    versoes: (_req, res, _next) => {
        let versoes = require('./Versoes.json');
        res.status(200).json(versoes);
    }
}

app.get(
    '/:service/:strReferencia?/:strVersao?', 
    (req, res, next) => {
        let service;
        try {
            service = services[req.params.service];
            if (!service) throw new ErrorHandler(404, 'Serviço não existe.');
            service(req, res, next)
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