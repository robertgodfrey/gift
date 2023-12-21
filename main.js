import './style.css';

const correctCode = 'NXLPWE';
const topKeys = ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'];
const middleKeys = ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L'];
const bottomKeys = ['Z', 'X', 'C', 'V', 'B', 'N', 'M'];
const guessChars = [];

function refreshGuesses() {
    document.querySelectorAll('.guess-box').forEach((box, index) => {
        box.innerHTML = guessChars[index] || '';
    });
}

function pushKey(key) {
    if (guessChars.length >= 6) return;
    guessChars.push(key);
    refreshGuesses();
}

function playHint() {
    const audio = new Audio('/hint.mp3');
    audio.play();
}

document.querySelector('#app').innerHTML = `
  <div>
    <h2>GUESS THE CODE</h2>
    <p class="read-the-docs">You can submit a guess every two minutes.<br/>A new hint will appear in 5 guesses.</p>
    <!-- <img src="" alt="Hint" style="width: 50%; border-radius: 15px;" /> -->
    <button class="hint-btn" onclick="playHint">HINT #1</button>
    <div class="guess-row">
        <div class="guess-box"> </div>
        <div class="guess-box"> </div>
        <div class="guess-box"> </div>
        <div class="guess-box"> </div>
        <div class="guess-box"> </div>
        <div class="guess-box"> </div>
    </div>
    <div id="keyboard">
        <div class="keyboard-row">
            ${topKeys.map(key => `<button class="keyboard-key">${key}</button>`).join('')}
        </div>
        <div class="keyboard-row">
            ${middleKeys.map(key => `<button class="keyboard-key">${key}</button>`).join('')}
        </div>
        <div class="keyboard-row">
            <button id="enterKey">ENTER</button>
            ${bottomKeys.map(key => `<button class="keyboard-key">${key}</button>`).join('')}
            <button id="backKey">BACK</button>
        </div>
    </div>
  </div>
`;

document.querySelectorAll('.keyboard-key').forEach(key => {
    key.addEventListener('click', () => {
        pushKey(key.innerHTML);
    });
});

document.querySelector('#enterKey').addEventListener('click', async () => {
    const res = await fetch('/api/check-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ checkCode: guessChars.join('') })
    });
    const json = await res.json();
    if (json.secondsRemaining && json.secondsRemaining > 0) {

    } else {
        guessChars.length = 0;
        refreshGuesses();
    }
    console.log(json);
});

document.querySelector('#backKey').addEventListener('click', () => {
    guessChars.pop();
    refreshGuesses();
});

// add keyboard event listener for letters, enter, and backspace
document.addEventListener('keydown', e => {
    if (e.key === 'Enter') {
        document.querySelector('#enterKey').click();
    } else if (e.key === 'Backspace') {
        document.querySelector('#backKey').click();
    } else if (e.key.length === 1) {
        pushKey(e.key.toUpperCase());
    }
});
