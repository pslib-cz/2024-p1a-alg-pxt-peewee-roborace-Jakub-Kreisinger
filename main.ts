type IRC = {
    l: DigitalPin,
    c: DigitalPin,
    r: DigitalPin
}
type PinData = {
    l: boolean,
    c: boolean,
    r: boolean
}
const IR: IRC = {
    l: DigitalPin.P14,
    c: DigitalPin.P15,
    r: DigitalPin.P13
}
pins.setPull(IR.l, PinPullMode.PullNone);
pins.setPull(IR.c, PinPullMode.PullNone);
pins.setPull(IR.r, PinPullMode.PullNone);

let data: PinData = {l: false, c: false, r: false};
basic.forever(function () {
    data.l = pins.digitalReadPin(IR.l) === 1;
    data.c = pins.digitalReadPin(IR.c) === 1;
    data.r = pins.digitalReadPin(IR.r) === 1;
    console.log(data);

    basic.pause(20)
})




pins.setPull(IR.l, PinPullMode.PullNone);
pins.setPull(IR.c, PinPullMode.PullNone);
pins.setPull(IR.r, PinPullMode.PullNone);

let L = 0;
let P = 0;
let dataL = 0;
let dataC = 0;
let dataP = 0;

basic.forever(function () {
    dataL = pins.digitalReadPin(IR.l);
    dataC = pins.digitalReadPin(IR.c);
    dataP = pins.digitalReadPin(IR.r);
})

basic.forever(function () {
    if (dataP === 1 && dataL === 0 && dataC === 0) {
        // Přímá jízda
        L = 150;
        P = -150;
    } else if (dataL === 1 && dataC === 0 && dataP === 0) {
        // Odbočit doprava
        L = 50;
        P = -150;
    } else if (dataC === 1 && dataP === 0 && dataL === 0) {
        // Odbočit doleva
        L = 150;
        P = -50;
    } else {
        // Zastavit, nebo ztráta čáry
        L = 0;
        P = 0;
    }
})

basic.forever(function () {
    // Ovládání motorů – oba jedou vpřed
    PCAmotor.MotorRun(PCAmotor.Motors.M1, L)  // Levý motor
    PCAmotor.MotorRun(PCAmotor.Motors.M4, P)  // Pravý motor
})
