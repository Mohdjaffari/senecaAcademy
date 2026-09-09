import mongoose, { Schema, Document, Model } from "mongoose";
import {
  IContactHeroData,
  ICampusCoordinatesData,
  IInquiryFormSettingsData,
  IDepartmentContactsData,
  IOfficeHoursData,
  IContactFaqData,
  IContactCtaData,
  ISEOData,
} from "@/lib/db/contact-page-defaults";

export interface IContactPageDocument extends Document {
  schoolId: mongoose.Types.ObjectId;
  pageTitle: string;
  pageDescription: string;
  slug: string;
  isPublished: boolean;
  publishedAt?: Date;
  publishedBy?: {
    userId?: string;
    name?: string;
    email?: string;
  };
  draftUpdatedAt?: Date;
  lastUpdated?: Date;
  updatedBy?: {
    userId?: string;
    name?: string;
    email?: string;
  };
  sectionsOrder: string[];
  hero: IContactHeroData;
  coordinates: ICampusCoordinatesData;
  inquiryForm: IInquiryFormSettingsData;
  departments: IDepartmentContactsData;
  officeHours: IOfficeHoursData;
  faq: IContactFaqData;
  cta: IContactCtaData;
  seo: ISEOData;
  draft?: {
    pageTitle?: string;
    pageDescription?: string;
    sectionsOrder?: string[];
    hero?: IContactHeroData;
    coordinates?: ICampusCoordinatesData;
    inquiryForm?: IInquiryFormSettingsData;
    departments?: IDepartmentContactsData;
    officeHours?: IOfficeHoursData;
    faq?: IContactFaqData;
    cta?: IContactCtaData;
    seo?: ISEOData;
    updatedAt?: Date;
  };
  createdAt: Date;
  updatedAt: Date;
}

const HeroSchema = new Schema(
  {
    isVisible: { type: Boolean, default: true },
    badge: { type: String, default: "Karachi Main Campus" },
    badgeIcon: { type: String, default: "MapPin" },
    title: { type: String, default: "Get in Touch & Book a" },
    highlightedTitle: { type: String, default: "Campus Guided Tour." },
    description: {
      type: String,
      default:
        "We invite you to visit our Soldier Bazar campus in Karachi for a personalized tour, or connect directly with our admissions and academic counseling team.",
    },
    leftSpecChip: {
      badgeText: { type: String, default: "24-Hour Response" },
      description: { type: String, default: "Direct Admissions Helpline & Support" },
      icon: { type: String, default: "Clock" },
    },
    rightSpecChip: {
      badgeText: { type: String, default: "Guided Tours" },
      description: { type: String, default: "Saturday Assessment & Campus Walks" },
      icon: { type: String, default: "Building2" },
    },
    primaryCta: {
      isVisible: { type: Boolean, default: true },
      text: { type: String, default: "Send Message Below" },
      href: { type: String, default: "#contact" },
    },
    secondaryCta: {
      isVisible: { type: Boolean, default: true },
      text: { type: String, default: "Apply for Admission" },
      href: { type: String, default: "/admissions" },
    },
    variant: { type: String, enum: ["crimson", "amber", "emerald", "default"], default: "crimson" },
  },
  { _id: false }
);

const CampusCoordinatesSchema = new Schema(
  {
    isVisible: { type: Boolean, default: true },
    badge: { type: String, default: "Connect With Us" },
    heading: { type: String, default: "Campus Location & Inquiries" },
    description: {
      type: String,
      default:
        "Visit our Soldier Bazar campus in Karachi for a guided facility tour, or message our admissions counselors directly.",
    },
    address: { type: String, default: "Soldier Bazar, Garden East, Karachi, Sindh, Pakistan." },
    cityArea: { type: String, default: "Soldier Bazar # 1, Garden East" },
    postalCode: { type: String, default: "74400" },
    mainPhone: { type: String, default: "+92 335 7413777" },
    admissionsHotline: { type: String, default: "+92 21 32250000" },
    whatsappNumber: { type: String, default: "+92 335 7413777" },
    whatsappMessage: {
      type: String,
      default: "Hello Seneca Academy! I would like to inquire about admissions and campus visits.",
    },
    infoEmail: { type: String, default: "info@seneca.edu.pk" },
    admissionsEmail: { type: String, default: "admissions@seneca.edu.pk" },
    careersEmail: { type: String, default: "careers@seneca.edu.pk" },
    googleMapEmbedUrl: {
      type: String,
      default:
        "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3619.8876!2d67.0282!3d24.8607!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3eb33f0c3a5f5555%3A0x3c8c6fbd3b7d3d3d!2sSoldier%20Bazaar%2C%20Karachi%2C%20Pakistan!5e0!3m2!1sen!2s!4v1700000000000!5m2!1sen!2s",
    },
    googleMapDirectionsUrl: {
      type: String,
      default: "https://maps.google.com/?q=Soldier+Bazar+Garden+East+Karachi",
    },
  },
  { _id: false }
);

const DepartmentContactItemSchema = new Schema(
  {
    id: { type: String, required: true },
    name: { type: String, required: true },
    leadTitle: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String, required: true },
    extension: { type: String, default: "" },
    officeHours: { type: String, default: "" },
    icon: { type: String, default: "GraduationCap" },
    displayOrder: { type: Number, default: 0 },
    isVisible: { type: Boolean, default: true },
  },
  { _id: false }
);

const DepartmentContactsSchema = new Schema(
  {
    isVisible: { type: Boolean, default: true },
    badge: { type: String, default: "Department Directory" },
    heading: { type: String, default: "Direct Department Contacts" },
    description: {
      type: String,
      default: "Connect directly with specific administrative wings for specialized counseling and support.",
    },
    departments: { type: [DepartmentContactItemSchema], default: [] },
  },
  { _id: false }
);

const OfficeHoursSchema = new Schema(
  {
    isVisible: { type: Boolean, default: true },
    badge: { type: String, default: "Hours & Access" },
    heading: { type: String, default: "Admissions Office Operating Schedule" },
    description: {
      type: String,
      default: "Plan your visit during our regular administrative and assessment hours in Soldier Bazar.",
    },
    weekdayHours: { type: String, default: "Monday to Friday: 8:00 AM – 3:00 PM" },
    saturdayHours: { type: String, default: "Saturday: 9:00 AM – 1:00 PM (Assessment & Guided Tours)" },
    sundayHours: { type: String, default: "Sunday: Closed (Online inquiry forms monitored)" },
    visitorNotice: {
      type: String,
      default: "Please bring a valid CNIC / Identity card at the main security gate for visitor badge clearance.",
    },
  },
  { _id: false }
);

const InquiryFormSettingsSchema = new Schema(
  {
    isVisible: { type: Boolean, default: true },
    heading: { type: String, default: "Send Direct Inquiry or Book a Campus Tour" },
    description: {
      type: String,
      default:
        "Fill out this form and our admissions counseling desk will contact you via WhatsApp or Email within 24 hours.",
    },
    subjectsList: {
      type: [String],
      default: [
        "General Admission Inquiry",
        "Book Campus Guided Tour",
        "Fee Schedule Question",
        "Principal Appointment Request",
        "Saturday Assessment Registration",
        "Careers / Faculty Application",
      ],
    },
    submitButtonText: { type: String, default: "Transmit Inquiry" },
    responseTimeText: { type: String, default: "Our administration will respond within 24 hours." },
    successHeading: { type: String, default: "Inquiry Dispatched Successfully!" },
    successMessage: {
      type: String,
      default: "Thank you for contacting Seneca Academy. Our admissions representative will contact you shortly.",
    },
  },
  { _id: false }
);

const ContactFaqItemSchema = new Schema(
  {
    id: { type: String, required: true },
    question: { type: String, required: true },
    answer: { type: String, required: true },
    displayOrder: { type: Number, default: 0 },
    isVisible: { type: Boolean, default: true },
  },
  { _id: false }
);

const ContactFaqSchema = new Schema(
  {
    isVisible: { type: Boolean, default: true },
    badge: { type: String, default: "Visit & Inquiry FAQs" },
    heading: { type: String, default: "Frequently Asked Questions About Visiting" },
    description: {
      type: String,
      default: "Quick answers to help you plan your campus visit and communication with Seneca Academy.",
    },
    items: { type: [ContactFaqItemSchema], default: [] },
  },
  { _id: false }
);

const ContactCtaSchema = new Schema(
  {
    isVisible: { type: Boolean, default: true },
    heading: { type: String, default: "Experience the Seneca Difference in Person" },
    description: {
      type: String,
      default: "Visit our campus, meet our educators, and explore our world-class learning facilities today.",
    },
    primaryCta: {
      isVisible: { type: Boolean, default: true },
      text: { type: String, default: "Apply for Admission" },
      href: { type: String, default: "/admissions" },
    },
    secondaryCta: {
      isVisible: { type: Boolean, default: true },
      text: { type: String, default: "Chat on WhatsApp" },
      href: { type: String, default: "https://wa.me/923357413777" },
    },
  },
  { _id: false }
);

const SEOSchema = new Schema(
  {
    metaTitle: {
      type: String,
      default: "Contact & Campus Guided Tour — Seneca Academy Karachi",
    },
    metaDescription: {
      type: String,
      default:
        "Get in touch with Seneca Academy Karachi in Soldier Bazar. Book a guided campus visit, call our admissions helpline at +92 335 7413777, or send an inquiry online.",
    },
    keywords: {
      type: [String],
      default: [
        "Contact Seneca Academy",
        "Seneca Academy address",
        "Soldier Bazar school phone",
        "Karachi school admissions contact",
        "Seneca campus visit",
      ],
    },
    ogImage: {
      type: String,
      default: "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?auto=format&fit=crop&w=1200&q=80",
    },
  },
  { _id: false }
);

const ContactPageSchema = new Schema<IContactPageDocument>(
  {
    schoolId: {
      type: Schema.Types.ObjectId,
      ref: "School",
      required: true,
      index: true,
    },
    pageTitle: { type: String, default: "Contact Us & Campus Tour" },
    pageDescription: {
      type: String,
      default: "Contact information, campus directions, and direct inquiry booking for Seneca Academy Karachi.",
    },
    slug: { type: String, default: "contact", index: true },
    isPublished: { type: Boolean, default: true },
    publishedAt: { type: Date, default: Date.now },
    publishedBy: {
      userId: { type: String },
      name: { type: String },
      email: { type: String },
    },
    draftUpdatedAt: { type: Date },
    lastUpdated: { type: Date, default: Date.now },
    updatedBy: {
      userId: { type: String },
      name: { type: String },
      email: { type: String },
    },
    sectionsOrder: {
      type: [String],
      default: ["hero", "coordinates", "departments", "officeHours", "faq", "cta"],
    },
    hero: { type: HeroSchema, default: () => ({}) },
    coordinates: { type: CampusCoordinatesSchema, default: () => ({}) },
    inquiryForm: { type: InquiryFormSettingsSchema, default: () => ({}) },
    departments: { type: DepartmentContactsSchema, default: () => ({}) },
    officeHours: { type: OfficeHoursSchema, default: () => ({}) },
    faq: { type: ContactFaqSchema, default: () => ({}) },
    cta: { type: ContactCtaSchema, default: () => ({}) },
    seo: { type: SEOSchema, default: () => ({}) },
    draft: { type: Schema.Types.Mixed },
  },
  {
    timestamps: true,
  }
);

const ContactPage: Model<IContactPageDocument> =
  mongoose.models.ContactPage || mongoose.model<IContactPageDocument>("ContactPage", ContactPageSchema);

export default ContactPage;
