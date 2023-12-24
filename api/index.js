import express from 'express';
import bodyParser from 'body-parser';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
//import cors from 'cors';

const dbSchema = mongoose.Schema({
    name: String,
    value: String,
});

const DB = mongoose.model('DB', dbSchema, 'PlzDontEdit');

dotenv.config();

const code = process.env.CODE || 'AAAAAA';
const webhookUrl = process.env.WEBHOOK || '';

try {
    const conn = await mongoose.connect(process.env.MONGO_URI, {
        dbName: 'rob-dev',
    });
    console.log(`MongoDB connected: ${conn.connection.host}`);
} catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
}

let guessesUntilHint = 3;
let hintIndex = 1;

const secondsBetweenGuesses = 180;
const hints = {
    2: 'https://i.imgur.com/Sa65OCo.png',
    3: 'https://i.imgur.com/zbWUy7U.png',
    4: 'https://i.imgur.com/iCFkuEk.jpg',
    5: 'https://i.imgur.com/UayBhLJ.png',
};
const currentHints = {};

let lastCheckTime = Date.parse('01 Dec 2023 00:00:00 GMT');

const app = express(); // init app
//app.use(cors());

async function postWebhook(message) {
    await fetch(webhookUrl, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            content: `${message} at ${new Date().toLocaleString()} UTC.`,
        })
    });
}
// body parser middleware
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.post('/api/check-code', async (req, res) => {
    const { checkCode } = req.body;
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Cache-Control', 's-max-age=1, stale-while-revalidate');
    if (!checkCode) {
        postWebhook('Someone tried to check a code, but didn\'t provide a code -');
        return res.json({ success: false, message: 'No code provided.' });
    }
    if (Date.now() - lastCheckTime < secondsBetweenGuesses * 1000) {
        const secondsRemaining = Math.round((secondsBetweenGuesses * 1000 - (Date.now() - lastCheckTime)) / 1000);
        return res.json({
            success: false,
            secondsRemaining,
        });
    }
    const dbGuessesDoc= await DB.findOne({ name: 'guessesUntilHint' });
    const dbHintIndexDoc = await DB.findOne({ name: 'hintIndex' });
    guessesUntilHint = dbGuessesDoc.value || 3;
    hintIndex = dbHintIndexDoc.value || 1;
    guessesUntilHint--;
    await DB.findOneAndUpdate({ name: 'guessesUntilHint' }, { value: guessesUntilHint });
    lastCheckTime = Date.now();
    if (checkCode === 'BZYUQS') {
        postWebhook('Someone tried to check the dummy code! #hackerman');
        return res.json({ success: false, message: 'Nice try, hackerman!' });
    }
    if (checkCode !== code) {
        let correctLetters = 0;
        let correctPositions = 0;
        for (let i = 0; i < code.length; i++) {
            if (checkCode.includes(code[i])) {
                correctLetters++;
            }
            if (checkCode[i] === code[i]) {
                correctPositions++;
            }
        }
        if (guessesUntilHint <= 0) {
            hintIndex++;
            currentHints[hintIndex] = hints[hintIndex];
            guessesUntilHint = 3;
            await DB.findOneAndUpdate({ name: 'guessesUntilHint' }, { value: guessesUntilHint });
            await DB.findOneAndUpdate({ name: 'hintIndex' }, { value: hintIndex });
        }
        postWebhook(`Someone tried to check code ${checkCode} (${correctLetters} correct letters, ${correctPositions} correct positions)`);
        res.json({
            success: false,
            hints: currentHints,
            correctLetters: correctLetters,
            correctPositions: correctPositions,
            guessesUntilHint: guessesUntilHint,
        });
    } else {
        postWebhook(`Someone guessed the code! (${checkCode})`);
        res.json({ success: true, code: code });
    }
});

app.get('/api/status', async (req, res) => {
    const dbGuessesDoc= await DB.findOne({ name: 'guessesUntilHint' });
    const dbHintIndexDoc = await DB.findOne({ name: 'hintIndex' });
    guessesUntilHint = dbGuessesDoc.value || 3;
    hintIndex = dbHintIndexDoc.value || 1;
    const secondsRemaining = Math.round((secondsBetweenGuesses * 1000 - (Date.now() - lastCheckTime)) / 1000);
    if (hintIndex > 1) {
        for (let i = 1; i <= hintIndex; i++) {
            currentHints[i] = hints[i];
        }
    }
    return res.json({
        secondsRemaining: secondsRemaining < 0 ? 0 : secondsRemaining,
        hints: currentHints,
        guessesUntilHint,
    });
});

// start server
app.listen(3000, () => console.log('Server running on port 3000'));
export default app;
