import * as fs from 'fs';
import express from 'express';
import bodyParser from 'body-parser';
import dotenv from 'dotenv';

dotenv.config();

const code = process.env.CODE || 'AAAAAA';
const webhookUrl = process.env.WEBHOOK || '';

// get last check from checkData file
let lastCheckTime = Date.now();

const app = express(); // init app

// body parser middleware
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.post('/api/check-code', async (req, res) => {
    const { checkCode } = req.body;
    await fetch(webhookUrl, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ content: `Someone tried to validate code "${checkCode}" at ${new Date().toLocaleString()}.` })
    });
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Cache-Control', 's-max-age=1, stale-while-revalidate');
    if (Date.now() - lastCheckTime < 120000) {
        return res.json({ success: false, message: 'You can only check the code every two minutes.' });
    }
    lastCheckTime = Date.now();
    if (checkCode === code) {
        res.json({ success: true });
    } else {
        res.json({ success: false });
    }
});

// start server
app.listen(3000, () => console.log('Server running on port 3000'));
export default app;
