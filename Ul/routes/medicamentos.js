const express = require('express');
const router = express.Router();
const XLSX = require('xlsx');
const path = require('path');

// Ruta para buscar paciente por identificación
router.get('/paciente', (req, res) => {
    const numeroIdentificacion = req.query.numeroIdentificacion;

    // Consulta SQL para buscar el paciente
    const query = `
        SELECT tipoidentificacion, nombre,telefono, eps
        FROM pacientes 
        WHERE identificacion = ?;
    `;

    req.db.query(query, [numeroIdentificacion], (err, results) => {
        if (err) {
            console.error('Error en la consulta: ' + err);
            return res.status(500).json({ error: 'Error en la consulta' });
        }

        if (results.length > 0) {
            const paciente = results[0];
            res.json({
                tipoIdentificacion: paciente.tipoidentificacion,
                primerNombre: paciente.nombre,
                telefono: paciente.telefono,
                eps: paciente.eps
            });
        } else {
            res.status(404).json({ error: 'Paciente no encontrado' });
        }
    });
});

// Backend diagnostico
router.get('/diagnostico', (req, res) => {
    const idDiagnostico = req.query.codigo;

    // Consulta SQL para buscar el diagnóstico
    const query = `
        SELECT nombre
        FROM diagnostico
        WHERE codigo = ?;
    `;

    req.db.query(query, [idDiagnostico], (err, results) => {
        if (err) {
            console.error('Error en la consulta: ' + err);
            return res.status(500).json({ error: 'Error en la consulta' });
        }

        if (results.length > 0) {
            const diagnostico = results[0];
            res.json({
                nombre: diagnostico.nombre // Devuelve el nombre del diagnóstico
            });
        } else {
            res.status(404).json({ error: 'Diagnóstico no encontrado' });
        }
    });
});


// Ruta para obtener la lista de medicamentos
router.get('/medicamentos', (req, res) => {
    const db = req.db;
    db.query('SELECT codigo, nombre, laboratorio, tipoproducto, cobertura, cum FROM medicamentos', (err, results) => {
        if (err) {
            console.error('Error al consultar medicamentos: ' + err.stack);
            res.status(500).json({ error: 'Error al consultar medicamentos' });
            return;
        }
        res.json(results);
    });
});

router.get('/', (req, res) => {
    res.send('El enrutador de medicamentos está funcionando');
});

// Ruta para manejar la inserción de datos
router.post('/pendientes', (req, res) => {
    const {
        fecharegistro, identificacion, tipoidentificacion, nombre, medicamento, cantidadpendiente, numerofactura,
        tipoproducto, codigoproducto, cobertura, cantidadprescrita, tipoentrega, sedependiente, estadodispensacion,
        cum, concentracion, observacion, numeroformula, celular, celular2, direccion, ambito, nitips, nombreips,
        tipocontrato, codigodiagnostico, diagnostico, plansos, fechaformula, laboratorio,eps, registradopor
    } = req.body;

    // Verificar campos obligatorios
    if (!fecharegistro || !identificacion || !nombre) {
        return res.status(400).json({ message: 'Los campos fecharegistro, identificacion y nombre son requeridos' });
    }

    // Crear un objeto con los datos, omitiendo los campos no proporcionados
    const data = {
        fecharegistro: fecharegistro || null,
        identificacion,
        tipoidentificacion: tipoidentificacion || null,
        nombre,
        medicamento: medicamento || null,
        cantidadpendiente: cantidadpendiente || null,
        cantidadpendientefinal: cantidadpendiente || null,
        numerofactura: numerofactura || 1, // Valor temporal
    
        // Nuevos campos
        tipoproducto: tipoproducto || null,
        codigoproducto: codigoproducto || null,
        cobertura: cobertura || null,
        cantidadprescrita: cantidadprescrita || null,
        tipoentrega: tipoentrega || null,
        sedependiente: sedependiente || null,
        estadodispensacion: estadodispensacion || null,
        cum: cum || null,
        concentracion: concentracion || null,
        observacion: observacion || null,
        numeroformula: numeroformula || null,
        celular: celular || null,
        celular2: celular2 || null,
        direccion: direccion || null,
        ambito: ambito || null,
        nitips: nitips || null,
        nombreips: nombreips || null,
        tipocontrato: tipocontrato || null,
        codigodiagnostico: codigodiagnostico || null,
        diagnostico: diagnostico || null,
        plansos: plansos || null,
        fechaformula: fechaformula || null,
        laboratorio: laboratorio || null,
        eps: eps || null,
        registradopor: registradopor || null
    };

    // Código para insertar en la base de datos
    const sql = `
  INSERT INTO pendientes (
        fecharegistro, identificacion, tipoidentificacion, nombre, medicamento, cantidadpendiente, cantidadentregada, cantidadpendientefinal, numerofactura,
        tipoproducto, codigoproducto, cobertura, cantidadprescrita, tipoentrega, sedependiente, estadodispensacion,
        cum, concentracion, observacion, numeroformula, celular, celular2, direccion, ambito, nitips, nombreips,
        tipocontrato, codigodiagnostico, diagnostico, plansos, fechaformula, laboratorio, eps, registradopor
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ? ,?, ?, ?)
`;

const values = [
    data.fecharegistro, data.identificacion, data.tipoidentificacion, data.nombre, data.medicamento, data.cantidadpendiente,0, data.cantidadpendiente, data.numerofactura,
    data.tipoproducto, data.codigoproducto, data.cobertura, data.cantidadprescrita, data.tipoentrega, data.sedependiente, data.estadodispensacion,
    data.cum, data.concentracion, data.observacion, data.numeroformula, data.celular, data.celular2, data.direccion, data.ambito, data.nitips, data.nombreips,
    data.tipocontrato, data.codigodiagnostico, data.diagnostico, data.plansos, data.fechaformula, data.laboratorio, data.eps, data.registradopor
];


    req.db.query(sql, values, (error, results) => {
        if (error) {
            console.error('Error al guardar los datos: ', error);
            return res.status(500).json({ message: 'Error al guardar los datos' });
        }
        res.status(201).json({ message: 'Datos guardados correctamente' });
    });
});



// Endpoint para obtener el último número de factura
router.get('/pendientes/ultimoNumeroFactura', (req, res) => {
    const query = 'SELECT MAX(numeroFactura) AS ultimoNumeroFactura FROM pendientes';
    
    req.db.query(query, (error, results) => { // Cambia connection por req.db
        if (error) {
            console.error('Error al obtener el último número de factura:', error);
            return res.status(500).json({ error: 'Error al obtener el último número de factura' });
        }
        
        const ultimoNumeroFactura = results[0] ? results[0].ultimoNumeroFactura : null; // Verifica si results[0] existe
        res.json({ numeroFactura: ultimoNumeroFactura });
    });
});

// Ruta para manejar la inserción de datos pacientes
router.post('/pacientes', (req, res) => {
    const { identificacion, tipoidentificacion, nombre, telefono, eps} = req.body;

    // Verificar campos obligatorios
    if (!tipoidentificacion || !identificacion || !nombre || !telefono || !eps) {
        return res.status(400).json({ message: 'Los campos identificacion, nombre, tipo de identificacion, telefono y eps son requeridos' });
    }

    // Crear un objeto con los datos, omitiendo los campos no proporcionados
    const data = {
        identificacion,
        tipoidentificacion: tipoidentificacion || null,
        nombre,
        telefono,
        eps
    };
    // Código para insertar en la base de datos
    const sql = 'INSERT INTO pacientes (identificacion, tipoidentificacion, nombre, telefono, eps) VALUES (?, ?, ?, ?, ?)'; 
    const values = [data.identificacion, data.tipoidentificacion, data.nombre, data.telefono, data.eps]; 

    req.db.query(sql, values, (error, results) => {
        if (error) {
            console.error('Error al guardar los datos: ', error);
            return res.status(500).json({ message: 'Error al guardar los datos' });
        }
        res.status(201).json({ message: 'Datos guardados correctamente' });
    });
});

module.exports = router;
