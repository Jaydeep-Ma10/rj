/**
 * Password validation and strength checking utility
 */

/**
 * Check if a password meets the required strength criteria
 * @param {string} password - The password to validate
 * @returns {{valid: boolean, message?: string}} Validation result
 */
export const validatePasswordStrength = (password) => {
  if (typeof password !== 'string') {
    return { valid: false, message: 'Password must be a string' };
  }

  if (password.length < 12) {
    return { valid: false, message: 'Password must be at least 12 characters long' };
  }

  if (password.length > 100) {
    return { valid: false, message: 'Password cannot exceed 100 characters' };
  }

  if (!/[A-Z]/.test(password)) {
    return { valid: false, message: 'Password must contain at least one uppercase letter (A-Z)' };
  }

  if (!/[a-z]/.test(password)) {
    return { valid: false, message: 'Password must contain at least one lowercase letter (a-z)' };
  }

  if (!/[0-9]/.test(password)) {
    return { valid: false, message: 'Password must contain at least one number (0-9)' };
  }

  if (!/[^A-Za-z0-9]/.test(password)) {
    return { valid: false, message: 'Password must contain at least one special character (!@#$%^&*)' };
  }

  // Check for common passwords
  const commonPasswords = [
    'password', '12345678', 'qwerty', '123456789', '12345',
    '1234567890', '1234567', 'password1', '123123', '111111'
  ];
  
  if (commonPasswords.includes(password.toLowerCase())) {
    return { valid: false, message: 'This password is too common. Please choose a stronger one.' };
  }

  // Check for sequential characters (e.g., 1234, abcd)
  const sequentialRegex = /(?:123|234|345|456|567|678|789|890|abc|bcd|cde|def|efg|fgh|ghi|hij|ijk|jkl|klm|lmn|mno|nop|opq|pqr|qrs|rst|stu|tuv|uvw|vwx|wxy|xyz|012|123|234|345|456|567|678|789)/i;
  if (sequentialRegex.test(password)) {
    return { valid: false, message: 'Password contains sequential characters which are easy to guess' };
  }

  // Check for repeated characters (e.g., aaaa, 1111)
  const repeatRegex = /(.)\1{3,}/;
  if (repeatRegex.test(password)) {
    return { valid: false, message: 'Password contains too many repeated characters' };
  }

  // Check for personal information
  const personalInfoCheck = (userData) => {
    if (!userData) return false;
    
    const { email, mobile, name } = userData;
    const personalInfo = [];
    
    if (email) personalInfo.push(email.split('@')[0]);
    if (mobile) personalInfo.push(mobile.replace(/\D/g, ''));
    if (name) personalInfo.push(...name.toLowerCase().split(/\s+/));
    
    return personalInfo.some(info => 
      info && info.length > 2 && password.toLowerCase().includes(info.toLowerCase())
    );
  };

  // Note: userData parameter is optional and should contain user's personal info
  // This is a placeholder - the actual implementation would pass user data when available
  if (personalInfoCheck({ /* userData would be passed here when available */ })) {
    return { 
      valid: false, 
      message: 'Password should not contain your personal information' 
    };
  }

  // Password meets all criteria
  return { valid: true };
};

/**
 * Generate a secure random password
 * @param {number} length - Length of the password (default: 16)
 * @returns {string} Generated password
 */
export const generateSecurePassword = (length = 16) => {
  const charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_+~`|}{[]\\:;?><,./-=';
  const values = crypto.getRandomValues(new Uint32Array(length));
  let password = '';
  
  for (let i = 0; i < length; i++) {
    password += charset[values[i] % charset.length];
  }
  
  // Ensure the generated password meets all requirements
  const validation = validatePasswordStrength(password);
  if (!validation.valid) {
    // If generated password doesn't meet requirements, try again
    return generateSecurePassword(length);
  }
  
  return password;
};

/**
 * Hash a password using bcrypt
 * @param {string} password - The password to hash
 * @returns {Promise<string>} Hashed password
 */
export const hashPassword = async (password) => {
  const saltRounds = 12; // Increased cost factor for better security
  return await bcrypt.hash(password, saltRounds);
};

/**
 * Compare a plain text password with a hashed password
 * @param {string} plainPassword - The plain text password
 * @param {string} hashedPassword - The hashed password to compare against
 * @returns {Promise<boolean>} True if passwords match, false otherwise
 */
export const comparePasswords = async (plainPassword, hashedPassword) => {
  if (!plainPassword || !hashedPassword) {
    return false;
  }
  return await bcrypt.compare(plainPassword, hashedPassword);
};

export default {
  validatePasswordStrength,
  generateSecurePassword,
  hashPassword,
  comparePasswords
};
