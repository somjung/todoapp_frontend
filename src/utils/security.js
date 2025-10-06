/**
 * Frontend Security Utility
 * Implements client-side security measures following Google best practices
 */

export class SecurityUtils {
  // XSS prevention patterns
  static XSS_PATTERNS = [
    /<script[^>]*>.*?<\/script>/gi,
    /javascript:/gi,
    /vbscript:/gi,
    /onload=/gi,
    /onclick=/gi,
    /onerror=/gi,
    /<iframe[^>]*>.*?<\/iframe>/gi,
    /<object[^>]*>.*?<\/object>/gi,
    /<embed[^>]*>.*?<\/embed>/gi
  ];

  /**
   * Sanitize user input to prevent XSS attacks
   */
  static sanitizeInput(input) {
    if (typeof input !== 'string') {
      return input;
    }

    let sanitized = input.trim();

    // Remove potential XSS content
    this.XSS_PATTERNS.forEach(pattern => {
      sanitized = sanitized.replace(pattern, '');
    });

    // Remove HTML tags
    sanitized = sanitized.replace(/<[^>]*>/g, '');

    // Encode special characters
    sanitized = sanitized
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#x27;')
      .replace(/\//g, '&#x2F;');

    return sanitized;
  }

  /**
   * Validate input format and security
   */
  static validateInput(input, type) {
    if (!input) {
      return { valid: false, message: 'Input is required' };
    }

    // Check for XSS attempts
    if (this.containsXSS(input)) {
      return { valid: false, message: 'Input contains potentially malicious content' };
    }

    // Type-specific validation
    switch (type) {
      case 'username':
        return this.validateUsername(input);
      case 'email':
        return this.validateEmail(input);
      case 'password':
        return this.validatePassword(input);
      case 'name':
        return this.validateName(input);
      case 'title':
        return this.validateTitle(input);
      case 'description':
        return this.validateDescription(input);
      default:
        return { valid: true, message: 'Valid' };
    }
  }

  /**
   * Check for XSS content
   */
  static containsXSS(input) {
    return this.XSS_PATTERNS.some(pattern => pattern.test(input));
  }

  /**
   * Validate username format
   */
  static validateUsername(username) {
    const pattern = /^[a-zA-Z0-9_]{3,20}$/;
    if (!pattern.test(username)) {
      return { 
        valid: false, 
        message: 'Username must be 3-20 characters (letters, numbers, underscore only)' 
      };
    }
    return { valid: true, message: 'Valid' };
  }

  /**
   * Validate email format
   */
  static validateEmail(email) {
    const pattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!pattern.test(email)) {
      return { valid: false, message: 'Please enter a valid email address' };
    }
    return { valid: true, message: 'Valid' };
  }

  /**
   * Validate password strength
   */
  static validatePassword(password) {
    const pattern = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,50}$/;
    if (!pattern.test(password)) {
      return { 
        valid: false, 
        message: 'Password must be 8-50 characters with uppercase, lowercase, digit, and special character' 
      };
    }
    return { valid: true, message: 'Valid' };
  }

  /**
   * Validate name format
   */
  static validateName(name) {
    const pattern = /^[a-zA-Z\s]{2,50}$/;
    if (!pattern.test(name)) {
      return { 
        valid: false, 
        message: 'Name must be 2-50 characters (letters and spaces only)' 
      };
    }
    return { valid: true, message: 'Valid' };
  }

  /**
   * Validate title format
   */
  static validateTitle(title) {
    const pattern = /^[a-zA-Z0-9\s\-_.,!?]{1,100}$/;
    if (!pattern.test(title)) {
      return { 
        valid: false, 
        message: 'Title must be 1-100 characters (alphanumeric and basic punctuation only)' 
      };
    }
    return { valid: true, message: 'Valid' };
  }

  /**
   * Validate description format
   */
  static validateDescription(description) {
    if (!description) return { valid: true, message: 'Valid' };
    
    const pattern = /^[a-zA-Z0-9\s\-_.,!?\n\r]{0,500}$/;
    if (!pattern.test(description)) {
      return { 
        valid: false, 
        message: 'Description must be under 500 characters with basic text and punctuation only' 
      };
    }
    return { valid: true, message: 'Valid' };
  }

  /**
   * Secure token storage
   */
  static setSecureToken(token) {
    // Store in httpOnly cookie would be better, but localStorage with XSS protection
    if (typeof Storage !== 'undefined') {
      localStorage.setItem('authToken', token);
    }
  }

  /**
   * Get token securely
   */
  static getSecureToken() {
    if (typeof Storage !== 'undefined') {
      return localStorage.getItem('authToken');
    }
    return null;
  }

  /**
   * Clear token securely
   */
  static clearSecureToken() {
    if (typeof Storage !== 'undefined') {
      localStorage.removeItem('authToken');
      localStorage.removeItem('user');
    }
  }

  /**
   * Generate secure random string for CSRF protection
   */
  static generateCSRFToken() {
    const array = new Uint8Array(32);
    crypto.getRandomValues(array);
    return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
  }

  /**
   * Validate URL to prevent open redirects
   */
  static isValidRedirectURL(url) {
    try {
      const parsedURL = new URL(url, window.location.origin);
      return parsedURL.origin === window.location.origin;
    } catch {
      return false;
    }
  }

  /**
   * Log security events (in production, send to monitoring service)
   */
  static logSecurityEvent(event, details = {}) {
    console.warn(`[SECURITY] ${event}:`, details);
    // In production, send to security monitoring service
  }
}