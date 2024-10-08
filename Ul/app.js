const express = require('express');
const path = require('path');
const app = express();
const mysql = require('mysql2');
const medicamentosRouter = require('./routes/medicamentos');

// Middleware para manejar JSON en las solicitudes
app.use(express.json());

// Crear conexión con la base de datos MySQL
const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '12345',
    database: 'datospacientemed'
}); // hola

// Verificar la conexión a la base de datos
connection.connect((err) => {
    if (err) {
        console.error('Error al conectar a la base de datos: ' + err.stack);
        return;
    }
    console.log('Conectado a la base de datos con el ID ' + connection.threadId);
});

// Servir archivos estáticos desde la carpeta "public"
app.use(express.static(path.join(__dirname, 'public')));

// Pasar la conexión a las rutas
app.use((req, res, next) => {
    req.db = connection;  // Hacer la conexión accesible desde las rutas
    next();
});

// Ruta base para medicamentos
app.use('/api', medicamentosRouter); // Asegúrate de que el prefijo /api esté en uso

app.get('/buscar', (req, res) => {
    const identificacion = req.query.identificacion;

    // Primero, consultar en la tabla pacientes
    const queryPacientes = 'SELECT identificacion, tipoidentificacion, nombre, telefono FROM pacientes WHERE identificacion = ?';
    req.db.query(queryPacientes, [identificacion], (err, pacientesResult) => {
        if (err) {
            return res.status(500).json({ message: 'Error en la consulta de pacientes' });
        }

        // Si no se encuentra el paciente
        if (pacientesResult.length === 0) {
            return res.status(404).json({ message: 'Paciente no encontrado' });
        }

        // Si se encuentra el paciente, consultar en la tabla pendientes
        const queryPendientes = 'SELECT idpendientes, numerofactura, fecharegistro, celular, celular2, direccion, medicamento, tipoentrega, sedependiente, cantidadprescrita, cantidadpendiente, cantidadpendientefinal FROM pendientes WHERE identificacion = ?';
        req.db.query(queryPendientes, [identificacion], (err, pendientesResult) => {
            if (err) {
                return res.status(500).json({ message: 'Error en la consulta de pendientes' });
            }
            // Enviar los resultados de pacientes y pendientes
            res.json({ paciente: pacientesResult[0], pendientes: pendientesResult });
        });
    });
});


// Ruta para actualizar la cantidad entregada
app.post('/api/actualizar-cantidad-entregada', (req, res) => {
    const updates = req.body.updates; // Capturar los datos enviados desde el frontend

    const sql = `UPDATE pendientes SET cantidadentregada = cantidadentregada + ?, cantidadpendientefinal = ? WHERE numerofactura = ? AND medicamento = ?`;

    // Usar promesas para asegurarse de que todas las actualizaciones se realicen
    const promises = updates.map(update => {
        return new Promise((resolve, reject) => {
            connection.query(sql, [update.cantidadentregada, update.cantidadpendientefinal, update.numerofactura, update.medicamento], (err, result) => {
                if (err) {
                    console.error('Error al actualizar los datos:', err);
                    reject(err);
                } else {
                    resolve(result);
                }
            });
        });
    });

    Promise.all(promises)
        .then(() => {
            res.json({ success: true });
        })
        .catch(() => {
            res.json({ success: false });
        });
});

// Llamar cantidad pendiente final
// Ruta para obtener el valor actualizado de 'cantidadpendientefinal'
app.get('/api/obtener-cantidad-pendiente', (req, res) => {
    const idpendientes = req.query.idpendientes;

    // Realiza una consulta a la base de datos para obtener el valor actualizado
    const query = 'SELECT cantidadpendientefinal FROM pendientes WHERE idpendientes = ?';
    connection.query(query, [idpendientes], (error, results) => {
        if (error) {
            return res.status(500).json({ error: 'Error al obtener el valor actualizado' });
        }

        if (results.length > 0) {
            res.json({ cantidadpendientefinal: results[0].cantidadpendientefinal });
        } else {
            res.status(404).json({ error: 'Factura no encontrada' });
        }
    });
});

//---------------------------------------------------------------------------------------------------------------------------------------
app.post('/actualizar-cantidad', (req, res) => {
    const { cantidadentregada, numerofactura, medicamento } = req.body;
    // Validación de los datos recibidos
    if (!cantidadentregada || !numerofactura || !medicamento) {
        return res.status(400).json({ message: 'Faltan datos requeridos' });
    }
    const fechaActual = new Date(); // Obtener la fecha actual
    // Lógica para buscar en la base de datos según numerofactura y medicamento
    const query = 'SELECT * FROM pendientes WHERE numerofactura = ? AND medicamento = ?';
    const values = [numerofactura, medicamento];
    req.db.query(query, values, (error, results) => {
        if (error) {
            console.error(error);
            return res.status(500).json({ message: 'Error al consultar la base de datos' });
        }
        // Si no se encuentra el registro
        if (results.length === 0) {
            return res.status(404).json({ message: 'Registro no encontrado' });
        }
        const registro = results[0];
        // Actualiza la cantidad entregada y la fecha en la tabla
        for (let i = 1; i <= 10; i++) {
            // Comprobar si la cantidad entregada está vacía
            if (!registro[`cantidadentregada${i}`]) {
                registro[`cantidadentregada${i}`] = cantidadentregada; // Establecer nueva cantidad
                registro[`fechaentrega${i}`] = fechaActual; // Establecer la fecha actual
                break;
            }
        }
        // Guarda el registro actualizado en la base de datos
        const updateQuery = 'UPDATE pendientes SET ? WHERE idpendientes = ?';
        req.db.query(updateQuery, [registro, registro.idpendientes], (updateError) => {
            if (updateError) {
                console.error(updateError);
                return res.status(500).json({ message: 'Error al actualizar la cantidad' });
            }
            res.json({ message: 'Cantidad y fecha actualizadas exitosamente' });
        });
    });
});

// Iniciar el servidor
app.listen(3000, () => {
    console.log('Servidor escuchando en el puerto http://localhost:3000');
});
