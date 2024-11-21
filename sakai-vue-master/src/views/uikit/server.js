// server.js
const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');
const http = require('http'); // Importar http
const { Server } = require('socket.io'); // Importar socket.io

const app = express();
const port = process.env.PORT || 3000;

// Middleware para manejar CORS (opcional)
app.use(cors());

// Configura la conexión a PostgreSQL
const pool = new Pool({
    user: 'postgres',
    host: 'localhost',
    database: 'restaurante',
    password: '1503',
    port: 5432
});

// Crear servidor HTTP y servidor de sockets
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: '*',
    },
});

// Rutas API
app.get('/api/sales', async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT DATE_TRUNC('month', fecha) AS mes, SUM(monto) AS totalVentas
            FROM pedidos
            GROUP BY mes
            ORDER BY mes;
        `);
        res.json(result.rows);
        io.emit('salesData', result.rows); // Emitir datos de ventas
    } catch (error) {
        console.error('Error fetching sales data:', error);
        res.status(500).send('Error fetching sales data');
    }
});

app.get('/api/frequent-customers', async (req, res) => {
    try {
        const result = await pool.query(`
            WITH clientes_frecuentes AS (
                SELECT 
                    DATE_TRUNC('month', p.fecha) AS mes, 
                    c.nombre, 
                    c.apellidos, 
                    COUNT(p.idCliente) AS total_pedidos
                FROM 
                    pedidos p
                JOIN 
                    clientes c ON p.idCliente = c.idCliente
                WHERE 
                    p.fecha >= DATE_TRUNC('month', CURRENT_DATE) - INTERVAL '2 months'
                GROUP BY 
                    mes, c.nombre, c.apellidos
            )
            SELECT 
                mes, 
                nombre, 
                apellidos, 
                total_pedidos
            FROM 
                clientes_frecuentes
            ORDER BY 
                mes DESC, 
                total_pedidos DESC
            LIMIT 9;
        `);
        res.json(result.rows);
        io.emit('customersData', result.rows); // Emitir datos de clientes frecuentes
    } catch (error) {
        console.error('Error fetching frequent customers data:', error);
        res.status(500).send('Error fetching frequent customers data');
    }
});

// Manejo de conexiones de sockets
io.on('connection', (socket) => {
    console.log('a user connected');

    socket.on('disconnect', () => {
        console.log('user disconnected');
    });
});

// Inicia el servidor
server.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
