const postValidateWordUrl = "https://words.dev-apis.com/validate-word";
const getSecretWordUrl = "https://words.dev-apis.com/word-of-the-day";
var secretWord;
var guess = 1;
var buffer = "";
const inputCharSet = /^[a-zA-Z]$/;
const MAX_LENGTH = 5;
const ROUNDS = 6;
let isLoading = true;

function flashWord() {
    boxes = document.querySelector(`.guess-${guess}`).children;
    for (let i = 0; i < boxes.length; i++) {
        boxes[i].classList.remove("invalid");
        setTimeout(() => { boxes[i].classList.add("invalid") }, 10)
    }
}

function toggleLoader(isLoading) {
    document.querySelector(".loader").classList.toggle("hide", !isLoading);
}

async function getSecretWord(puzzleNo) {
    var url = getSecretWordUrl;
    if (puzzleNo) {
        req = url + "?puzzle=" + puzzleNo;
    }

    res = await fetch(url);
    const { word } = await res.json();

    return word.toLocaleUpperCase();
}

async function isValidWord(word) {
    const res = await fetch(
        postValidateWordUrl,
        {
            method: "POST",
            body: JSON.stringify({ word: word }),
            headers: {
                "Content-type": "application/json; charset=UTF-8"
            }
        }
    );

    const { validWord } = await res.json();
    return validWord;
}

async function gameLoop(event) {
    if (isLoading) {
        return;
    }

    switch (event.key) {
        case "Enter":
            isLoading = true;
            toggleLoader(isLoading);
            await validateWord();
            isLoading = false;
            toggleLoader(false);
            break;
        case "Backspace":
            buffer = buffer.substring(0, buffer.length - 1);
            processBuffer();
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
        flashWord();
        return;
    }

    // check hits
    let secret = secretWord;  // copy of secretWord to be consumed
    for (let i = 0; i < buffer.length; i++) {
        box = document.querySelector(`.guess-${guess}`).children[i];
        if (buffer[i] == secretWord[i]) {
            box.classList.add("hit");
            secret = modifyCharAt(secret, i, "-");  // consume letter
        }
    }

    // check present
    for (let i = 0; i < buffer.length; i++) {
        if (buffer[i] == secretWord[i]) {
            continue;
        }

        box = document.querySelector(`.guess-${guess}`).children[i];
        foundAt = secret.indexOf(buffer[i]);
        if (foundAt >= 0) {
            secret = modifyCharAt(secret, foundAt, "-");  // consume letter
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
    if (guess == ROUNDS) {
        alert("you lose, the word was " + secretWord);
    }

    clearBuffer();
    guess += 1;
}

function processBuffer() {
    boxes = document.querySelector(`.guess-${guess}`).children;
    for (let i = 0; i < boxes.length; i++) {
        boxes[i].innerText = buffer[i] || "";
    }
}

async function init() {
    toggleLoader(isLoading);
    secretWord = await getSecretWord();
    isLoading = false;
    toggleLoader(isLoading);

    document.addEventListener("keydown", gameLoop);
}

init();