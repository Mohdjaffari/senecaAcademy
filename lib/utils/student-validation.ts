/**
 * Seneca Academy - Student Enrollment Validation & Regular Expressions Engine
 * Standardized Regex Patterns, Auto-Formatters, and Step Validators
 */

// 1. Regular Expression Patterns
export const REGEX_PATTERNS = {
  // 2-50 characters, letters, spaces, hyphens, dots, apostrophes
  NAME: /^[a-zA-Z\s'.\-]{2,50}$/,
  
  // RFC 5322 standard email regex
  EMAIL: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
  
  // Pakistan Mobile (03XX XXXXXXX or +923XX XXXXXXX) or International (10-15 digits)
  PHONE_PAK: /^(?:\+92|0092|0)?3[0-9]{2}[ -]?[0-9]{7}$/,
  PHONE_INTL: /^\+?[0-9]{10,15}$/,
  
  // Pakistani CNIC / B-Form: 13 digits (XXXXX-XXXXXXX-X)
  CNIC: /^\d{5}-\d{7}-\d{1}$/,
  CNIC_RAW: /^\d{13}$/,
  
  // Admission ID: Alphanumeric with hyphens/slashes (e.g. SEN-2026-0042)
  ADMISSION_NO: /^[A-Za-z0-9\/-]{3,20}$/,
  
  // Roll Number: Alphanumeric with hyphens (e.g. GR1-A-01, 10-B-14)
  ROLL_NO: /^[A-Za-z0-9\/-]{2,20}$/,
  
  // Strong Password: Min 8 chars, at least 1 uppercase, 1 lowercase, 1 number
  PASSWORD: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/,
  
  // Academic marks / percentages (e.g. 88.5%, A+, 450/500, 92)
  MARKS_PERCENTAGE: /^(100(\.0{1,2})?|[0-9]{1,2}(\.[0-9]{1,2})?)%?$|^[A-Fa-f][+-]?$|^\d{1,4}\/\d{1,4}$/,
  
  // SLC Certificate Number
  SLC_NO: /^[a-zA-Z0-9\/-]{3,30}$/,
};

// 2. Input Formatters (Format as user types)
export const formatters = {
  /**
   * Auto-formats CNIC/B-Form to 42101-1234567-1 format
   */
  formatCnic(value: string): string {
    const digits = value.replace(/\D/g, "").slice(0, 13);
    if (digits.length <= 5) {
      return digits;
    } else if (digits.length <= 12) {
      return `${digits.slice(0, 5)}-${digits.slice(5)}`;
    } else {
      return `${digits.slice(0, 5)}-${digits.slice(5, 12)}-${digits.slice(12, 13)}`;
    }
  },

  /**
   * Auto-formats Pakistani Mobile Phone to "0300 1234567" format
   */
  formatPhone(value: string): string {
    const raw = value.replace(/[^\d+]/g, "");
    if (raw.startsWith("+92")) {
      const remaining = raw.slice(3).replace(/\D/g, "").slice(0, 10);
      if (remaining.length > 3) {
        return `+92 ${remaining.slice(0, 3)} ${remaining.slice(3)}`;
      }
      return `+92 ${remaining}`;
    }
    const digits = raw.replace(/\D/g, "").slice(0, 11);
    if (digits.length > 4) {
      return `${digits.slice(0, 4)} ${digits.slice(4)}`;
    }
    return digits;
  },

  /**
   * Cleans text to standard capitalized name
   */
  sanitizeName(value: string): string {
    return value.replace(/[^a-zA-Z\s'.\-]/g, "");
  },

  /**
   * Cleans admission ID to uppercase
   */
  formatAdmissionId(value: string): string {
    return value.toUpperCase().replace(/[^A-Z0-9\/-]/g, "");
  },

  /**
   * Cleans roll number to uppercase
   */
  formatRollNumber(value: string): string {
    return value.toUpperCase().replace(/[^A-Z0-9\/-]/g, "");
  },
};

// 3. Validation Helpers
export interface ValidationResult {
  isValid: boolean;
  message?: string;
}

export const validators = {
  name(val: string, isRequired = true, fieldName = "Name"): ValidationResult {
    const trimmed = val.trim();
    if (!trimmed) {
      return isRequired ? { isValid: false, message: `${fieldName} is required.` } : { isValid: true };
    }
    if (trimmed.length < 2) {
      return { isValid: false, message: `${fieldName} must be at least 2 characters.` };
    }
    if (trimmed.length > 50) {
      return { isValid: false, message: `${fieldName} cannot exceed 50 characters.` };
    }
    if (!REGEX_PATTERNS.NAME.test(trimmed)) {
      return { isValid: false, message: `${fieldName} can only contain letters, spaces, dots, and hyphens.` };
    }
    return { isValid: true };
  },

  cnic(val: string, isRequired = false, fieldName = "CNIC / B-Form"): ValidationResult {
    const trimmed = val.trim();
    if (!trimmed) {
      return isRequired ? { isValid: false, message: `${fieldName} is required.` } : { isValid: true };
    }
    if (!REGEX_PATTERNS.CNIC.test(trimmed) && !REGEX_PATTERNS.CNIC_RAW.test(trimmed)) {
      return { isValid: false, message: `${fieldName} must be 13 digits (e.g. 42101-1234567-1).` };
    }
    return { isValid: true };
  },

  phone(val: string, isRequired = true, fieldName = "Phone Number"): ValidationResult {
    const trimmed = val.trim();
    if (!trimmed) {
      return isRequired ? { isValid: false, message: `${fieldName} is required.` } : { isValid: true };
    }
    const cleanDigits = trimmed.replace(/[\s-]/g, "");
    if (!REGEX_PATTERNS.PHONE_PAK.test(cleanDigits) && !REGEX_PATTERNS.PHONE_INTL.test(cleanDigits)) {
      return { isValid: false, message: `Enter a valid mobile number (e.g. 0300 1234567 or +92 300 1234567).` };
    }
    return { isValid: true };
  },

  email(val: string, isRequired = true, fieldName = "Email"): ValidationResult {
    const trimmed = val.trim();
    if (!trimmed) {
      return isRequired ? { isValid: false, message: `${fieldName} is required.` } : { isValid: true };
    }
    if (!REGEX_PATTERNS.EMAIL.test(trimmed)) {
      return { isValid: false, message: `Enter a valid email address (e.g. user@seneca.edu.pk).` };
    }
    return { isValid: true };
  },

  admissionNumber(val: string): ValidationResult {
    const trimmed = val.trim();
    if (!trimmed) {
      return { isValid: false, message: "Admission ID is required." };
    }
    if (!REGEX_PATTERNS.ADMISSION_NO.test(trimmed)) {
      return { isValid: false, message: "Admission ID must be alphanumeric (e.g. SEN-2026-0042)." };
    }
    return { isValid: true };
  },

  rollNumber(val: string): ValidationResult {
    const trimmed = val.trim();
    if (!trimmed) {
      return { isValid: false, message: "Roll Number is required." };
    }
    if (!REGEX_PATTERNS.ROLL_NO.test(trimmed)) {
      return { isValid: false, message: "Roll Number format is invalid (e.g. GR1-A-01)." };
    }
    return { isValid: true };
  },

  password(val: string): ValidationResult {
    if (!val) {
      return { isValid: false, message: "Password is required." };
    }
    if (val.length < 8) {
      return { isValid: false, message: "Password must be at least 8 characters long." };
    }
    if (!/(?=.*[a-z])/.test(val)) {
      return { isValid: false, message: "Password must contain at least one lowercase letter." };
    }
    if (!/(?=.*[A-Z])/.test(val)) {
      return { isValid: false, message: "Password must contain at least one uppercase letter." };
    }
    if (!/(?=.*\d)/.test(val)) {
      return { isValid: false, message: "Password must contain at least one number." };
    }
    return { isValid: true };
  },

  dateOfBirth(val: string): ValidationResult {
    if (!val) {
      return { isValid: false, message: "Date of Birth is required." };
    }
    const birthDate = new Date(val);
    if (isNaN(birthDate.getTime())) {
      return { isValid: false, message: "Please select a valid date." };
    }
    const today = new Date();
    if (birthDate > today) {
      return { isValid: false, message: "Date of birth cannot be in the future." };
    }
    const ageInYears = (today.getTime() - birthDate.getTime()) / (365.25 * 24 * 60 * 60 * 1000);
    if (ageInYears < 2) {
      return { isValid: false, message: "Student must be at least 2 years old for enrollment." };
    }
    if (ageInYears > 25) {
      return { isValid: false, message: "Please verify date of birth (age exceeds typical school range)." };
    }
    return { isValid: true };
  },

  address(val: string): ValidationResult {
    const trimmed = val.trim();
    if (!trimmed) {
      return { isValid: false, message: "Residential address is required." };
    }
    if (trimmed.length < 5) {
      return { isValid: false, message: "Address must be at least 5 characters long." };
    }
    return { isValid: true };
  },
};

// 4. Password Strength Calculator
export interface PasswordStrength {
  score: number; // 0 to 4
  label: "Very Weak" | "Weak" | "Fair" | "Strong" | "Very Strong";
  color: string;
}

export function getPasswordStrength(password: string): PasswordStrength {
  if (!password) {
    return { score: 0, label: "Very Weak", color: "bg-muted text-muted-foreground" };
  }
  let score = 0;
  if (password.length >= 8) score += 1;
  if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score += 1;
  if (/\d/.test(password)) score += 1;
  if (/[^A-Za-z0-9]/.test(password)) score += 1;

  switch (score) {
    case 0:
    case 1:
      return { score: 1, label: "Weak", color: "bg-rose-500 text-rose-500" };
    case 2:
      return { score: 2, label: "Fair", color: "bg-amber-500 text-amber-500" };
    case 3:
      return { score: 3, label: "Strong", color: "bg-emerald-500 text-emerald-500" };
    case 4:
      return { score: 4, label: "Very Strong", color: "bg-emerald-600 text-emerald-600" };
    default:
      return { score: 1, label: "Weak", color: "bg-rose-500 text-rose-500" };
  }
}
