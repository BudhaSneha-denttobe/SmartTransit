require('dotenv').config();
const express = require('express');
const router = express.Router();
const Groq = require('groq-sdk');
const Bus = require('../models/Bus');
const Route = require('../models/Route');
const Stop = require('../models/Stop');
const Schedule = require('../models/Schedule');
const ChatLog = require('../models/ChatLog');

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

router.post('/', async (req, res) => {
  try {
    const { message, userId } = req.body;

    const buses = await Bus.find().populate('routeId');
    const routes = await Route.find();
    const stops = await Stop.find();
    const schedules = await Schedule.find().populate('busId').populate('routeId');

    const busContext = `
      AVAILABLE BUSES:
      ${buses.map(b => `Bus ${b.busNumber} - Driver: ${b.driverName} - Status: ${b.status} - Route: ${b.routeId?.routeName || 'Not assigned'}`).join('\n')}
      
      AVAILABLE ROUTES:
      ${routes.map(r => `Route ${r.routeNumber}: ${r.routeName} - From: ${r.startPoint} To: ${r.endPoint} - Distance: ${r.totalDistance}km - Time: ${r.estimatedTime} - Status: ${r.status}`).join('\n')}
      
      AVAILABLE STOPS:
      ${stops.map(s => `Stop: ${s.stopName} (Code: ${s.stopCode})`).join('\n')}
      
      SCHEDULES:
      ${schedules.map(s => `Bus ${s.busId?.busNumber} on Route ${s.routeId?.routeName} - Departs: ${s.departureTime} - Arrives: ${s.arrivalTime} - Status: ${s.status} - Days: ${s.daysOfOperation.join(', ')}`).join('\n')}
    `;

    const completion = await groq.chat.completions.create({
      model: 'llama-3.1-8b-instant',
      messages: [
        {
          role: 'system',
          content: `You are BusBot, a helpful assistant for the Vijayawada Public Bus Tracking System.
          You help commuters find bus routes, check schedules, and get real-time bus status.
          
          Here is the current live data from our system:
          ${busContext}
          
          Answer questions based on this data only.
          For app guidance questions like "how to track a bus" or "how to use this app", 
          give simple step by step instructions.
          Be friendly, concise and helpful.
          If you don't know something, say "Please contact the bus authority for more information."`
        },
        {
          role: 'user',
          content: message
        }
      ],
      temperature: 0.7,
      max_tokens: 500
    });

    const reply = completion.choices[0].message.content;

    await ChatLog.create({
      userId: userId || 'guest',
      message,
      reply,
      intent: 'general'
    });

    res.json({ success: true, reply });

  } catch (error) {
    console.log('Chat error:', error.message);
    res.status(500).json({ success: false, reply: 'Sorry, something went wrong. Please try again!' });
  }
});

module.exports = router;