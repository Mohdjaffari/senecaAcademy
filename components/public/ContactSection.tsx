"use client";

import { useState, type FormEvent } from "react";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  MapPin,
  Phone,
  Mail,
  Clock,
  Send,
  Loader2,
  CheckCircle2,
  MessageSquare,
  MessageCircle,
  ExternalLink,
  AlertCircle,
  Copy,
  Check,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { formValidators, validationFormatters } from "@/lib/utils/validation";
import {
  ICampusCoordinatesData,
  IInquiryFormSettingsData,
  IOfficeHoursData,
} from "@/lib/db/contact-page-defaults";
import { motion } from "framer-motion";

interface ContactSectionProps {
  coordinates?: ICampusCoordinatesData;
  inquiryForm?: IInquiryFormSettingsData;
  officeHours?: IOfficeHoursData;
}

export function ContactSection({ coordinates, inquiryForm, officeHours }: ContactSectionProps) {
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [submissionId, setSubmissionId] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  // Defaults fallback
  const badge = coordinates?.badge || "Connect With Us";
  const heading = coordinates?.heading || "Campus Location & Inquiries";
  const description =
    coordinates?.description ||
    "Visit our Soldier Bazar campus in Karachi for a guided facility tour, or message our admissions counselors directly.";

  const address = coordinates?.address || "Soldier Bazar, Garden East, Karachi, Sindh, Pakistan.";
  const mainPhone = coordinates?.mainPhone || "+92 335 7413777";
  const admissionsHotline = coordinates?.admissionsHotline || "+92 21 32250000";
  const whatsappNumber = coordinates?.whatsappNumber || "+92 335 7413777";
  const whatsappMessage =
    coordinates?.whatsappMessage ||
    "Hello Seneca Academy! I would like to inquire about admissions and campus visits.";
  const infoEmail = coordinates?.infoEmail || "info@seneca.edu.pk";
  const admissionsEmail = coordinates?.admissionsEmail || "admissions@seneca.edu.pk";
  const googleMapEmbedUrl =
    coordinates?.googleMapEmbedUrl ||
    "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3619.8876!2d67.0282!3d24.8607!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3eb33f0c3a5f5555%3A0x3c8c6fbd3b7d3d3d!2sSoldier%20Bazaar%2C%20Karachi%2C%20Pakistan!5e0!3m2!1sen!2s!4v1700000000000!5m2!1sen!2s";
  const googleMapDirectionsUrl =
    coordinates?.googleMapDirectionsUrl || "https://maps.google.com/?q=Soldier+Bazar+Garden+East+Karachi";

  const formHeading = inquiryForm?.heading || "Send Direct Inquiry or Book a Campus Tour";
  const formDescription =
    inquiryForm?.description ||
    "Fill out this form and our admissions counseling desk will contact you via WhatsApp or Email within 24 hours.";
  const subjectsList =
    inquiryForm?.subjectsList && inquiryForm.subjectsList.length > 0
      ? inquiryForm.subjectsList
      : [
          "General Admission Inquiry",
          "Book Campus Guided Tour",
          "Fee Schedule Question",
          "Principal Appointment Request",
          "Saturday Assessment Registration",
          "Careers / Faculty Application",
        ];
  const submitButtonText = inquiryForm?.submitButtonText || "Transmit Inquiry";
  const responseTimeText = inquiryForm?.responseTimeText || "Our administration will respond within 24 hours.";
  const successHeading = inquiryForm?.successHeading || "Inquiry Dispatched Successfully!";
  const successMessage =
    inquiryForm?.successMessage ||
    "Thank you for contacting Seneca Academy. Our admissions representative will contact you shortly.";

  const weekdayHours = officeHours?.weekdayHours || "Monday to Friday: 8:00 AM – 3:00 PM";
  const saturdayHours = officeHours?.saturdayHours || "Saturday: 9:00 AM – 1:00 PM (Assessment Day)";

  const cleanWhatsappDigits = whatsappNumber.replace(/[^0-9]/g, "");
  const whatsappLink = `https://wa.me/${cleanWhatsappDigits}?text=${encodeURIComponent(whatsappMessage)}`;

  const [form, setForm] = useState({
    fullName: "",
    email: "",
    phone: "",
    subject: subjectsList[0] || "General Admission Inquiry",
    message: "",
  });

  const handlePhoneChange = (val: string) => {
    const formatted = validationFormatters.formatPhone(val);
    setForm((prev) => ({ ...prev, phone: formatted }));
    if (fieldErrors.phone) {
      setFieldErrors((prev) => {
        const next = { ...prev };
        delete next.phone;
        return next;
      });
    }
  };

  const validateForm = () => {
    const errs: Record<string, string> = {};

    const nameVal = formValidators.validateName(form.fullName);
    if (!nameVal.isValid) errs.fullName = nameVal.error || "Invalid name";

    const emailVal = formValidators.validateEmail(form.email);
    if (!emailVal.isValid) errs.email = emailVal.error || "Invalid email";

    const phoneVal = formValidators.validatePhone(form.phone);
    if (!phoneVal.isValid) errs.phone = phoneVal.error || "Invalid phone";

    const msgVal = formValidators.validateMessage(form.message, 10, 3000);
    if (!msgVal.isValid) errs.message = msgVal.error || "Invalid message";

    setFieldErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error("Please resolve highlighted errors before submitting.");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName: form.fullName.trim(),
          email: form.email.trim().toLowerCase(),
          phone: form.phone.trim(),
          subject: form.subject.trim(),
          message: form.message.trim(),
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error?.message || "Failed to send inquiry.");
      }

      setSubmissionId(data.data?.submissionId || null);
      setSubmitted(true);
      toast.success(successHeading, {
        description: `Reference: ${data.data?.submissionId || "Recorded"} • ${responseTimeText}`,
      });
    } catch (err: any) {
      toast.error("Sending Error", {
        description: err.message || "Please check your details and try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  const copyRefCode = (ref: string) => {
    navigator.clipboard.writeText(ref);
    setCopiedId(true);
    toast.success("Reference code copied to clipboard!");
    setTimeout(() => setCopiedId(false), 2500);
  };

  if (coordinates && coordinates.isVisible === false) {
    return null;
  }

  return (
    <section id="contact" className="py-16 sm:py-24 bg-card/40 border-t border-border overflow-hidden">
      <div className="container max-w-6xl mx-auto px-4 sm:px-6 space-y-12">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center max-w-2xl mx-auto space-y-3"
        >
          <Badge variant="crimson">{badge}</Badge>
          <h2 className="text-3xl sm:text-4xl font-extrabold font-heading text-foreground tracking-tight">
            {heading}
          </h2>
          {description && (
            <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
              {description}
            </p>
          )}
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Contact Cards & Info */}
          <motion.div
            initial={{ opacity: 0, x: -24 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="lg:col-span-5 space-y-4 sm:space-y-5"
          >
            {/* Address */}
            <Card className="border-border bg-card p-5 shadow-sm hover:border-seneca-crimson/30 transition-colors">
              <div className="flex items-start gap-3.5">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-seneca-crimson/10 text-seneca-crimson shrink-0">
                  <MapPin className="h-5 w-5" />
                </div>
                <div className="space-y-1 flex-1 min-w-0">
                  <h4 className="font-bold text-sm text-foreground font-heading">Campus Address</h4>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {address}
                  </p>
                  {googleMapDirectionsUrl && (
                    <a
                      href={googleMapDirectionsUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-[11px] font-semibold text-seneca-crimson hover:underline pt-1"
                    >
                      <span>Get Directions</span>
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  )}
                </div>
              </div>
            </Card>

            {/* Telephone & WhatsApp */}
            <Card className="border-border bg-card p-5 shadow-sm hover:border-seneca-amber/30 transition-colors">
              <div className="flex items-start gap-3.5">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-seneca-amber/10 text-seneca-amber shrink-0">
                  <Phone className="h-5 w-5" />
                </div>
                <div className="space-y-1 flex-1 min-w-0">
                  <h4 className="font-bold text-sm text-foreground font-heading">Telephone & WhatsApp</h4>
                  <p className="text-xs text-muted-foreground">
                    Main Helpline:{" "}
                    <a href={`tel:${mainPhone.replace(/[^0-9+]/g, "")}`} className="font-semibold text-foreground hover:underline">
                      {mainPhone}
                    </a>
                  </p>
                  {admissionsHotline && (
                    <p className="text-xs text-muted-foreground">
                      Admissions Hotline:{" "}
                      <a href={`tel:${admissionsHotline.replace(/[^0-9+]/g, "")}`} className="font-semibold text-foreground hover:underline">
                        {admissionsHotline}
                      </a>
                    </p>
                  )}
                  {whatsappNumber && (
                    <div className="pt-1.5">
                      <a
                        href={whatsappLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-bold hover:bg-emerald-500/20 transition-colors"
                      >
                        <MessageCircle className="h-3.5 w-3.5" />
                        <span>Chat on WhatsApp: {whatsappNumber}</span>
                      </a>
                    </div>
                  )}
                </div>
              </div>
            </Card>

            {/* Electronic Mail */}
            <Card className="border-border bg-card p-5 shadow-sm hover:border-emerald-500/30 transition-colors">
              <div className="flex items-start gap-3.5">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600 shrink-0">
                  <Mail className="h-5 w-5" />
                </div>
                <div className="space-y-1 flex-1 min-w-0">
                  <h4 className="font-bold text-sm text-foreground font-heading">Electronic Mail</h4>
                  <p className="text-xs text-muted-foreground">
                    General Inquiries:{" "}
                    <a href={`mailto:${infoEmail}`} className="text-foreground font-medium hover:underline">
                      {infoEmail}
                    </a>
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Admissions Desk:{" "}
                    <a href={`mailto:${admissionsEmail}`} className="text-foreground font-medium hover:underline">
                      {admissionsEmail}
                    </a>
                  </p>
                </div>
              </div>
            </Card>

            {/* Operating Office Hours */}
            <Card className="border-border bg-card p-5 shadow-sm hover:border-primary/30 transition-colors">
              <div className="flex items-start gap-3.5">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary shrink-0">
                  <Clock className="h-5 w-5" />
                </div>
                <div className="space-y-1 flex-1 min-w-0">
                  <h4 className="font-bold text-sm text-foreground font-heading">Admissions Office Hours</h4>
                  <p className="text-xs text-muted-foreground">{weekdayHours}</p>
                  <p className="text-xs text-muted-foreground">{saturdayHours}</p>
                </div>
              </div>
            </Card>
          </motion.div>

          {/* Right Direct Message Form + Map Embed */}
          <motion.div
            initial={{ opacity: 0, x: 24 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="lg:col-span-7 space-y-6"
          >
            <Card className="border-border bg-card p-6 sm:p-8 shadow-xl">
              <div className="flex items-center gap-2 mb-2">
                <MessageSquare className="h-5 w-5 text-seneca-crimson shrink-0" />
                <h3 className="text-lg sm:text-xl font-bold font-heading text-foreground">
                  {formHeading}
                </h3>
              </div>
              {formDescription && (
                <p className="text-xs text-muted-foreground mb-6 leading-relaxed">
                  {formDescription}
                </p>
              )}

              {submitted ? (
                <div className="py-8 text-center space-y-5 animate-in zoom-in-95 duration-200">
                  <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-600 ring-8 ring-emerald-500/10">
                    <CheckCircle2 className="h-9 w-9" />
                  </div>
                  <div className="space-y-2">
                    <Badge className="bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 text-xs font-bold">
                      Inquiry Dispatched Successfully
                    </Badge>
                    <h4 className="text-xl font-bold font-heading text-foreground">
                      {successHeading}
                    </h4>
                    <p className="text-xs text-muted-foreground max-w-md mx-auto leading-relaxed">
                      {successMessage}
                    </p>

                    {submissionId && (
                      <div className="pt-2 flex flex-col items-center gap-1.5">
                        <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">
                          Inquiry Reference Ticket
                        </span>
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-sm font-bold text-seneca-crimson bg-seneca-crimson/10 py-1.5 px-3 rounded-xl border border-seneca-crimson/20">
                            {submissionId}
                          </span>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => copyRefCode(submissionId)}
                            className="rounded-xl text-xs gap-1 h-8"
                          >
                            {copiedId ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5" />}
                            <span>{copiedId ? "Copied" : "Copy"}</span>
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                  <div className="pt-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="rounded-xl font-bold text-xs"
                      onClick={() => {
                        setSubmitted(false);
                        setSubmissionId(null);
                        setCopiedId(false);
                        setFieldErrors({});
                        setForm({
                          fullName: "",
                          email: "",
                          phone: "",
                          subject: subjectsList[0] || "General Admission Inquiry",
                          message: "",
                        });
                      }}
                    >
                      Send Another Inquiry
                    </Button>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center justify-between">
                        <label className="text-xs font-bold text-foreground">Your Full Name *</label>
                        <span className="text-[10px] text-muted-foreground">Letters only, 2–60 chars</span>
                      </div>
                      <Input
                        required
                        placeholder="e.g. Asad Raza"
                        value={form.fullName}
                        onChange={(e) => {
                          setForm({ ...form, fullName: e.target.value });
                          if (fieldErrors.fullName) {
                            setFieldErrors((prev) => {
                              const n = { ...prev };
                              delete n.fullName;
                              return n;
                            });
                          }
                        }}
                        className={cn("rounded-xl text-xs", fieldErrors.fullName && "border-rose-500 focus-visible:ring-rose-500")}
                      />
                      {fieldErrors.fullName && (
                        <p className="text-[11px] text-rose-500 flex items-center gap-1 mt-0.5">
                          <AlertCircle className="h-3 w-3" />
                          <span>{fieldErrors.fullName}</span>
                        </p>
                      )}
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-bold text-foreground">Email Address *</label>
                      <Input
                        required
                        type="email"
                        placeholder="asad@gmail.com"
                        value={form.email}
                        onChange={(e) => {
                          setForm({ ...form, email: e.target.value });
                          if (fieldErrors.email) {
                            setFieldErrors((prev) => {
                              const n = { ...prev };
                              delete n.email;
                              return n;
                            });
                          }
                        }}
                        className={cn("rounded-xl text-xs", fieldErrors.email && "border-rose-500 focus-visible:ring-rose-500")}
                      />
                      {fieldErrors.email && (
                        <p className="text-[11px] text-rose-500 flex items-center gap-1 mt-0.5">
                          <AlertCircle className="h-3 w-3" />
                          <span>{fieldErrors.email}</span>
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-foreground">Phone Number / WhatsApp *</label>
                      <Input
                        required
                        type="tel"
                        placeholder="0300 1234567 or +92 300 1234567"
                        value={form.phone}
                        onChange={(e) => handlePhoneChange(e.target.value)}
                        className={cn("rounded-xl text-xs", fieldErrors.phone && "border-rose-500 focus-visible:ring-rose-500")}
                      />
                      {fieldErrors.phone && (
                        <p className="text-[11px] text-rose-500 flex items-center gap-1 mt-0.5">
                          <AlertCircle className="h-3 w-3" />
                          <span>{fieldErrors.phone}</span>
                        </p>
                      )}
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-bold text-foreground">Subject / Purpose *</label>
                      <select
                        className="flex h-9 w-full rounded-xl border border-input bg-background px-3 py-1 text-xs shadow-xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                        value={form.subject}
                        onChange={(e) => setForm({ ...form, subject: e.target.value })}
                      >
                        {subjectsList.map((subj) => (
                          <option key={subj} value={subj}>
                            {subj}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-bold text-foreground">Message / Inquiry *</label>
                      <span className="text-[10px] text-muted-foreground">{form.message.length}/3000 (min 10)</span>
                    </div>
                    <textarea
                      rows={3}
                      required
                      maxLength={3000}
                      className={cn(
                        "flex w-full rounded-xl border border-input bg-background p-3 text-xs ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring resize-none",
                        fieldErrors.message && "border-rose-500 focus-visible:ring-rose-500"
                      )}
                      placeholder="Please let us know how we can assist you..."
                      value={form.message}
                      onChange={(e) => {
                        setForm({ ...form, message: e.target.value });
                        if (fieldErrors.message) {
                          setFieldErrors((prev) => {
                            const n = { ...prev };
                            delete n.message;
                            return n;
                          });
                        }
                      }}
                    />
                    {fieldErrors.message && (
                      <p className="text-[11px] text-rose-500 flex items-center gap-1 mt-0.5">
                        <AlertCircle className="h-3 w-3" />
                        <span>{fieldErrors.message}</span>
                      </p>
                    )}
                  </div>

                  <Button type="submit" variant="glow" disabled={loading} className="w-full rounded-xl gap-2 font-bold">
                    {loading ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <span>Transmitting Inquiry...</span>
                      </>
                    ) : (
                      <>
                        <Send className="h-4 w-4" />
                        <span>{submitButtonText}</span>
                      </>
                    )}
                  </Button>
                  <p className="text-[11px] text-center text-muted-foreground">{responseTimeText}</p>
                </form>
              )}
            </Card>

            {/* Google Map Embed */}
            {googleMapEmbedUrl && (
              <div className="rounded-3xl overflow-hidden border border-border h-64 sm:h-72 shadow-md relative bg-muted">
                <iframe
                  title="Seneca Academy Karachi Campus Map"
                  src={googleMapEmbedUrl}
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  allowFullScreen={false}
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                />
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </section>
  );
}

export default ContactSection;
