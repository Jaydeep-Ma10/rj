import { validateAll } from './utils/validators.js';

// Test name validations
console.log('=== Testing Name Validations ===');
const testNames = [
  '', // empty
  'ab', // too short
  'a'.repeat(51), // too long
  'Test User', // valid
  'Test-User', // valid with hyphen
  'Test1', // invalid (contains number)
  'Test@User' // invalid (contains special char)
];

testNames.forEach(name => {
  const { isValid, errors } = validateAll({ name });
  console.log(`Name: "${name}"`);
  console.log(`Valid: ${isValid}`);
  if (!isValid) console.log('Errors:', errors.name.errors);
  console.log('---');
});

// Test mobile validations
console.log('\n=== Testing Mobile Validations ===');
const testMobiles = [
  '', // empty
  '12345', // too short
  '12345678901', // too long
  '1234567890', // valid
  '9876543210', // valid
  '123456789a', // invalid (contains letter)
  '12345 67890' // invalid (contains space)
];

testMobiles.forEach(mobile => {
  const { isValid, errors } = validateAll({ mobile });
  console.log(`Mobile: "${mobile}"`);
  console.log(`Valid: ${isValid}`);
  if (!isValid) console.log('Errors:', errors.mobile.errors);
  console.log('---');
});

// Test password validations
console.log('\n=== Testing Password Validations ===');
const testPasswords = [
  '', // empty
  '12345', // too short
  'password', // no number or special char
  'password1', // no special char
  'password!', // no number
  'Pass123!', // valid
  'Test@123' // valid
];

testPasswords.forEach(password => {
  const { isValid, errors } = validateAll({ password });
  console.log(`Password: "${password}"`);
  console.log(`Valid: ${isValid}`);
  if (!isValid) console.log('Errors:', errors.password.errors);
  console.log('---');
});
