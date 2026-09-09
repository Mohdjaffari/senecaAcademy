export interface IContactHeroData {
  isVisible: boolean;
  badge: string;
  badgeIcon?: string;
  title: string;
  highlightedTitle?: string;
  description: string;
  leftSpecChip: {
    badgeText: string;
    description: string;
    icon: string;
  };
  rightSpecChip: {
    badgeText: string;
    description: string;
    icon: string;
  };
  primaryCta: {
    isVisible: boolean;
    text: string;
    href: string;
  };
  secondaryCta: {
    isVisible: boolean;
    text: string;
    href: string;
  };
  variant?: "crimson" | "amber" | "emerald" | "default";
}

export interface ICampusCoordinatesData {
  isVisible: boolean;
  badge: string;
  heading: string;
  description: string;
  address: string;
  cityArea: string;
  postalCode?: string;
  mainPhone: string;
  admissionsHotline: string;
  whatsappNumber: string;
  whatsappMessage?: string;
  infoEmail: string;
  admissionsEmail: string;
  careersEmail?: string;
  googleMapEmbedUrl: string;
  googleMapDirectionsUrl?: string;
}

export interface IDepartmentContact {
  id: string;
  name: string;
  leadTitle: string;
  email: string;
  phone: string;
  extension?: string;
  officeHours?: string;
  icon: string;
  displayOrder?: number;
  isVisible?: boolean;
}

export interface IDepartmentContactsData {
  isVisible: boolean;
  badge: string;
  heading: string;
  description?: string;
  departments: IDepartmentContact[];
}

export interface IOfficeHoursData {
  isVisible: boolean;
  badge: string;
  heading: string;
  description?: string;
  weekdayHours: string;
  saturdayHours: string;
  sundayHours: string;
  visitorNotice?: string;
}

export interface IInquiryFormSettingsData {
  isVisible: boolean;
  heading: string;
  description: string;
  subjectsList: string[];
  submitButtonText: string;
  responseTimeText: string;
  successHeading: string;
  successMessage: string;
}

export interface IContactFaqItem {
  id: string;
  question: string;
  answer: string;
  displayOrder?: number;
  isVisible?: boolean;
}

export interface IContactFaqData {
  isVisible: boolean;
  badge: string;
  heading: string;
  description?: string;
  items: IContactFaqItem[];
}

export interface IContactCtaData {
  isVisible: boolean;
  heading: string;
  description: string;
  primaryCta: {
    isVisible: boolean;
    text: string;
    href: string;
  };
  secondaryCta: {
    isVisible: boolean;
    text: string;
    href: string;
  };
}

export interface ISEOData {
  metaTitle: string;
  metaDescription: string;
  keywords: string[];
  ogImage?: string;
}

export interface IContactPageData {
  sectionsOrder: string[];
  hero: IContactHeroData;
  coordinates: ICampusCoordinatesData;
  inquiryForm: IInquiryFormSettingsData;
  departments: IDepartmentContactsData;
  officeHours: IOfficeHoursData;
  faq: IContactFaqData;
  cta: IContactCtaData;
  seo: ISEOData;
}

export const DEFAULT_CONTACT_PAGE_DATA: IContactPageData = {
  sectionsOrder: ["hero", "coordinates", "departments", "officeHours", "faq", "cta"],

  hero: {
    isVisible: true,
    badge: "Karachi Main Campus",
    badgeIcon: "MapPin",
    title: "Get in Touch & Book a",
    highlightedTitle: "Campus Guided Tour.",
    description:
      "We invite you to visit our Soldier Bazar campus in Karachi for a personalized tour, or connect directly with our admissions and academic counseling team.",
    leftSpecChip: {
      badgeText: "24-Hour Response",
      description: "Direct Admissions Helpline & Support",
      icon: "Clock",
    },
    rightSpecChip: {
      badgeText: "Guided Tours",
      description: "Saturday Assessment & Campus Walks",
      icon: "Building2",
    },
    primaryCta: {
      isVisible: true,
      text: "Send Message Below",
      href: "#contact",
    },
    secondaryCta: {
      isVisible: true,
      text: "Apply for Admission",
      href: "/admissions",
    },
    variant: "crimson",
  },

  coordinates: {
    isVisible: true,
    badge: "Connect With Us",
    heading: "Campus Location & Inquiries",
    description:
      "Visit our Soldier Bazar campus in Karachi for a guided facility tour, or message our admissions counselors directly.",
    address: "Soldier Bazar, Garden East, Karachi, Sindh, Pakistan.",
    cityArea: "Soldier Bazar # 1, Garden East",
    postalCode: "74400",
    mainPhone: "+92 335 7413777",
    admissionsHotline: "+92 21 32250000",
    whatsappNumber: "+92 335 7413777",
    whatsappMessage: "Hello Seneca Academy! I would like to inquire about admissions and campus visits.",
    infoEmail: "info@seneca.edu.pk",
    admissionsEmail: "admissions@seneca.edu.pk",
    careersEmail: "careers@seneca.edu.pk",
    googleMapEmbedUrl:
      "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3619.8876!2d67.0282!3d24.8607!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3eb33f0c3a5f5555%3A0x3c8c6fbd3b7d3d3d!2sSoldier%20Bazaar%2C%20Karachi%2C%20Pakistan!5e0!3m2!1sen!2s!4v1700000000000!5m2!1sen!2s",
    googleMapDirectionsUrl: "https://maps.google.com/?q=Soldier+Bazar+Garden+East+Karachi",
  },

  inquiryForm: {
    isVisible: true,
    heading: "Send Direct Inquiry or Book a Campus Tour",
    description: "Fill out this form and our admissions counseling desk will contact you via WhatsApp or Email within 24 hours.",
    subjectsList: [
      "General Admission Inquiry",
      "Book Campus Guided Tour",
      "Fee Schedule Question",
      "Principal Appointment Request",
      "Saturday Assessment Registration",
      "Careers / Faculty Application",
    ],
    submitButtonText: "Transmit Inquiry",
    responseTimeText: "Our administration will respond within 24 hours.",
    successHeading: "Inquiry Dispatched Successfully!",
    successMessage: "Thank you for contacting Seneca Academy. Our admissions representative will contact you shortly.",
  },

  departments: {
    isVisible: true,
    badge: "Department Directory",
    heading: "Direct Department Contacts",
    description: "Connect directly with specific administrative wings for specialized counseling and support.",
    departments: [
      {
        id: "dept-1",
        name: "Admissions & Registrar",
        leadTitle: "Director of Admissions",
        email: "admissions@seneca.edu.pk",
        phone: "+92 335 7413777",
        extension: "Ext. 101",
        officeHours: "8:00 AM – 3:00 PM (Mon-Fri)",
        icon: "GraduationCap",
        displayOrder: 1,
        isVisible: true,
      },
      {
        id: "dept-2",
        name: "Finance & Accounts",
        leadTitle: "Bursar & Accounts Head",
        email: "accounts@seneca.edu.pk",
        phone: "+92 21 32250000",
        extension: "Ext. 104",
        officeHours: "8:30 AM – 2:30 PM (Mon-Fri)",
        icon: "CreditCard",
        displayOrder: 2,
        isVisible: true,
      },
      {
        id: "dept-3",
        name: "Principal's Secretariat",
        leadTitle: "Executive Assistant to Principal",
        email: "principal@seneca.edu.pk",
        phone: "+92 21 32250000",
        extension: "Ext. 100",
        officeHours: "By Prior Appointment",
        icon: "Users",
        displayOrder: 3,
        isVisible: true,
      },
      {
        id: "dept-4",
        name: "Student Counseling & Care",
        leadTitle: "Lead Academic Counselor",
        email: "counseling@seneca.edu.pk",
        phone: "+92 335 7413777",
        extension: "Ext. 108",
        officeHours: "9:00 AM – 2:00 PM (Mon-Fri)",
        icon: "HeartHandshake",
        displayOrder: 4,
        isVisible: true,
      },
    ],
  },

  officeHours: {
    isVisible: true,
    badge: "Hours & Access",
    heading: "Admissions Office Operating Schedule",
    description: "Plan your visit during our regular administrative and assessment hours in Soldier Bazar.",
    weekdayHours: "Monday to Friday: 8:00 AM – 3:00 PM",
    saturdayHours: "Saturday: 9:00 AM – 1:00 PM (Assessment & Guided Tours)",
    sundayHours: "Sunday: Closed (Online inquiry forms monitored)",
    visitorNotice: "Please bring a valid CNIC / Identity card at the main security gate for visitor badge clearance.",
  },

  faq: {
    isVisible: true,
    badge: "Visit & Inquiry FAQs",
    heading: "Frequently Asked Questions About Visiting",
    description: "Quick answers to help you plan your campus visit and communication with Seneca Academy.",
    items: [
      {
        id: "faq-1",
        question: "Do I need an appointment before visiting the campus?",
        answer:
          "While walk-ins are warmly welcomed on weekdays between 9:00 AM and 2:00 PM, booking an appointment or registering for Saturday Assessment ensures a dedicated admissions counselor is assigned to guide your campus tour.",
        displayOrder: 1,
        isVisible: true,
      },
      {
        id: "faq-2",
        question: "Is visitor parking available at the Soldier Bazar campus?",
        answer:
          "Yes, designated visitor parking is available near the main school entrance gate on Soldier Bazar # 1 with on-duty security marshals.",
        displayOrder: 2,
        isVisible: true,
      },
      {
        id: "faq-3",
        question: "What documents should I bring when visiting for an admission assessment?",
        answer:
          "Please bring the student's B-Form/Birth Certificate copy, 2 passport-size photographs, father/guardian CNIC copy, and previous school report cards.",
        displayOrder: 3,
        isVisible: true,
      },
      {
        id: "faq-4",
        question: "Can I meet the Principal during my campus visit?",
        answer:
          "Meetings with Principal M. Zohaib Ali can be scheduled through the Principal's Secretariat via email (principal@seneca.edu.pk) or by requesting an appointment at the front desk.",
        displayOrder: 4,
        isVisible: true,
      },
    ],
  },

  cta: {
    isVisible: true,
    heading: "Experience the Seneca Difference in Person",
    description: "Visit our campus, meet our educators, and explore our world-class learning facilities today.",
    primaryCta: {
      isVisible: true,
      text: "Apply for Admission",
      href: "/admissions",
    },
    secondaryCta: {
      isVisible: true,
      text: "Chat on WhatsApp",
      href: "https://wa.me/923357413777",
    },
  },

  seo: {
    metaTitle: "Contact & Campus Guided Tour — Seneca Academy Karachi",
    metaDescription:
      "Get in touch with Seneca Academy Karachi in Soldier Bazar. Book a guided campus visit, call our admissions helpline at +92 335 7413777, or send an inquiry online.",
    keywords: [
      "Contact Seneca Academy",
      "Seneca Academy address",
      "Soldier Bazar school phone",
      "Karachi school admissions contact",
      "Seneca campus visit",
      "school admission helpline Karachi",
    ],
    ogImage: "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?auto=format&fit=crop&w=1200&q=80",
  },
};
