// PUT para modificar una categoria existente
app.put('/categoria/:id', async(req, res) => {
    try {
        if (!req.body.nombre) { //
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
            "Error": e.message
        })
    }
});