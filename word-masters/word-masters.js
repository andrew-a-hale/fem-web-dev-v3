const postValidateWordUrl = "https://words.dev-apis.com/validate-word";
const getSecretWordUrl = "https://words.dev-apis.com/word-of-the-day";
var secretWord;
var guess = 1;
var buffer = "";
const inputCharSet = /^[a-zA-Z]$/;
const MAX_LENGTH = 5;

function flashInvalidGuess() {
    boxes = document.querySelector(`.guess-${guess}`).children
    for (let i = 0; i < boxes.length; i++) {
        boxes[i].classList.add("invalid")
    }
}

function removeFlash() {
    boxes = document.querySelector(`.guess-${guess}`).children
    for (let i = 0; i < boxes.length; i++) {
        boxes[i].classList.remove("invalid")
    }
}

function startLoader() {
    document.querySelector(".loader").classList.remove("hide");
    document.querySelector(".loader").classList.add("show");
}

function stopLoader() {
    document.querySelector(".loader").classList.remove("show");
    document.querySelector(".loader").classList.add("hide");
}

async function getSecretWord(puzzleNo) {
    startLoader();

    var url = getSecretWordUrl;
    if (puzzleNo) {
        req = url + "?puzzle=" + puzzleNo;
    }

    req = await fetch(url);
    const resp = await req.json();
    stopLoader();

    return resp.word.toLocaleUpperCase();
}

async function isValidWord(word) {
    const req = await fetch(
        postValidateWordUrl,
        {
            method: "POST",
            body: JSON.stringify({ word: word }),
            headers: {
                "Content-type": "application/json; charset=UTF-8"
            }
        }
    );

    const resp = await req.json();
    return resp.validWord;
}

async function gameLoop(event) {
    switch (event.key) {
        case "Enter":
            startLoader();
            await validateWord();
            stopLoader();
            break;
        case "Backspace":
            buffer = buffer.substring(0, buffer.length - 1);
            processBuffer(buffer);
            break;
        default:
            if (isLetter(event.key) && buffer.length < MAX_LENGTH) {
                buffer = buffer + event.key.toLocaleUpperCase();
            }
            processBuffer();
            break;
    }
}

function clearBuffer() {
    buffer = "";
}

function isLetter(input) {
    if (input.match(inputCharSet)) {
        return true;
    }
    return false;
}

function modifyCharAt(word, index, replacement) {
    if (index >= word.length) {
        return word;
    }
    return word.substring(0, index) + replacement + word.substring(index + 1);
}

async function validateWord() {
    if (buffer.length != MAX_LENGTH) {
        return;
    }

    let isValid = await isValidWord(buffer);
    if (!isValid) {
        flashInvalidGuess();
        return;
    }

    let secret = secretWord;
    let marked = [];
    // check hits
    for (let i = 0; i < buffer.length; i++) {
        box = document.querySelector(`.guess-${guess}`).children[i];
        if (buffer[i] == secret[i]) {
            marked.push(i);
            box.classList.add("hit");
            secret = modifyCharAt(secret, i, "-");
        }
    }

    // check present
    for (let i = 0; i < buffer.length; i++) {
        if (marked.includes(i)) {
            continue;
        }

        box = document.querySelector(`.guess-${guess}`).children[i];
        foundAt = secret.indexOf(buffer[i]);
        if (foundAt >= 0) {
            marked.push(i);
            secret = modifyCharAt(secret, foundAt, "-");
            box.classList.add("present");
        } else {
            box.classList.add("notpresent");
        }
    }

    // check for win
    if (buffer === secretWord) {
        document.removeEventListener("keydown", gameLoop);
        document.querySelector(".game-title").classList.add("glow");
        alert("you win");
    }

    // lose
    if (guess == 6) {
        alert("you lose, the word was " + secretWord);
    }

    clearBuffer();
    guess += 1;
}

function processBuffer() {
    boxes = document.querySelector(`.guess-${guess}`).children;

    removeFlash();
    for (let i = 0; i < boxes.length; i++) {
        if (buffer[i]) {
            boxes[i].innerText = buffer[i];
        } else {
            boxes[i].innerText = "";
        }
    }
}

async function init() {
    secretWord = await getSecretWord();
    document.addEventListener("keydown", gameLoop);
}

init();