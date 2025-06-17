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
let intersection = false;

basic.forever(function () {
    let dataL = pins.digitalReadPin(IR.l);
    let dataC = pins.digitalReadPin(IR.c);
    let dataP = pins.digitalReadPin(IR.p);

    PCAmotor.MotorRun(PCAmotor.Motors.M1, L)
    PCAmotor.MotorRun(PCAmotor.Motors.M4, P)

    if (!intersection) {
        if (dataC === 1 && dataL === 0 && dataP === 0) {
            L = 200;
            P = 200;
        } else if (dataL === 1 && dataP === 0 && dataC === 0) {
            L = 50;
            P = 250;
        } else if (dataL === 0 && dataP === 1 && dataC === 0) {
            L = 250;
            P = 50;
        }
    }

    if (dataL === 1 && dataP === 1) {
        radio.sendNumber(0);
        L = 0;
        P = 0;
        intersection = true;
    }
    else if (dataC === 1 && dataP === 1) {
        radio.sendNumber(0);
        L = 0;
        P = 0;
        intersection = true;
    }
    else if (dataL === 1 && dataC === 1) {
        radio.sendNumber(0);
        L = 0;
        P = 0;
        intersection = true;
    }
    else if (dataL === 1 && dataP === 1 && dataC === 1) {
        radio.sendNumber(0);
        L = 0;
        P = 0;
        intersection = true;
    }

});

radio.onReceivedNumber(function (receivedNumber: number) {
    let serial = radio.receivedPacket(RadioPacketProperty.SerialNumber);
    if (serial === 1569162800) {
        if (receivedNumber === 1) {
            L = 50;
            P = 250;
        } else if (receivedNumber === 2) {
            L = 250;
            P = 50;
        } else if (receivedNumber === 3) {
            L = 200;
            P = 200;
        }
        intersection = false;
    }
});
