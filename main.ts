radio.setGroup(69)
radio.setTransmitPower(7)
radio.setFrequencyBand(20)
radio.setTransmitSerialNumber(true)

type IRC = {
    l: DigitalPin,
    c: DigitalPin,
    p: DigitalPin
}
const IR: IRC = {
    l: DigitalPin.P13,
    c: DigitalPin.P15,
    p: DigitalPin.P14
}
pins.setPull(IR.l, PinPullMode.PullNone);
pins.setPull(IR.c, PinPullMode.PullNone);
pins.setPull(IR.p, PinPullMode.PullNone);

let L: number = 0;
let P: number = 0;
let dataL: number = 0;
let dataC: number = 0;
let dataP: number = 0;
let krizovatka = false;

// === HLAVNÍ SMYČKA: ČTENÍ SENZORŮ ===
basic.forever(function () {
    dataL = pins.digitalReadPin(IR.l);
    dataC = pins.digitalReadPin(IR.c);
    dataP = pins.digitalReadPin(IR.p);

    if (krizovatka === false) {
        if (dataC === 1 && dataL === 0 && dataP === 0) {
            L = 150
            P = 150
        } else if (dataP === 0 && dataL === 1) {
            P = 250
            L = 50
        } else if (dataL === 0 && dataP === 1) {
            P = 50
            L = 250
        }
    }

    // Detekce křižovatky (čára pod středem, ale levý i pravý mimo)
    if (dataL === 1 && dataP === 1 && dataC === 0) {
        radio.sendNumber(0)
        P = 0
        L = 0
        krizovatka = true
    }

    setMotors(L, P)
    basic.pause(10)
})

// === RADIO: Příkazy pro odbočení ===
radio.onReceivedNumber(function (receivedNumber: number) {
    let serial: number = radio.receivedPacket(RadioPacketProperty.SerialNumber)
    if (serial === 1569162800) {
        if (krizovatka === true) {
            if (receivedNumber === 1) {
                // Doprava
                P = 250
                L = 50
                krizovatka = false
            } else if (receivedNumber === 2) {
                // Doleva
                L = 250
                P = 50
                krizovatka = false
            } else if (receivedNumber === 3) {
                // Rovně
                P = 150
                L = 150
                krizovatka = false
            }
        }
    }
})

// === FUNKCE pro řízení motorů ===
function setMotors(left: number, right: number) {
    const PWM_L = AnalogPin.P1   // uprav podle propojení
    const DIR_L = DigitalPin.P8
    const PWM_P = AnalogPin.P2
    const DIR_P = DigitalPin.P12

    // Levý motor
    if (left >= 0) {
        pins.digitalWritePin(DIR_L, 0)
        pins.analogWritePin(PWM_L, left)
    } else {
        pins.digitalWritePin(DIR_L, 1)
        pins.analogWritePin(PWM_L, -left)
    }

    // Pravý motor
    if (right >= 0) {
        pins.digitalWritePin(DIR_P, 0)
        pins.analogWritePin(PWM_P, right)
    } else {
        pins.digitalWritePin(DIR_P, 1)
        pins.analogWritePin(PWM_P, -right)
    }
}