// test.js
const test = require('node:test');
const assert = require('node:assert/strict');
const { smsSegments, nonGsmChars } = require('./sms-segments');

const OTP = "Your Example code is 482913. It expires in 10 minutes. Don't share it with anyone.";

test('160 plain characters fit in one GSM-7 message', () => {
  assert.deepEqual(smsSegments('a'.repeat(160)), { encoding: 'GSM-7', units: 160, segments: 1 });
});

test('longer GSM-7 messages split into parts of 153', () => {
  assert.equal(smsSegments('a'.repeat(161)).segments, 2);
  assert.equal(smsSegments('a'.repeat(306)).segments, 2);
  assert.equal(smsSegments('a'.repeat(307)).segments, 3);
});

test('extension characters such as € cost two septets', () => {
  assert.deepEqual(smsSegments('€'.repeat(80)), { encoding: 'GSM-7', units: 160, segments: 1 });
  assert.equal(smsSegments('€'.repeat(81)).segments, 2);
});

test('an escape pair is not cut between two parts', () => {
  const text = 'a'.repeat(152) + '€' + 'a'.repeat(152); // 306 septets
  assert.equal(smsSegments(text).segments, 3);
});

test('one curly apostrophe turns one message into two', () => {
  const curly = OTP.replace("'", '\u2019');
  assert.deepEqual(smsSegments(OTP), { encoding: 'GSM-7', units: 82, segments: 1 });
  assert.deepEqual(smsSegments(curly), { encoding: 'UCS-2', units: 82, segments: 2 });
  assert.deepEqual(nonGsmChars(curly), ['\u2019']);
});

test('UCS-2 allows 70 characters, then 67 per part', () => {
  assert.equal(smsSegments('ж'.repeat(70)).segments, 1);
  assert.equal(smsSegments('ж'.repeat(71)).segments, 2);
  assert.equal(smsSegments('ж'.repeat(134)).segments, 2);
  assert.equal(smsSegments('ж'.repeat(135)).segments, 3);
});

test('an emoji costs two units and is not cut in half', () => {
  assert.deepEqual(smsSegments('Code 123456 👍'), { encoding: 'UCS-2', units: 14, segments: 1 });
  const text = 'ж'.repeat(66) + '👍' + 'ж'.repeat(66); // 134 units
  assert.equal(smsSegments(text).segments, 3);
});
