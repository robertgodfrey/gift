import './style.css'
import hint from '/hint.jpg'

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
    <h2>GUESSES REMAINING: 3</h2>
    <p class="read-the-docs">You can submit 3 guesses every 24 hours</p>
    <!-- <img src="${hint}" alt="Hint" style="width: 50%; border-radius: 15px;" /> -->
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

document.querySelector('#enterKey').addEventListener('click', () => {
    console.log('ENTER');
});

document.querySelector('#backKey').addEventListener('click', () => {
    guessChars.pop();
    refreshGuesses();
});
