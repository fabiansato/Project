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
    database: 'utn-react-tp3y4'
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
    res.status(501).json({ message: 'Not implemented' });
});


// Personas

// POST '/persona' recibe: {nombre: string, apellido: string, alias: string, email: string}
// retorna: status: 200, {id: numerico, nombre: string, apellido: string, alias: string, email: string}
// error: status: 413, {mensaje: <descripcion del error>} que puede ser: "faltan datos", "el email ya se encuentra registrado", "error inesperado"
app.post('/persona', (req, res) => {
    if (!req.body.nombre || !req.body.apellido || !req.body.alias || !req.body.email) {
        res.status(413);
        res.json({ mensaje: 'Faltan datos' });
        return;
    }

    const setParams = {
        nombre: req.body.nombre,
        apellido: req.body.apellido,
        alias: req.body.alias,
        email: req.body.email
    };

    connection.query('INSERT INTO `personas` SET ?', [setParams], (error, results) => {
        if (error) {
            res.status(413);

            switch (error.code) {
                case 'ER_DUP_ENTRY':
                    res.json({ mensaje: 'El email ya se encuentra registrado' });
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

app.get('/persona', (_, res) => {
    connection.query('SELECT * FROM `personas`', (error, results) => {
        if (error) {
            res.status(413);
            res.json([]);
            return;
        }

        res.status(200);
        res.json(results);
    });
});

app.get('/persona/:id', (req, res) => {
    const searchParams = {
        id: req.params.id
    };

    connection.query('SELECT * FROM `personas` WHERE ?', [searchParams], (error, results) => {
        if (error) {
            res.status(413);
            res.json({ mensaje: 'Error inesperado' });
            return;
        }

        if (results.length === 0) {
            res.status(413);
            res.json({ mensaje: 'No se encuentra esa persona' });
            return;
        }

        res.status(200);
        res.json(results[0]);
    });
});

app.put('/persona/:id', (req, res) => {
    // La especificación de la tarea denota que este método puede recibir `email`
    // Sin embargo, también dice que el `email` no se puede actualizar
    // Pero no especifica que error se debería retornar en caso de existir
    // En este método el `email` es simplemente ignorado

    const searchParams = {
        id: req.params.id
    };
    const setParams = {};

    // `setParams` es creado sólo con las propiedades que se quieren cambiar
    if (req.body.nombre) setParams.nombre = req.body.nombre;
    if (req.body.apellido) setParams.apellido = req.body.apellido;
    if (req.body.alias) setParams.alias = req.body.alias;

    connection.query(
        `
        UPDATE personas
        SET ?
        WHERE ?
        `, [setParams, searchParams],
        (error, result) => {
            console.log(error, result);

            if (error) {
                res.status(413);
                res.json({ mensaje: 'Error inesperado' });
                return;
            }

            // Aquí nos encontramos en el medio de una triste situación
            // Queremos retornar el objeto actualizado, sin embargo,
            // los queries UPDATE de SQL no permiten retornar el
            // objeto modificado. La variable `results` no es útil para nosotros.
            //
            // Para acomodar este requerimiento, tenemos que realizar otro
            // query para obtener la fila actualizada
            connection.query('SELECT * FROM `personas` WHERE ?', [searchParams], (error, results) => {
                if (error) {
                    res.status(413);
                    res.json({ mensaje: 'Error inesperado' });
                    return;
                }

                // No hay manera the el array `results` esté vacio

                res.status(200);
                res.json(results[0]);
            });
        }
    );
});

app.delete('/persona/:id', (req, res) => {
    // TODO
    res.status(501).json({ message: 'Not implemented' });
});

app.listen(process.env.PORT || 3000, () => {
    console.log('http://localhost:3000');
});