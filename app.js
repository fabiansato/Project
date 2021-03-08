const express = require('express'); //incorporamos a la aplicación el express con una variable con una constante. Dentro de ('') van los valores de el paquete que instalamos
const mysql = require('mysql'); //lllamamos en un const en una variable mysql con el paquete mysql
const util = require('util'); //agregamos la aplicacion util que ya viene con cualqueir paquete y sirve para usar a futuro un async await

const app = express(); // uso de express
var cors = require('cors') //uso de cors
const port = 3000; //podemos cambiar el puerto acá



app.use(express.json());
app.use(cors()); /* VER LO DE CORS*/

const conexion = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'test'
});

conexion.connect((error) => {
    if (error) {
        throw error;
    }
    console.log('Conexion con la base de datos mysql establecida');
});

const qy = util.promisify(conexion.query).bind(conexion);


/* CATEGORIA */
app.get('/categoria', async(req, res) => {
    try {
        const query = 'SELECT * FROM categoria';

        const respuesta = await qy(query);

        res.send({ "Resultado": respuesta });

    } catch (e) {
        console.error(e.message);
        res.status(403).send({
            "Error Inesperado": e.message
        })
    }
});


app.get('/categoria/:id', async(req, res) => {

    try {

        const query = 'SELECT * FROM categoria WHERE id = ?';

        const respuesta = await qy(query, [req.params.id]);

        res.send({ "respuesta": respuesta });


    } catch (e) {
        console.error(e.message);
        res.status(403).send({
            "Error Inesperado": e.message
        })
    }

});

app.post('/categoria', async(req, res) => {
    try {

        if (!req.body.nombre) {
            throw new Error('Faltan datos. Falta enviar el nombre');
        }

        const nombre = req.body.nombre.toUpperCase();

        let query = 'SELECT id FROM categoria WHERE nombre = ?';

        let respuesta = await qy(query, [nombre]);

        if (respuesta.length > 0) {
            throw new Error('Esa categoria ya existe');

        }


        query = 'INSERT INTO categoria(nombre) VALUE (?)';
        respuesta = await qy(query, [nombre]);



        res.send({
            'id': respuesta.insertId,
            "nombre": nombre
        });



    } catch (e) {
        console.error(e.message);
        res.status(403).send({
            "Error Inesperado": e.message
        })
    }
});


app.delete('/categoria/:id', async(req, res) => {

    try {

        let query = 'SELECT * FROM libro WHERE id_categoria = ?';
        let respuesta = await qy(query, [req.params.id]);


        if (respuesta.length > 0) {
            throw new Error("Categoría con datos asociados. No se puede eliminar");

        }
        if (respuesta.length == 0) {
            throw new Error("Esa categoria no existe");
        }

        query = 'DELETE FROM categoria WHERE id = ?';



        respuesta = await qy(query, [req.params.id]);

        res.send({ "respuesta": respuesta });



    } catch (e) {
        console.error(e.message);
        res.status(403).send({
            "Error inesperado": e.message
        })
    }
});

/* Persona */
app.post('/persona', async(req, res) => {
    try {
        if (!req.body.nombre || !req.body.apellido || !req.body.email || !req.body.alias) {
            throw new Error("No enviaste los datos obligatorios que son: nombre, apellido, email y alias");
        }


        query = 'SELECT * FROM personas WHERE email = ?';
        respuesta = await qy(query, [req.body.email]);

        if (respuesta.length > 0) {
            throw new Error("Ese email  ya existe");
        }


        query = 'INSERT INTO persona (nombre, apellido, email, alias) VALUES (?, ?, ?, ?)';

        respuesta = await qy(query, [req.body.nombre, req.body.apellido, req.body.email, req.body.alias]);

        res.send({ 'respuesta': respuesta });

    } catch (e) {
        console.error(e.message);
        res.status(403).send({
            "Error inesperado": e.message
        })
    }
});



app.get('/persona', async(req, res) => {
    try {
        const query = 'SELECT * FROM personas';

        const respuesta = await qy(query);

        res.send({ "Resultado": respuesta });

    } catch (e) {
        console.error(e.message);
        res.status(403).send({
            "Error Inesperado": e.message
        })
    }
});




app.get('/persona/:id', async(req, res) => {

    try {

        const query = 'SELECT * FROM personas WHERE id = ?';

        const respuesta = await qy(query, [req.params.id]);

        res.send({ "respuesta": respuesta });


    } catch (e) {
        console.error(e.message);
        res.status(403).send({
            "Error Inesperado": e.message
        })
    }

});



app.put('/persona/:id', async(req, res) => {
    try {
        if (!req.body.nombre || !req.body.apellido || !req.body.alias) { //
            throw new Error("No enviaste el nombre");
        }

        let query = 'SELECT * FROM categoria WHERE nombre = ? AND id <> ?'; //consulta donde selecciona todo de categoria donde el nombre sea el enviado y sea diferente a cualquier ot id

        let respuesta = await qy(query, [req.body.nombre.toUpperCase(), req.params.id]); // le mandamos el nombre y el id

        console.log("esta es respuesta:", respuesta);

        if (respuesta.length > 0) { //corroboramos que el array tenga contenido
            throw new Error("El nombre de la categoria que querés poner ahora, ya existe");
        }

        query = 'UPDATE categoria SET nombre = ? WHERE id = ?';

        respuesta = await qy(query, [req.body.nombre.toUpperCase(), req.params.id]);

        res.send({ "respuesta": respuesta.affectedRows }); //muestra si fueron cambiados




    } catch (e) {
        console.error(e.message);
        res.status(403).send({
            "Error inesperado": e.message
        })
    }
});


/* LIBRO */

app.post('/libro', async(req, res) => {
    try {
        if (!req.body.nombre || !req.body.id_categoria) {

            throw new Error("Nombre y categoria son datos obligatorios");
        }

        let querycategoria = 'SELECT * FROM categorias WHERE id = ?';

        let respuestacategoria = await qy(querycategoria, [req.body.id_categoria]);

        if (respuestacategoria.length == 0) { //si es igual a cero porque no econtró la categoría.
            throw new Error("No existe la categoria indicada");
        }

        let querypersona = 'SELECT * FROM personas WHERE id = ?';

        let respuestapersona = await qy(querypersona, [req.body.id_persona]);

        if (respuestapersona.length == 0) { //si es igual a cero porque no econtró la categoría.
            throw new Error("No existe la persona indicada con ese ID");
        }

        query = 'SELECT * FROM libros WHERE nombre = ?';
        respuesta = await qy(query, [req.body.nombre.toUpperCase()]); //el nombre debe estar en uppercase para validar correctamente el ingreso por el usuario

        if (respuesta.length > 0) {
            throw new Error("Ese libro ya existe");
        }


        let descripcion = '';
        if (req.body.descripcion) { //como descripcion es un item que no es obligatorio entonces si lo ingresamos guardamos la variable
            descripcion = req.body.descripcion;
        }

        let id_persona = '';
        if (req.body.id_persona) { //como id_persona  es un item que no es obligatorio entonces si lo ingresamos guardamos la variable
            id_persona = req.body.id_persona;
        }

        query = 'INSERT INTO libros (nombre, descripcion, id_categoria, id_persona ) VALUES (?, ?, ?, ?)';

        //mandamos los datos a la bdd
        respuesta = await qy(query, [req.body.nombre.toUpperCase(), descripcion, req.body.id_categoria, id_persona]); // la descripcón no hace falta que esté en uppercase

        //respuesta para mostrar en psotman
        res.send({ 'respuesta': respuesta });

    } catch (e) {
        console.error(e.message);
        res.status(403).send({
            "Error inesperado": e.message
        })
    }
});



app.get('/libro', async(req, res) => {
    try {
        const query = 'SELECT * FROM libros';

        const respuesta = await qy(query);

        res.send({ "Resultado": respuesta });

    } catch (e) {
        console.error(e.message);
        res.status(403).send({
            "Error Inesperado": e.message
        })
    }
});




app.get('/libro/:id', async(req, res) => {

    try {

        const query = 'SELECT * FROM libros WHERE id = ?';

        const respuesta = await qy(query, [req.params.id]);
        console.log(respuesta);
        if (respuesta == 0) {
            throw new Error("No existe ningún libro con esa ID");
        } else {

            res.send({ "respuesta": respuesta });

        }

    } catch (e) {
        console.error(e.message);
        res.status(403).send({
            "Error Inesperado": e.message
        })
    }

});

/* ejemplo de cors
app.get('/libro/:id', function(req, res, next) {
    res.json({ msg: 'This is CORS-enabled for all origins!' });
});
*/


app.put('/libro/:id', async(req, res) => {
    try {
        if (!req.body.descripcion) { //
            throw new Error("No enviaste la descripción del libro");
        } else if (req.body.nombre || req.body.id_categoria || req.body.id_persona) {
            throw new Error("Sólo se permite cambiar la descripción del libro");
        }


        query = 'UPDATE libros SET descripcion = ? WHERE id = ?';

        respuesta = await qy(query, [req.body.descripcion, req.params.id]);

        res.send({ "respuesta": respuesta }); //muestra si fueron cambiados




    } catch (e) {
        console.error(e.message);
        res.status(403).send({
            "Error inesperado": e.message
        })
    }
});


app.put('/libro/prestar/:id', async(req, res) => {
    try {

        if (!req.body.id_persona) { //
            throw new Error("No enviaste el ID de la persona");
        }

        const query = 'SELECT * FROM libros WHERE id = ?';

        const respuesta = await qy(query, [req.params.id]);

        if (respuesta == 0) {
            throw new Error("No existe ningún libro con esa ID");
        } else {

            let queryprestado = 'SELECT id_persona FROM libros WHERE id = ?';
            let respuestaprestado = await qy(queryprestado, [req.params.id]);

            console.log("respuesta prestado:", respuestaprestado[0].id_persona);


            if (respuestaprestado[0].id_persona === null) {

                let queryprestar = 'UPDATE libros SET id_persona = ? WHERE id = ?';

                respuestaprestar = await qy(queryprestar, [req.params.id_persona, req.params.id]);

                console.log("Se prestó correctamente el libro", respuestaprestado.id_persona);
                res.send({ "Libro devuelto y ID": respuesta }); //muestra si fueron cambiados
            }



        } else {

            throw new Error("El libro ya tiene una persona asignada.");

        }


        /*

                query = 'UPDATE libros SET descripcion = ? WHERE id = ?';

                respuesta = await qy(query, [req.body.descripcion, req.params.id]);

                res.send({ "respuesta": respuesta }); //muestra si fueron cambiados

        */


    } catch (e) {
        console.error(e.message);
        res.status(403).send({
            "Error inesperado": e.message
        })
    }
});


app.put('/libro/devolver/:id', async(req, res) => {
    try {



        const query = 'SELECT * FROM libros WHERE id = ?';

        const respuesta = await qy(query, [req.params.id]);

        if (respuesta == 0) {
            throw new Error("No existe ningún libro con esa ID");
        } else {

            let queryprestado = 'SELECT id_persona FROM libros WHERE id = ?';
            let respuestaprestado = await qy(queryprestado, [req.params.id]);

            console.log("respuesta prestado:", respuestaprestado[0].id_persona);


            if (respuestaprestado[0].id_persona === null) {

                throw new Error("El libro No tiene una persona asignada. Este libro no esta prestado");


            } else {


                let querydevolver = 'UPDATE libros SET id_persona = NULL WHERE id = ?';

                respuestadevolver = await qy(querydevolver, [req.params.id]);

                console.log("Se devolvió correctamente el libro", respuestaprestado.id_persona);
                res.send({ "Libro devuelto y ID": respuesta }); //muestra si fueron cambiados
            }

        }


        /*

                query = 'UPDATE libros SET descripcion = ? WHERE id = ?';

                respuesta = await qy(query, [req.body.descripcion, req.params.id]);

                res.send({ "respuesta": respuesta }); //muestra si fueron cambiados

        */


    } catch (e) {
        console.error(e.message);
        res.status(403).send({
            "Error inesperado": e.message
        })
    }
});


app.listen(port, () => {
    console.log('Servidor escuchando en el puerto', port)
});