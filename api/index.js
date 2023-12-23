import express from 'express';
import bodyParser from 'body-parser';
import dotenv from 'dotenv';

dotenv.config();

const code = process.env.CODE || 'AAAAAA';
const webhookUrl = process.env.WEBHOOK || '';
const secondsBetweenGuesses = 120;
const hints = {
    2: 'https://i.imgur.com/Sa65OCo.png',
    3: 'https://i.imgur.com/zbWUy7U.png',
    4: 'https://i.imgur.com/iCFkuEk.jpg',
    5: 'https://i.imgur.com/UayBhLJ.png',
};
const currentHints = {};

let lastCheckTime = Date.parse('01 Dec 2023 00:00:00 GMT');
let guessesUntilHint = 5;
let hintIndex = 1;

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
    if (!checkCode) {
        return res.json({ success: false, message: 'No code provided.' });
    }
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Cache-Control', 's-max-age=1, stale-while-revalidate');
    if (Date.now() - lastCheckTime < secondsBetweenGuesses * 1000) {
        const secondsRemaining = Math.round((secondsBetweenGuesses * 1000 - (Date.now() - lastCheckTime)) / 1000);
        return res.json({
            success: false,
            secondsRemaining,
        });
    }
    guessesUntilHint--;
    lastCheckTime = Date.now();
    if (checkCode === 'BZYUQS') {
        return res.json({ success: false, message: 'Nice try, hackerman!' });
    }
    if (checkCode !== code) {
        const correctLetters = new Set();
        const resBody = { success: false};
        let correctPositions = 0;
        for (let i = 0; i < checkCode.length; i++) {
            if (code.includes(checkCode[i])) {
                correctLetters.add(checkCode[i]);
            }
            if (checkCode[i] === code[i]) {
                correctPositions++;
            }
        }
        if (guessesUntilHint <= 0) {
            hintIndex++;
            currentHints[hintIndex] = hints[hintIndex];
            guessesUntilHint = 5;
        }
        resBody.hints = currentHints;
        resBody.correctLetters = correctLetters.size;
        resBody.correctPositions = correctPositions;
        resBody.guessesUntilHint = guessesUntilHint;
        res.json(resBody);
    } else {
        res.json({ success: true });
    }
});

app.get('/api/status', (req, res) => {
    const secondsRemaining = Math.round((secondsBetweenGuesses * 1000 - (Date.now() - lastCheckTime)) / 1000);
    return res.json({
        secondsRemaining: secondsRemaining < 0 ? 0 : secondsRemaining,
        hints: currentHints,
        guessesUntilHint,
    });
});

// start server
app.listen(3000, () => console.log('Server running on port 3000'));
export default app;
