import './style.css';

const correctCode = 'NULPWE';
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

document.querySelector('#app').innerHTML = `
  <div>
    <h2>GUESS THE CODE</h2>
    <p class="read-the-docs">You can submit a guess every two minutes.<br/>A new hint will appear in 5 guesses.</p>
    <!-- <img src="" alt="Hint" style="width: 50%; border-radius: 15px;" /> -->
    <button class="hint-btn">HINT #1</button>
    <div class="guess-row">
        <div class="guess-box"> </div>
        <div class="guess-box"> </div>
        <div class="guess-box"> </div>
        <div class="guess-box"> </div>
        <div class="guess-box"> </div>
        <div class="guess-box"> </div>
    </div>
    <div id="keyboard">
        <div class="row">
            ${topKeys.map(key => `<button class="key">${key}</button>`).join('')}
        </div>
        <div class="row">
            ${middleKeys.map(key => `<button class="key">${key}</button>`).join('')}
        </div>
        <div class="row">
            <button id="enterKey">ENTER</button>
            ${bottomKeys.map(key => `<button class="key">${key}</button>`).join('')}
            <button id="backKey">BACK</button>
        </div>
    </div>
  </div>
`;

const keys = document.querySelectorAll('.key');
keys.forEach(key => {
    key.addEventListener('click', () => {
        pushKey(key.innerHTML);
    });
});

document.querySelector('#enterKey').addEventListener('click', async () => {
    console.log('ENTER');
    const res = await fetch('https://gift-ecru.vercel.app/api/check-code', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ checkCode: guessChars.join('') })
    });
    console.log(res);
});

document.querySelector('#backKey').addEventListener('click', () => {
    guessChars.pop();
    refreshGuesses();
});
