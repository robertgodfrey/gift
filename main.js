import './style.css';

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
    <div style="position: fixed; bottom: 0; left: 0; right: 0; top: 20%; padding-bottom: 100px;">
        <h2>GUESS THE CODE</h2>
        <p class="read-the-docs">
            You can submit a guess every two minutes.<br/>
            A new hint will appear after <span id="guessCount">5</span> guesses.
        </p>
        <!-- <img src="" alt="Hint" style="width: 50%; border-radius: 15px;" /> -->
        <div id="hintContainer">
            <button id="hintOne" class="hint-btn">HINT #1</button>
        </div>
        <div class="guess-row">
            <div class="guess-box"> </div>
            <div class="guess-box"> </div>
            <div class="guess-box"> </div>
            <div class="guess-box"> </div>
            <div class="guess-box"> </div>
            <div class="guess-box"> </div>
        </div>
    </div>
    <div id="keyboard" style="position: fixed; bottom: 0; left: 0; right: 0;">
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
    const modalTitle = document.querySelector('#modalTitle');
    const modalText = document.querySelector('#modalText');

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
            showModal();
            modalTitle.innerHTML = 'HOLD YOUR HORSES';
            modalText.innerHTML = `You can only check a code every two minutes.<br/><br/>You can check again in ${json.secondsRemaining} seconds.`;
        } else {
            // modal - show guess result
            showModal();
            if (json.success) {
                modalTitle.innerHTML = 'YOU WIN!';
                modalText.innerHTML = 'Congratulations! You guessed the code!';
            } else {
                modalTitle.innerHTML = 'WRONG';
                if (json.message) {
                    modalText.innerHTML = json.message;
                } else {
                    modalText.innerHTML = `
                        <div>
                            Correct letters: <b>${json.correctLetters}</b>
                            <br/>
                            Correct letters and correct position: <b>${json.correctPositions}</b>
                            <br/><br/>
                            You can check again in 2 minutes.
                        </div>
                    `;
                    document.querySelector('#guessCount').innerHTML = json.guessesUntilHint;
                }
            }
            guessChars.length = 0;
            refreshGuesses();
        }
    } catch (e) {
        // modal - error
        showModal();
        modalTitle.innerHTML = 'ERROR';
        modalText.innerHTML = 'There was an error checking your code. Please try again.';
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

// on dom content loaded, get status
document.addEventListener('DOMContentLoaded', async () => {
    try {
        const res = await fetch('/api/status');
        const json = await res.json();
        if (json.hints) {
            Object.keys(json.hints).forEach((key) => {
                const button = document.createElement('button');
                button.classList.add('hint-btn');
                button.id = `hint${key}`;
                button.innerHTML = `HINT #${key}`;
                document.querySelector('#hintContainer').appendChild(button);
                document.querySelector(`#hint${key}`).addEventListener('click', () => {
                    showModal();
                    document.querySelector('#modalTitle').innerHTML = `HINT #${key}`;
                    document.querySelector('#modalText').innerHTML = `
                        <div class="imgHint">
                            <img src="${json.hints[key]}" alt="Hint" style="width: 80%; border-radius: 15px;" />
                        </div>
                    `;
                })
            });
        }
        if (json.guessesUntilHint) {
            document.querySelector('#guessCount').innerHTML = json.guessesUntilHint;
        }
    } catch (e) {
        console.error(e);
    }
});
