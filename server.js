const express = require('express');
const bodyParser = require('body-parser');
const request = require('request');
const axios = require('axios');
const base64 = require('base-64');
const path = require('path');
const cors = require('cors');

const app = express();
const port = 3000;

// Middleware para manejar CORS
app.use(cors());
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, SOAPAction');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }
    
    next();
});

// Middleware para servir archivos estáticos
app.use(express.static(path.join(__dirname, 'public')));
app.use('/images', express.static(path.join(__dirname, 'images')));

// Middleware para analizar el cuerpo de la solicitud
app.use(bodyParser.text({ type: 'text/xml' }));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Ruta para manejar la primera solicitud SOAP (Consulta 1)
app.post('/proxy', (req, res) => {
    const soapUrl = 'http://centralaplicaciones.sos.com.co:80/ValidadorService2/services/ConsultaValidadorWebService';
    const soapAction = 'http://consulta.validador.ws.sos/getConsultaAfiliado';

    request.post({
        url: soapUrl,
        headers: {
            'Content-Type': 'text/xml; charset=utf-8',
            'SOAPAction': soapAction
        },
        body: req.body
    }, (error, response, body) => {
        if (error) {
            res.status(500).send('Error en la solicitud');
        } else {
            res.send(body);
        }
    });
});

// Ruta para manejar la segunda solicitud SOAP (Consulta 2)
app.post('/api/soap', async (req, res) => {
    const { numeroFormula, numeroIdentificacion, tipoIdentificacion } = req.body;

    const soapRequest = `
        <soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:ws="http://ws.formulacionservice.sos.com/">
           <soapenv:Header/>
           <soapenv:Body>
              <ws:consultarFormula>
                 <requestConsultarFormula>
                    <numeroFormula>${numeroFormula}</numeroFormula>
                    <numeroIdentificacion>${numeroIdentificacion}</numeroIdentificacion>
                    <tipoIdentificacion>${tipoIdentificacion}</tipoIdentificacion>
                 </requestConsultarFormula>
              </ws:consultarFormula>
           </soapenv:Body>
        </soapenv:Envelope>
    `;

    const headers = {
        'Content-Type': 'text/xml; charset=utf-8',
        'SOAPAction': 'consultarFormula',
        'Authorization': 'Basic ' + base64.encode('UD949151153:Wg2024*153'),
    };

    try {
        const response = await axios.post('https://centralaplicaciones.sos.com.co:443/ServiciosExternosSaludSOAPWeb/FormulacionSOAP', soapRequest, { headers });
        res.set('Content-Type', 'text/xml');
        res.send(response.data);
    } catch (error) {
        console.error("Error:", error);
        res.status(500).send('Error en la solicitud SOAP.');
    }
});

// Cuarta solicitud
// Ruta para manejar la solicitud REST
app.post('/api/rest', async (req, res) => {
    const { codPlan, codTipoIdAfiliado, numeroIdAfiliado, numeroOPS } = req.body;

    const requestBody = {
        codPlan,
        codTipoIdAfiliado,
        numeroIdAfiliado,
        numeroOPS
    };

    const headers = {
        'Content-Type': 'application/json',
        'Authorization': 'Basic ' + base64.encode('UD949151153:Wg2024*153'),
    };

    try {
        const response = await axios.post('https://centralaplicaciones.sos.com.co/AutorizadorPrestacionesServiceRESTWeb/rest/ops/validar', requestBody, { headers });
        res.json(response.data);
    } catch (error) {
        console.error("Error en la solicitud REST:", error.response ? error.response.data : error.message);
        res.status(error.response ? error.response.status : 500).send(error.response ? error.response.data : 'Error en la solicitud REST.');
    }
});

// Ruta para servir el archivo consulta.html
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'consulta.html'));
});

// Iniciar el servidor
app.listen(port, () => {
    console.log(`Servidor escuchando en http://192.168.1.26:${port}`);
});
