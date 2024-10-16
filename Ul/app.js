const express = require('express');
const path = require('path');
const app = express();
const mysql = require('mysql2');
const medicamentosRouter = require('./routes/medicamentos');
const ExcelJS = require('exceljs');
const fs = require('fs');
const session = require('express-session');
const bodyParser = require('body-parser');

// Middleware para parsear datos del formulario
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json()); // Agregado para parsear JSON si es necesario

// Configuración de la sesión
app.use(session({
    secret: 'mi_secreto', // Cambia esto por una cadena secreta segura
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false } // Cambia a true si usas HTTPS
}));

// Servir archivos estáticos desde la carpeta 'public'
app.use(express.static(path.join(__dirname, 'public')));

// Ruta para manejar el login
app.post('/login', (req, res) => {
    const username = req.body.username;
    const password = req.body.password;

    // // Usuario y contraseña fijos (puedes cambiarlos)
    // const fixedUsername = 'sebas';
    // const fixedPassword = '123';

    fs.readFile('usuarios.json', 'utf8', (err, data) => {
        if (err) {
            console.error('Error leyendo el archivo JSON:', err);
            return res.redirect('/login.html?error=true');
        }

        // Parsear el JSON y buscar el usuario
        const usuarios = JSON.parse(data);
        const usuarioEncontrado = usuarios.find(user => user.username === username && user.password === password);

        if (usuarioEncontrado) {
            // Almacena el nombre de usuario y la sede en la sesión
            req.session.username = usuarioEncontrado.username; // Almacenar el nombre de usuario en la sesión
            req.session.sede = usuarioEncontrado.sede; // Almacenar la sede en la sesión
            // Redirigir a index.html con el nombre de usuario y sede como parámetros de consulta
            res.redirect(`/index.html?username=${encodeURIComponent(usuarioEncontrado.username)}&sede=${encodeURIComponent(usuarioEncontrado.sede)}`); 
        } else {
            // Redirigir de vuelta a login.html con un mensaje de error en la URL
            res.redirect('/login.html?error=true');
        }
    });
});


// Ruta para renderizar index.html
app.get('/index.html', (req, res) => {
    // Leer el nombre de usuario de la sesión
    const username = req.session.username || 'Invitado'; // Asegurarse de que la sesión existe
    const sede = req.session.sede || 'Desconocida'; // Obtener sede de la sesión

    // Enviar el archivo index.html y pasar el nombre de usuario y sede a través de la URL
    res.sendFile(path.join(__dirname, 'public', 'index.html'), {
        headers: {
            'username': username, // Esto no se usará en HTML pero puede ser útil para debugging
            'sede': sede
        }
    });
});

// Middleware para manejar JSON en las solicitudes
app.use(express.json());

// Crear conexión con la base de datos MySQL
const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '12345',
    database: 'medicamentos'
});

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
    const queryPacientes = 'SELECT identificacion, tipoidentificacion, nombre, telefono, eps FROM pacientes WHERE identificacion = ?';
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
    const { cantidadentregada, numerofactura, medicamento, username} = req.body;
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
                registro[`entrega${i}`] = username; // Establecer la fecha actual
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


// Ruta para generar y descargar el reporte en formato Excel
app.get('/generar-reporte', (req, res) => {
    // Consulta SQL para obtener todos los datos de la tabla pendientes
    const query = 'SELECT * FROM pendientes';

    connection.query(query, (error, results) => {
        if (error) {
            return res.status(500).json({ error: 'Error al obtener los datos de la base de datos' });
        }

        // Crear un nuevo libro de Excel
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('Reporte Pendientes');

        // Agregar encabezados
        worksheet.columns = [
            { header: 'idpendientes', key: 'idpendientes', width: 15 },
            { header: 'numerofactura', key: 'numerofactura', width: 15 },
            { header: 'fecharegistro', key: 'fecharegistro', width: 20 },
            { header: 'identificacion', key: 'identificacion', width: 15 },
            { header: 'tipoidentificacion', key: 'tipoidentificacion', width: 20 },
            { header: 'nombre', key: 'nombre', width: 30 },
            { header: 'eps', key: 'eps', width: 30 },
            { header: 'celular', key: 'celular', width: 15 },
            { header: 'celular2', key: 'celular2', width: 15 },
            { header: 'direccion', key: 'direccion', width: 30 },
            { header: 'codigoproducto', key: 'codigoproducto', width: 20 },
            { header: 'medicamento', key: 'medicamento', width: 30 },
            { header: 'tipoproducto', key: 'tipoproducto', width: 20 },
            { header: 'laboratorio', key: 'laboratorio', width: 20 },
            { header: 'cobertura', key: 'cobertura', width: 15 },
            { header: 'cantidadprescrita', key: 'cantidadprescrita', width: 20 },
            { header: 'cantidadpendiente', key: 'cantidadpendiente', width: 20 },
            { header: 'cantidadentregada', key: 'cantidadentregada', width: 20 },
            { header: 'cantidadentregada1', key: 'cantidadentregada1', width: 20 },
            { header: 'fechaentrega1', key: 'fechaentrega1', width: 20 },
            { header: 'entrega1', key: 'entrega1', width: 20 },
            { header: 'cantidadentregada2', key: 'cantidadentregada2', width: 20 },
            { header: 'fechaentrega2', key: 'fechaentrega2', width: 20 },
            { header: 'entrega2', key: 'entrega2', width: 20 },
            { header: 'cantidadentregada3', key: 'cantidadentregada3', width: 20 },
            { header: 'fechaentrega3', key: 'fechaentrega3', width: 20 },
            { header: 'entrega3', key: 'entrega3', width: 20 },
            { header: 'cantidadentregada4', key: 'cantidadentregada4', width: 20 },
            { header: 'fechaentrega4', key: 'fechaentrega4', width: 20 },
            { header: 'entrega4', key: 'entrega4', width: 20 },
            { header: 'cantidadentregada5', key: 'cantidadentregada5', width: 20 },
            { header: 'fechaentrega5', key: 'fechaentrega5', width: 20 },
            { header: 'entrega5', key: 'entrega5', width: 20 },
            { header: 'cantidadentregada6', key: 'cantidadentregada6', width: 20 },
            { header: 'fechaentrega6', key: 'fechaentrega6', width: 20 },
            { header: 'entrega6', key: 'entrega6', width: 20 },
            { header: 'cantidadentregada7', key: 'cantidadentregada7', width: 20 },
            { header: 'fechaentrega7', key: 'fechaentrega7', width: 20 },
            { header: 'entrega7', key: 'entrega7', width: 20 },
            { header: 'cantidadentregada8', key: 'cantidadentregada8', width: 20 },
            { header: 'fechaentrega8', key: 'fechaentrega8', width: 20 },
            { header: 'entrega8', key: 'entrega8', width: 20 },
            { header: 'cantidadentregada9', key: 'cantidadentregada9', width: 20 },
            { header: 'fechaentrega9', key: 'fechaentrega9', width: 20 },
            { header: 'entrega9', key: 'entrega9', width: 20 },
            { header: 'cantidadentregada10', key: 'cantidadentregada10', width: 20 },
            { header: 'fechaentrega10', key: 'fechaentrega10', width: 20 },
            { header: 'entrega10', key: 'entrega10', width: 20 },
            { header: 'cantidadpendientefinal', key: 'cantidadpendientefinal', width: 25 },
            { header: 'tipoentrega', key: 'tipoentrega', width: 15 },
            { header: 'sedependiente', key: 'sedependiente', width: 15 },
            { header: 'estadodispensacion', key: 'estadodispensacion', width: 20 },
            { header: 'numeroformula', key: 'numeroformula', width: 20 },
            { header: 'cum', key: 'cum', width: 20 },
            { header: 'ambito', key: 'ambito', width: 15 },
            { header: 'nitips', key: 'nitips', width: 15 },
            { header: 'nombreips', key: 'nombreips', width: 30 },
            { header: 'tipocontrato', key: 'tipocontrato', width: 20 },
            { header: 'codigodiagnostico', key: 'codigodiagnostico', width: 20 },
            { header: 'diagnostico', key: 'diagnostico', width: 30 },
            { header: 'plansos', key: 'plansos', width: 20 },
            { header: 'fechaformula', key: 'fechaformula', width: 20 },
            { header: 'observacion', key: 'observacion', width: 30 },
            { header: 'registradopor', key: 'registradopor', width: 30 }
        ];

        // Agregar los datos de la base de datos
        results.forEach((row) => {
            worksheet.addRow(row);
        });

        // Guardar el archivo Excel temporalmente en el servidor
        const filePath = path.join(__dirname, 'reporte_pendientes.xlsx');
        workbook.xlsx.writeFile(filePath)
            .then(() => {
                // Enviar el archivo Excel al cliente
                res.download(filePath, 'reporte_pendientes.xlsx', (err) => {
                    if (err) {
                        console.error('Error al descargar el archivo:', err);
                    }

                    // Eliminar el archivo temporal después de enviarlo
                    fs.unlinkSync(filePath);
                });
            })
            .catch((error) => {
                console.error('Error al generar el archivo Excel:', error);
                res.status(500).json({ error: 'Error al generar el archivo Excel' });
            });
    });
});

app.post('/logout', (req, res) => {
    // Destruir la sesión
    req.session.destroy(err => {
        if (err) {
            return res.status(500).send('Error al cerrar sesión');
        }
        // Eliminar la cookie de sesión
        res.clearCookie('connect.sid'); // Esto limpia la cookie de sesión
        res.sendStatus(200); // Respuesta exitosa
    });
});

// Iniciar el servidor
app.listen(3000, () => {
    console.log('Servidor escuchando en el puerto http://localhost:3000/login.html');
});
