radio.setGroup(69);
radio.setTransmitPower(7);
radio.setFrequencyBand(20);
radio.setTransmitSerialNumber(true);

type IRC = {
    l: DigitalPin,
    c: DigitalPin,
    p: DigitalPin
};

const IR: IRC = {
    l: DigitalPin.P14,
    c: DigitalPin.P15,
    p: DigitalPin.P13
};

pins.setPull(IR.l, PinPullMode.PullNone);
pins.setPull(IR.c, PinPullMode.PullNone);
pins.setPull(IR.p, PinPullMode.PullNone);

let L = 0;
let P = 0;

let dataL = 0;
let dataC = 0;
let dataP = 0;

let intersection = false;
let waitingForCommand = false;

radio.onReceivedString(function (received) {
    if (waitingForCommand) {
        if (received === "LEFT") {
            // Odbočit doleva
            L = 150;
            P = 50;
        } else if (received === "RIGHT") {
            // Odbočit doprava
            L = 50;
            P = 150;
        } else if (received === "STRAIGHT") {
            // Pokračovat rovně
            L = 150;
            P = -150;
        }
        waitingForCommand = false;
        intersection = false;
    }
});

basic.forever(function () {
    // Čtení senzorů
    dataL = pins.digitalReadPin(IR.l);
    dataC = pins.digitalReadPin(IR.c);
    dataP = pins.digitalReadPin(IR.p);

    if (!intersection && (dataL === 1 && dataC === 1 && dataP === 1)) {
        // Detekce křižovatky
        L = 0;
        P = 0;
        intersection = true;
        waitingForCommand = true;
        radio.sendString("WAITING");
    }

    // Řízení podle čáry (jen pokud nečeká na příkaz)
    if (!waitingForCommand && !intersection) {
        if (dataC === 0 && dataL === 1 && dataP === 1) {
            // Jízda rovně
            L = 150;
            P = -150;
        } else if (dataL === 0 && dataC === 1 && dataP === 1) {
            // Mírně doprava
            L = 50;
            P = -150;
        } else if (dataP === 0 && dataC === 1 && dataL === 1) {
            // Mírně doleva
            L = 150;
            P = -50;
        } else {
            // Stop při ztrátě čáry
            L = 0;
            P = 0;
        }
    }

    // Posílání příkazů motorům
    PCAmotor.MotorRun(PCAmotor.Motors.M1, L);
    PCAmotor.MotorRun(PCAmotor.Motors.M4, P);
});
