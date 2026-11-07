# sms-segment-counter

Count how many SMS segments a text message uses and whether it is sent as **GSM-7** or **UCS-2**. Zero dependencies, about 40 lines.

**Try it in the browser:** https://saadulla.github.io/sms-segment-counter/

```js
const { smsSegments, nonGsmChars } = require('./sms-segments');

smsSegments('Your code is 482913.');
// { encoding: 'GSM-7', units: 20, segments: 1 }

smsSegments('Don’t share this code');   // curly apostrophe
// { encoding: 'UCS-2', units: 22, segments: 1 }

nonGsmChars('Don’t share this code');
// [ '’' ]
```

## Rules it implements

| Encoding | One SMS | Each part of a long SMS |
| --- | --- | --- |
| GSM-7 | 160 septets | 153 septets |
| UCS-2 | 70 code units | 67 code units |

- One character outside the GSM 03.38 alphabet switches the whole message to UCS-2.
- Extension characters (`€ [ ] { } ~ ^ \ |` and form feed) stay in GSM-7 but cost two septets.
- In UCS-2, characters outside the Basic Multilingual Plane, such as most emoji, cost two units.
- When a message is split, an escape pair or an emoji is never cut between two parts.

Some providers split long messages slightly differently, so treat the result as a close estimate.

## Tests

```bash
npm test   # node --test test.js -> 7 passing
```

## Background

The full write-up, including why a single smart quote can double the cost of an OTP message, is here: [SMS character limit: GSM-7 vs UCS-2 and a segment counter in JavaScript](https://saadulla.github.io/sms-segment-counter/sms-character-limit.html).

A counter tells you what you'll pay for, not how a handset displays the message. To see real delivery, send a test to a real number; free public numbers on [Temp SMS](https://tempsmss.com/) show incoming texts on a web page (anyone can read them, so use them only for test messages).

Related: [SMS OTP testing examples (pytest)](https://github.com/Saadulla/sms-otp-testing-examples).

## License

MIT
