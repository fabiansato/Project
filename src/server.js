const bodyParser = require('body-parser');
const express = require('express');
const mysql = require('mysql');

const app = express();

app.use(bodyParser.json());

const connection = mysql.createConnection({
    host: 'localhost',
    port: 3306,
    user: 'root',
    password: '',
    database: 'test'
});

app.post('/categoria', (req, res) => {
    if (!req.body.nombre) {
        res.status(413);
        res.json({ mensaje: 'Faltan datos' });
        return;
    }

    const setParams = {
        nombre: req.body.nombre
    };

    connection.query('INSERT INTO `categorias` SET ?', [setParams], (error, results) => {
        if (error) {
            res.status(413);

            switch (error.code) {
                case 'ER_DUP_ENTRY':
                    res.json({ mensaje: 'Ese nombre de categoria ya existe' });
                    break;
                default:
                    res.end({ mensaje: 'Error inesperado' });
                    break;
            }
            
            return;
        }

        res.status(200);
        res.json({
            id: results.insertId,
            ...setParams
        });
    });
});

app.get('/categoria', (_, res) => {
    connection.query('SELECT * FROM `categorias`', (error, results) => {
        if (error) {
            res.status(413);
            res.json([]);
            return;
        }
    
        res.status(200);
        res.json(results);
    });
});

app.get('/categoria/:id', (req, res) => {
    const searchParams = {
        id: req.params.id
    };

    connection.query('SELECT * FROM `categorias` WHERE ?', [searchParams], (error, results) => {
        if (error) {
            res.status(413);
            res.json({ mensaje: 'Error inesperado' });
            return;
        }

        if (results.length === 0) {
            res.status(413);
            res.json({ mensaje: 'Categoria no encontrada' });
            return;
        }
    
        res.status(200);
        res.json(results[0]);
    });
});

app.delete('/categoria/:id', (req, res) => {
    // TODO
});

app.listen(process.env.PORT || 3000, () => {
    console.log('http://localhost:3000');
});
