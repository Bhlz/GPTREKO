// server.js
require('dotenv').config(); // Carga las variables de entorno desde .env
const express = require('express');
const { OpenAI } = require('openai'); // Importa OpenAI SDK v4
const cors = require('cors'); // Para manejar CORS

const app = express();

// Configura el cliente de OpenAI con tu clave API
const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY, // Usa la clave desde las variables de entorno
});

// Middlewares
app.use(cors()); // Permite solicitudes desde tu frontend
app.use(express.json()); // Permite al servidor entender JSON en el cuerpo de las solicitudes

// Ruta para manejar las solicitudes de chat
// ¡Importante! Esta ruta es ahora /api/chat para que coincida con el frontend y la convención de Vercel
app.post('/api/chat', async (req, res) => {
    const userMessage = req.body.message;

    if (!userMessage) {
        return res.status(400).json({ error: 'Mensaje no proporcionado.' });
    }

    try {
        const completion = await openai.chat.completions.create({
            model: "gpt-3.5-turbo", // O "gpt-4" si tienes acceso y lo prefieres
            messages: [{ role: "user", content: userMessage }],
            max_tokens: 150, // Límite de tokens para la respuesta
            temperature: 0.7, // Creatividad de la respuesta (0.0 a 1.0)
        });

        const aiResponse = completion.choices[0].message.content;
        res.json({ reply: aiResponse });

    } catch (error) {
        console.error('Error al comunicarse con OpenAI:', error);
        // Detalles adicionales para depuración
        if (error.response) {
            console.error('Estado HTTP:', error.response.status);
            console.error('Datos de error:', error.response.data);
        }
        res.status(500).json({ error: 'Error al obtener respuesta de la IA.' });
    }
});

// ¡CRÍTICO PARA VERCEL!
// Exporta la aplicación Express. Vercel espera un módulo exportado que contenga la aplicación.
module.exports = app;

/*
    *** NOTA IMPORTANTE PARA VERCEL ***
    Eliminamos la sección app.listen() porque Vercel no ejecuta tu aplicación
    como un servidor de larga duración en un puerto. En su lugar, cada solicitud
    a tu ruta API (/api/chat) activará esta función serverless.
*/