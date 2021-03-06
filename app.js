const express = require('express'); //incorporamos a la aplicación el express con una variable con una constante. Dentro de ('') van los valores de el paquete que instalamos
const mysql = require('mysql'); //lllamamos en un const en una variable mysql con el paquete mysql
const util = require('util'); //agregamos la aplicacion util que ya viene con cualqueir paquete y sirve para usar a futuro un async await

const app = express(); //
const port = 3000; //podemos cambiar el puerto acá



app.use(express.json()); //permite el mapeo de json como objeto JS

//Conexión con MYSQL
const conexion = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'utnreacttp3y4'
});

conexion.connect((error) => {
    if (error) {
        throw error;
    }
    console.log('Conexion con la base de datos mysql establecida');
});

const qy = util.promisify(conexion.query).bind(conexion); //permite el uso con promisify para luego de async-await en la conexion mysql

// Desarrollo de la logica de negocio

/*
* Vamos ir arrancando con lo que queremos trabajar
TRABAJO para todas las conexiones de datos: 
-Crear la conexion javascript -> mysql
-Crear las categorias a usar
-luego Usaremos los metodos GET; put, post de cada acceso con descripcion:
-y finalmente crearemos las rutas
  
Ejemplo para este caso:
 1ero categoria 
 2do persona
 3ero libro
 
 *

 rutas -> /categoria
POST '/categoria' recibe: {nombre: string} 
retorna: status: 200, {id: numerico, nombre: string} - status: 413, {mensaje: <descripcion del error>} que puede ser: "faltan datos",
 "ese nombre de categoria ya existe",
  "error inesperado"

GET '/categoria' retorna: status 200  y [{id:numerico, nombre:string}]  - status: 413 y []

GET '/categoria/:id' retorna: status 200 y {id: numerico, nombre:string} - status: 413, {mensaje: <descripcion del error>} que puede ser: "error inesperado", "categoria no encontrada"


DELETE '/categoria/:id' retorna: status 200 y {mensaje: "se borro correctamente"} - status: 413, {mensaje: <descripcion del error>} que puese ser: "error inesperado", "categoria con libros asociados, no se puede eliminar", "no existe la categoria indicada"


No se debe implementar el PUT
 *Productos
GET para devolver todas las categorias

 Ruta -> /Persona

 *libro

 Ruta -> /Libro
 */
//Servidor

//GET para devolver todas las categorias

app.get('/categoria', async(req, res) => { //hacemos una call back con una funcion arrow  que recibe dos parametros
    //en el primero el parametro es lo que envia el usuario (req) y el segundo parametro es la respuesta (res) 
    //app.get('/categoria', (x, y) => {});

    //tenemos que definir los errores que pueden llegar a salir mas.generar un plan b desde antemano de las cosas que puen caer mal
    // para solventar esos errores de antemanos tenemos el TRY / CATCH
    try { // preparemos hacer algo
        const query = 'SELECT * FROM categoria'; //traemos con un select (consulta sql) y guardamos en una constante 

        const respuesta = await qy(query); //pasamos la variable respueste a la variable la variable query 

        res.send({ "Resultado": respuesta }); //mandamos un json con la respuesta icomo variable

    } catch (e) { //pero si hay un error hacemos esto
        console.error(e.message);
        res.status(403).send({
                "Error Inesperado": e.message
            }) //mandamos al modulo res un status 403 con un send un json con el texto
    }
});



// GET id para devolver uno solo
app.get('/categoria/:id', async(req, res) => { // esto va a parar a dentro de un id dentro de params 
    // ejemplo en postman localhost:3000/categoria/122
    try {
        // preparemos hacer algo
        const query = 'SELECT * FROM categoria WHERE id = ?'; //hacemos un comodin donde el ? vale todo

        const respuesta = await qy(query, [req.params.id]); //mandamos el metodo params al req como id
        console.log(respuesta); //quiero ver como es la estructura de un select hacerca de la respuesta sta.
        res.send({ "respuesta": respuesta });


    } catch (e) {
        console.error(e.message);
        res.status(403).send({
            "Error Inesperado": e.message
        })
    }

});

// POST guardar una categoria nueva
app.post('/categoria', async(req, res) => {
    try {
        //solamente recibireoms req.body.nombre pero tenemos que asegurarnos que nos manda exactamente un req.
        if (!req.body.nombre) { //validamos  cuando NO nos manda como nombre en el body
            throw new Error('Faltan datos. Falta enviar el nombre'); //salta con un throw un error y corta la ejecución del programa.
        } // no hace falta poner un else

        const nombre = req.body.nombre.toUpperCase(); //pasamos el nombre a mayuscula

        //validamos que no agreguemos la misma categoria solo UNA CATEGORIA.
        //verificamos que no exista previamente la categoria
        let query = 'SELECT id FROM categoria WHERE nombre = ?'; //guardamos en un let para que sea volatil y el query con un id donde nombre sea comodin ?

        let respuesta = await qy(query, [nombre]); //mandamos el contenido de body de nombre (y lo pasa a upercase para que todo sea igual)

        if (respuesta.length > 0) { //corroboramos que la respuesta no sea un array incompleto no hay que hacer !respuesta porque el array SIEMPRE existe.
            throw new Error('Esa categoria ya existe'); //tiramos el error de categoria

        }


        // Guardo la categoria
        query = 'INSERT INTO categoria (nombre) VALUE (?)'; //guardamos en la variable la consulta donde insertamos en la categoria el nombre con valor 
        respuesta = await qy(query, [nombre]);

        console.log(respuesta); // este es un console log para el postman nos fijamos en affectrows e insert ide

        res.send({
            'id': respuesta.insertId,
            "nombre": nombre
        }); //enviamos el json con la respuesta mostrará solo respuesta + el numero del id

        //probamos con postman con un JSON 
        // { "nombre": "lacteos"}

    } catch (e) {
        console.error(e.message);
        res.status(403).send({
            "Error Inesperado": e.message
        })
    }
});


// DELETE para borrar una categoria existente.
//PELIGRO!!
//siempre verificar si existen productos que no estan enlazados!! si nonos van a quedar elementos huerfanos
//se suele hacer de dos maneras: verificando si esa categoria no tenga asociados o bien hago un borrado logico
app.delete('/categoria/:id', async(req, res) => {

    try {
        /* if (!req.body.id) { //validamos  cuando NO nos manda como nombre en el body
            throw new Error('Faltan datos. Falta enviar id'); //salta con un throw un error y corta la ejecución del programa.
        } // no hace falta poner un else
*/
        //verifico si no exista un PRODUCTO que tenga esa categoria asociada
        let query = 'SELECT * FROM libro WHERE categoria_id = ?' // busco un producto donde categoria igual al caregoria_id
        let respuesta = await qy(query, [req.params.id]);

        console.log("El query es:", respuesta);

        if (respuesta.length > 0) {
            throw new Error("Categoría con datos asociados. No se puede eliminar");

        }

        let query = 'SELECT FROM categoria WHERE id = ?'; //guardamos en un let para que sea volatil y el query con un id donde nombre sea comodin ?

        let respuesta = await qy(query, [req.params.id]);
        console.log("tamaño de respuesta", respuesta.length)
            /*
        if (respuesta.length > 0) { //corroboramos que la respuesta no sea un array incompleto no hay que hacer !respuesta porque el array SIEMPRE existe.
            throw new Error('Este id no existe'); //tiramos el error de categoria

        }
*/
        query = 'DELETE FROM categoria WHERE id = ?';


        respuesta = await qy(query, [req.params.id]);
        console.log("El nuevo query es:", respuesta);

        res.send({
            "se borro correctamente"

        });



    } catch (e) {
        console.error(e.message);
        res.status(403).send({
            "Error": e.message
        })
    }
});

//PRODUCTOS

app.post('/producto', async(req, res) => {
    try {
        if (!req.body.nombre || !req.body.categoria_id) { //corroborar que si no me mandan un numbre o categoria. no hace falta que pongamos la descripcion total esta va en NULL

            throw new Error("No enviaste los datos obligatorios que son el nombre y la categoria");
        }
        //armamos una 
        let query = 'SELECT * FROM categoria WHERE id = ?';

        let respuesta = await qy(query, [req.body.categoria_id]);

        if (respuesta.length == 0) { //si es igual a cero porque no econtró la categoría.
            throw new Error("Esa categoria no existe");
        }


        query = 'SELECT * FROM producto WHERE nombre = ?';
        respuesta = await qy(query, [req.body.nombre]);

        if (respuesta.length > 0) {
            throw new Error("Ese nombre de producto ya existe");
        }

        //insertar despcipcion
        let descripcion = '';
        if (req.body.descripcion) { //como descripcion es un item que no es obligatorio entonces si lo ingresamos guardamos la variable
            descripcion = req.body.descripcion;
        }
        query = 'INSERT INTO producto (nombre, descripcion, categoria_id) VALUES (?, ?, ?)';

        //mandamos los datos a la bdd
        respuesta = await qy(query, [req.body.nombre, descripcion, req.body.categoria_id]);

        //respuesta para mostrar en psotman
        res.send({ 'respuesta': respuesta });

    } catch (e) {
        console.error(e.message);
        res.status(403).send({
            "Error": e.message
        })
    }
});


app.listen(port, () => { //escucha el puerto del servidor
    console.log('Servidor escuchando en el puerto', port)
});