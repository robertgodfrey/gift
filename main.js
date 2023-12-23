import './style.css';

const correctCode = 'NXLPWE';
const topKeys = ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'];
const middleKeys = ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L'];
const bottomKeys = ['Z', 'X', 'C', 'V', 'B', 'N', 'M'];
const guessChars = [];

const audioHint = new Audio('/hint1.mp3');
let countdownInterval;

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

function setTimeHint(secondsRemaining) {
    const formattedSeconds = secondsRemaining < 10 ? `0${secondsRemaining}` : secondsRemaining;
    document.querySelector('#hintOne').innerHTML = `STOP 0:${formattedSeconds}`;
}

function showModal() {
    document.querySelector('#modal').classList.remove('overlay-bg-hidden');
    document.querySelector('#modal').classList.add('overlay-bg');
}

document.querySelector('#app').innerHTML = `
  <div>
    <h2>GUESS THE CODE</h2>
    <p class="read-the-docs">You can submit a guess every two minutes.<br/>A new hint will appear in 5 guesses.</p>
    <!-- <img src="" alt="Hint" style="width: 50%; border-radius: 15px;" /> -->
    <button id="hintOne" class="hint-btn">HINT #1</button>
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
    const loading = document.querySelector('#loading');
    const modal = document.querySelector('#modal');
    loading.classList.remove('overlay-bg-hidden');
    loading.classList.add('overlay-bg');
    try {
        const res = await fetch('/api/check-code', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ checkCode: guessChars.join('') })
        });
        const json = await res.json();
        if (json.secondsRemaining && json.secondsRemaining > 0) {
            // modal - ya gotta wait
        } else {
            // modal - show guess result
            guessChars.length = 0;
            refreshGuesses();
        }
    } catch (e) {
        // modal - error
        console.error(e);
    }
    loading.classList.remove('overlay-bg');
    loading.classList.add('overlay-bg-hidden');
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

document.querySelector('#modal').addEventListener('click', () => {
    document.querySelector('#modal').classList.remove('overlay-bg');
    document.querySelector('#modal').classList.add('overlay-bg-hidden');
});

document.querySelector('#hintOne').addEventListener('click', () => {
    let secondsRemaining = 27;
    try {
        if (!audioHint.paused) {
            audioHint.pause();
            audioHint.currentTime = 0;
            document.querySelector('#hintOne').innerHTML = 'HINT #1';
            clearInterval(countdownInterval);
        } else {
            audioHint.play();
            countdownInterval = setInterval(() => {
                setTimeHint(secondsRemaining);
                secondsRemaining--;
                // clear interval if seconds below 1
                if (secondsRemaining < 0) {
                    clearInterval(countdownInterval);
                    document.querySelector('#hintOne').innerHTML = 'HINT #1';
                }
            }, 1000);
            document.querySelector('#hintOne').innerHTML = 'STOP 0:28';
        }
    } catch (e) {
        console.error(e);
    }
});
