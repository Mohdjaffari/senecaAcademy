/**
 * Seneca Academy - Standardized Form Regular Expressions & Validation Utilities
 * Provides consistent, production-grade regex patterns and validation helpers for:
 * - Public Contact Inquiries
 * - Teacher / Faculty Job Applications & Resume attachments
 * - Community Reviews & Feedback
 * - Admissions and Enrollments
 */

export const REGEX_PATTERNS = {
  // 2 to 60 characters: Latin letters, spaces, apostrophes, dots, and hyphens
  NAME: /^[a-zA-Z\s'.\-]{2,60}$/,

  // Standard RFC-compliant email regex
  EMAIL: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,

  // Pakistan Mobile (03XX XXXXXXX or +923XX XXXXXXX) or International Standard (+ followed by 8-15 digits)
  PHONE: /^(?:(?:\+92|0092|0)?3[0-9]{2}[ -]?[0-9]{7}|\+?[1-9][0-9]{7,14})$/,

  // Pakistan Specific Mobile (for strict PK checks if needed)
  PHONE_PAK: /^(?:\+92|0092|0)?3[0-9]{2}[ -]?[0-9]{7}$/,

  // Pakistani CNIC / B-Form: 13 digits formatted as XXXXX-XXXXXXX-X
  CNIC: /^\d{5}-\d{7}-\d{1}$/,

  // Alphanumeric code or application reference (e.g. TCH-APP-4921, SEN-2026-0042)
  REFERENCE_ID: /^[A-Za-z0-9\/-]{3,25}$/,
};

/**
 * Formatters to polish input text as user types
 */
export const validationFormatters = {
  /**
   * Format Pakistani phone numbers: "03001234567" -> "0300 1234567" or preserves international standard
   */
  formatPhone(value: string): string {
    const trimmed = value.trim();
    if (!trimmed) return "";
    
    // If starting with +92
    if (trimmed.startsWith("+92")) {
      const digits = trimmed.slice(3).replace(/\D/g, "").slice(0, 10);
      if (digits.length <= 3) return `+92 ${digits}`;
      return `+92 ${digits.slice(0, 3)} ${digits.slice(3)}`;
    }
    
    // If starting with 03
    if (trimmed.startsWith("03")) {
      const digits = trimmed.replace(/\D/g, "").slice(0, 11);
      if (digits.length <= 4) return digits;
      return `${digits.slice(0, 4)} ${digits.slice(4)}`;
    }

    return trimmed;
  },

  /**
   * Format CNIC to 42101-1234567-1
   */
  formatCnic(value: string): string {
    const digits = value.replace(/\D/g, "").slice(0, 13);
    if (digits.length <= 5) return digits;
    if (digits.length <= 12) return `${digits.slice(0, 5)}-${digits.slice(5)}`;
    return `${digits.slice(0, 5)}-${digits.slice(5, 12)}-${digits.slice(12, 13)}`;
  },
};

/**
 * Field Validators returning boolean status and contextual error messages
 */
export const formValidators = {
  validateName(name: string): { isValid: boolean; error?: string } {
    const trimmed = name.trim();
    if (!trimmed) {
      return { isValid: false, error: "Full name is required." };
    }
    if (trimmed.length < 2) {
      return { isValid: false, error: "Full name must be at least 2 characters." };
    }
    if (trimmed.length > 60) {
      return { isValid: false, error: "Full name cannot exceed 60 characters." };
    }
    if (!REGEX_PATTERNS.NAME.test(trimmed)) {
      return {
        isValid: false,
        error: "Name can only contain alphabetic letters, spaces, dots, and hyphens.",
      };
    }
    return { isValid: true };
  },

  validateEmail(email: string): { isValid: boolean; error?: string } {
    const trimmed = email.trim().toLowerCase();
    if (!trimmed) {
      return { isValid: false, error: "Email address is required." };
    }
    if (!REGEX_PATTERNS.EMAIL.test(trimmed)) {
      return { isValid: false, error: "Please provide a valid email address (e.g. name@example.com)." };
    }
    return { isValid: true };
  },

  validatePhone(phone: string): { isValid: boolean; error?: string } {
    const clean = phone.replace(/[\s-]/g, "");
    if (!clean) {
      return { isValid: false, error: "Contact phone number is required." };
    }
    if (!REGEX_PATTERNS.PHONE.test(phone.trim())) {
      return {
        isValid: false,
        error: "Enter a valid phone number (e.g., 0300 1234567 or +92 300 1234567).",
      };
    }
    return { isValid: true };
  },

  validateSubject(subject: string): { isValid: boolean; error?: string } {
    const trimmed = subject.trim();
    if (!trimmed) {
      return { isValid: false, error: "Subject or inquiry topic is required." };
    }
    if (trimmed.length < 2) {
      return { isValid: false, error: "Subject must be at least 2 characters." };
    }
    return { isValid: true };
  },

  validateMessage(message: string, minLength = 10, maxLength = 2000): { isValid: boolean; error?: string } {
    const trimmed = message.trim();
    if (!trimmed) {
      return { isValid: false, error: "Message content is required." };
    }
    if (trimmed.length < minLength) {
      return { isValid: false, error: `Message must be at least ${minLength} characters.` };
    }
    if (trimmed.length > maxLength) {
      return { isValid: false, error: `Message cannot exceed ${maxLength} characters.` };
    }
    return { isValid: true };
  },

  validateResumeFile(file: File | null, maxMb = 5): { isValid: boolean; error?: string } {
    if (!file) {
      return { isValid: false, error: "Resume / CV file is required." };
    }
    const allowedExtensions = [".pdf", ".doc", ".docx"];
    const fileName = file.name.toLowerCase();
    const hasValidExt = allowedExtensions.some((ext) => fileName.endsWith(ext));
    
    if (!hasValidExt) {
      return {
        isValid: false,
        error: "Invalid file format. Please upload a PDF, DOC, or DOCX file.",
      };
    }

    const maxBytes = maxMb * 1024 * 1024;
    if (file.size > maxBytes) {
      return {
        isValid: false,
        error: `File size exceeds ${maxMb}MB. Please compress or choose a smaller file.`,
      };
    }

    return { isValid: true };
  },
};
