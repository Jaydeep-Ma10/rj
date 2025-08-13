import validator from 'validator';
const { isMobilePhone, isLength, isAlphanumeric } = validator;

// Common validation rules
export const validationRules = {
  name: {
    minLength: 3,
    maxLength: 50,
    pattern: /^[a-zA-Z\s'-]+$/
  },
  mobile: {
    length: 10,
    locale: 'en-IN' // For Indian mobile numbers
  },
  password: {
    minLength: 6,
    requireNumber: true,
    requireSpecialChar: true
  }
};

// Validation error messages
export const validationMessages = {
  name: {
    required: 'Name is required',
    minLength: `Name must be at least ${validationRules.name.minLength} characters`,
    maxLength: `Name must not exceed ${validationRules.name.maxLength} characters`,
    invalid: 'Name can only contain letters, spaces, hyphens, and apostrophes'
  },
  mobile: {
    required: 'Mobile number is required',
    invalid: 'Please enter a valid 10-digit Indian mobile number',
    length: 'Mobile number must be 10 digits'
  },
  password: {
    required: 'Password is required',
    minLength: `Password must be at least ${validationRules.password.minLength} characters`,
    number: 'Password must contain at least one number',
    specialChar: 'Password must contain at least one special character'
  }
};

// Validate name
export const validateName = (name) => {
  const errors = [];
  
  if (!name) {
    errors.push(validationMessages.name.required);
    return { isValid: false, errors };
  }

  const trimmedName = name.trim();
  
  if (trimmedName.length < validationRules.name.minLength) {
    errors.push(validationMessages.name.minLength);
  }
  
  if (trimmedName.length > validationRules.name.maxLength) {
    errors.push(validationMessages.name.maxLength);
  }
  
  if (!validationRules.name.pattern.test(trimmedName)) {
    errors.push(validationMessages.name.invalid);
  }
  
  return {
    isValid: errors.length === 0,
    errors: errors.length > 0 ? errors : null,
    value: trimmedName
  };
};

// Validate mobile
export const validateMobile = (mobile) => {
  const errors = [];
  
  if (!mobile) {
    errors.push(validationMessages.mobile.required);
    return { isValid: false, errors };
  }
  
  const mobileStr = String(mobile).trim();
  
  if (mobileStr.length !== validationRules.mobile.length) {
    errors.push(validationMessages.mobile.length);
  }
  
  if (!isMobilePhone(mobileStr, validationRules.mobile.locale)) {
    errors.push(validationMessages.mobile.invalid);
  }
  
  return {
    isValid: errors.length === 0,
    errors: errors.length > 0 ? errors : null,
    value: mobileStr
  };
};

// Validate password
export const validatePassword = (password) => {
  const errors = [];
  
  if (!password) {
    errors.push(validationMessages.password.required);
    return { isValid: false, errors };
  }
  
  if (password.length < validationRules.password.minLength) {
    errors.push(validationMessages.password.minLength);
  }
  
  if (validationRules.password.requireNumber && !/\d/.test(password)) {
    errors.push(validationMessages.password.number);
  }
  
  if (validationRules.password.requireSpecialChar && !/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    errors.push(validationMessages.password.specialChar);
  }
  
  return {
    isValid: errors.length === 0,
    errors: errors.length > 0 ? errors : null
  };
};

// Validate all fields
export const validateAll = (fields) => {
  const results = {};
  let isValid = true;
  
  if (fields.name !== undefined) {
    results.name = validateName(fields.name);
    if (!results.name.isValid) isValid = false;
  }
  
  if (fields.mobile !== undefined) {
    results.mobile = validateMobile(fields.mobile);
    if (!results.mobile.isValid) isValid = false;
  }
  
  if (fields.password !== undefined) {
    results.password = validatePassword(fields.password);
    if (!results.password.isValid) isValid = false;
  }
  
  return {
    isValid,
    errors: !isValid ? results : null,
    values: {
      name: results.name?.value,
      mobile: results.mobile?.value
    }
  };
};

export default {
  validateName,
  validateMobile,
  validatePassword,
  validateAll,
  rules: validationRules,
  messages: validationMessages
};
