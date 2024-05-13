let buf = "";
let intbuf = 0;
let op = "";
let total = 0;
let display = document.querySelector(".display");

document
    .querySelector(".buttons")
    .addEventListener("click", function (event) {
        eventHandler(event.target.innerText);
        writeBuffer();
    })

function resetBuffer() {
    buf = "0";
    intbuf = 0;
}

function writeBuffer() {
    display.innerText = buf;
}

function backspaceBuffer() {
    if (buf.length > 1) {
        buf = buf.toString().substring(0, buf.length - 1);
    } else {
        resetBuffer();
    }
}

function nextOperand(event) {
    op = event;
    total = parseInt(buf);
    resetBuffer();
}

function handleMath() {
    intbuf = parseInt(buf);
    switch (op) {
        case "÷":
            if (intbuf == 0) {
                throw new Error("DivisionByZeroError");
            }
            total /= intbuf;
            break;
        case "x":
            total *= intbuf;
            break;
        case "-":
            total -= intbuf;
            break;
        case "+":
            total += intbuf;
            break;
        default:
            throw new Error("InvalidOperatorError");

    }
    intbuf = total;
    buf = intbuf;
}

function clearState() {
    total = 0;
    resetBuffer();
}

function eventHandler(event) {
    if (isNaN(parseInt(event))) {
        handleSymbol(event);
    } else {
        handleNumber(event);
    }
}

function handleNumber(event) {
    if (buf == "0") {
        buf = event;
    } else {
        buf += event;
    }
}

function handleSymbol(event) {
    switch (event) {
        case "C":
            clearState();
            break;
        case "←":
            backspaceBuffer();
            break;
        case "=":
            handleMath();
            break;
        case "÷":
        case "x":
        case "-":
        case "+":
            nextOperand(event);
            break;
    }
    console.info(`total: ${total}, op: ${op}, buf: ${buf}`);
};
