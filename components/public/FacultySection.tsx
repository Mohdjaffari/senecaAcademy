"use client";

import { useState, useMemo, type FormEvent } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import {
  Briefcase,
  CheckCircle2,
  Loader2,
  Search,
  Check,
  Users,
  GraduationCap,
  Award,
  UploadCloud,
  FileText,
  Copy,
  AlertCircle,
  X,
  FileCheck2,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { formValidators, validationFormatters, REGEX_PATTERNS } from "@/lib/utils/validation";
import {
  IFacultySectionData,
  IFacultyCareersData,
  DEFAULT_FACULTY_PAGE_DATA,
} from "@/lib/db/faculty-page-defaults";

export function FacultySection({
  facultySection,
  careers,
}: {
  facultySection?: IFacultySectionData;
  careers?: IFacultyCareersData;
}) {
  const sectionData = facultySection || DEFAULT_FACULTY_PAGE_DATA.facultySection;
  const careersData = careers || DEFAULT_FACULTY_PAGE_DATA.careers;

  const [careerModalOpen, setCareerModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [submittedAppId, setSubmittedAppId] = useState<string | null>(null);
  const [copiedAppId, setCopiedAppId] = useState(false);
  const [selectedDepartment, setSelectedDepartment] = useState<string>("All");
  const [searchQuery, setSearchQuery] = useState<string>("");

  const [careerForm, setCareerForm] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "Mathematics",
    experienceYears: "5+ Years",
    qualification: "M.Sc. / M.Phil.",
    coverLetter: "",
  });

  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [resumeInfo, setResumeInfo] = useState<{ url: string; fileName: string; sizeKb: number } | null>(null);
  const [uploadingResume, setUploadingResume] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const handlePhoneChange = (val: string) => {
    const formatted = validationFormatters.formatPhone(val);
    setCareerForm((prev) => ({ ...prev, phone: formatted }));
    if (fieldErrors.phone) {
      setFieldErrors((prev) => {
        const next = { ...prev };
        delete next.phone;
        return next;
      });
    }
  };

  const handleResumeSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    if (!file) return;

    const validation = formValidators.validateResumeFile(file);
    if (!validation.isValid) {
      setFieldErrors((prev) => ({ ...prev, resume: validation.error || "Invalid file" }));
      toast.error(validation.error);
      return;
    }

    setFieldErrors((prev) => {
      const next = { ...prev };
      delete next.resume;
      return next;
    });

    setResumeFile(file);
    setUploadingResume(true);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/careers/upload-cv", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();

      if (data.success && data.data) {
        setResumeInfo({
          url: data.data.url,
          fileName: data.data.fileName || file.name,
          sizeKb: data.data.sizeKb || Math.round(file.size / 1024),
        });
        toast.success("Resume attached successfully!");
      } else {
        throw new Error(data.message || "Failed to process resume file.");
      }
    } catch (err: any) {
      console.error("Resume upload error:", err);
      toast.error("Upload Error", {
        description: err.message || "Could not attach resume. Please try another file.",
      });
      setResumeFile(null);
      setResumeInfo(null);
    } finally {
      setUploadingResume(false);
    }
  };

  const validateForm = () => {
    const errs: Record<string, string> = {};

    const nameVal = formValidators.validateName(careerForm.name);
    if (!nameVal.isValid) errs.name = nameVal.error || "Invalid name";

    const emailVal = formValidators.validateEmail(careerForm.email);
    if (!emailVal.isValid) errs.email = emailVal.error || "Invalid email";

    const phoneVal = formValidators.validatePhone(careerForm.phone);
    if (!phoneVal.isValid) errs.phone = phoneVal.error || "Invalid phone";

    if (!resumeInfo && !resumeFile) {
      errs.resume = "Please attach your Resume / CV (PDF, DOC, or DOCX up to 5MB).";
    }

    setFieldErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleCareerSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error("Please resolve the highlighted form fields before submitting.");
      return;
    }

    setLoading(true);

    try {
      // Ensure resume is uploaded
      let cvUrl = resumeInfo?.url;
      let cvFileName = resumeInfo?.fileName || resumeFile?.name || "Candidate_CV.pdf";

      if (!cvUrl && resumeFile) {
        const formData = new FormData();
        formData.append("file", resumeFile);
        const uploadRes = await fetch("/api/careers/upload-cv", {
          method: "POST",
          body: formData,
        });
        const uploadData = await uploadRes.json();
        if (uploadData.success && uploadData.data) {
          cvUrl = uploadData.data.url;
          cvFileName = uploadData.data.fileName;
        } else {
          throw new Error("Failed to upload resume document.");
        }
      }

      if (!cvUrl) {
        throw new Error("Resume / CV document is mandatory.");
      }

      const payload = {
        ...careerForm,
        name: careerForm.name.trim(),
        email: careerForm.email.trim().toLowerCase(),
        phone: careerForm.phone.trim(),
        cvUrl,
        cvFileName,
      };

      const res = await fetch("/api/careers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error?.message || data.message || "Failed to submit job application.");
      }

      setSubmittedAppId(data.data.applicationId);
      toast.success("Faculty Application Dispatched!", {
        description: `Your Candidate Reference: ${data.data.applicationId}`,
      });
    } catch (err: any) {
      toast.error("Application Error", {
        description: err.message || "Failed to submit application.",
      });
    } finally {
      setLoading(false);
    }
  };

  const copyReferenceId = (refId: string) => {
    navigator.clipboard.writeText(refId);
    setCopiedAppId(true);
    toast.success("Application Reference copied to clipboard!");
    setTimeout(() => setCopiedAppId(false), 2500);
  };

  const resetCareerForm = () => {
    setSubmittedAppId(null);
    setCopiedAppId(false);
    setCareerModalOpen(false);
    setResumeFile(null);
    setResumeInfo(null);
    setFieldErrors({});
    setCareerForm({
      name: "",
      email: "",
      phone: "",
      subject: "Mathematics",
      experienceYears: "5+ Years",
      qualification: "M.Sc. / M.Phil.",
      coverLetter: "",
    });
  };

  const members = useMemo(() => {
    const raw = sectionData.members || DEFAULT_FACULTY_PAGE_DATA.facultySection.members;
    return raw.filter((m) => m.isActive !== false);
  }, [sectionData.members]);

  const departments = useMemo(() => {
    const set = new Set<string>();
    members.forEach((m) => {
      if (m.department) set.add(m.department);
    });
    return ["All", ...Array.from(set)];
  }, [members]);

  const filteredMembers = useMemo(() => {
    return members.filter((m) => {
      const matchesDept = selectedDepartment === "All" || m.department === selectedDepartment;
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        m.name.toLowerCase().includes(q) ||
        m.role.toLowerCase().includes(q) ||
        m.department.toLowerCase().includes(q) ||
        m.qual.toLowerCase().includes(q) ||
        (m.bio && m.bio.toLowerCase().includes(q));
      return matchesDept && matchesSearch;
    });
  }, [members, selectedDepartment, searchQuery]);

  const getBadgeColorClasses = (color?: string) => {
    switch (color) {
      case "amber":
        return "bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/20";
      case "sky":
        return "bg-sky-500/10 text-sky-700 dark:text-sky-300 border-sky-500/20";
      case "emerald":
        return "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/20";
      case "indigo":
        return "bg-indigo-500/10 text-indigo-700 dark:text-indigo-300 border-indigo-500/20";
      case "crimson":
      default:
        return "bg-seneca-crimson/10 text-seneca-crimson dark:text-seneca-amber-light border-seneca-crimson/20";
    }
  };

  if (sectionData.isVisible === false && careersData.isVisible === false) {
    return null;
  }

  return (
    <section id="faculty" className="py-16 sm:py-20 lg:py-28 bg-background border-t border-border overflow-hidden">
      <div className="container space-y-12 sm:space-y-16 px-4 sm:px-6">
        {/* Top Header */}
        {sectionData.isVisible !== false && (
          <div className="text-center max-w-3xl mx-auto space-y-3">
            {sectionData.badge && (
              <Badge variant="crimson" className="rounded-full px-3.5 py-1 text-xs font-semibold shadow-xs">
                {sectionData.badge}
              </Badge>
            )}
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold font-heading text-foreground tracking-tight">
              {sectionData.heading}
            </h2>
            {sectionData.description && (
              <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                {sectionData.description}
              </p>
            )}
          </div>
        )}

        {/* Filter Controls: Department Pills & Search Bar */}
        {sectionData.isVisible !== false && (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              {/* Department Tabs */}
              <div className="flex flex-wrap items-center gap-1.5 p-1 rounded-2xl bg-muted/40 border border-border/80 w-full sm:w-auto">
                {departments.map((dept) => (
                  <button
                    key={dept}
                    type="button"
                    onClick={() => setSelectedDepartment(dept)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      selectedDepartment === dept
                        ? "bg-seneca-crimson text-white shadow-xs"
                        : "text-muted-foreground hover:text-foreground hover:bg-background/60"
                    }`}
                  >
                    {dept === "All" ? "All Educators" : dept}
                  </button>
                ))}
              </div>

              {/* Search Bar */}
              <div className="relative w-full sm:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                <Input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search faculty by name..."
                  className="pl-8 h-9 text-xs rounded-xl"
                />
              </div>
            </div>

            {/* Results Counter */}
            <div className="flex items-center justify-between text-xs text-muted-foreground px-1">
              <span>
                Showing <strong className="text-foreground">{filteredMembers.length}</strong> of {members.length} faculty educators
              </span>
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="text-seneca-crimson hover:underline font-semibold"
                >
                  Clear search
                </button>
              )}
            </div>
          </div>
        )}

        {/* Faculty Cards Grid: 2 Cards in One Row on Mobile */}
        {sectionData.isVisible !== false && (
          <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2.5 sm:gap-6">
            {filteredMembers.map((member, idx) => (
              <motion.div
                key={member.id || idx}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-30px" }}
                transition={{ duration: 0.45, delay: (idx % 4) * 0.08 }}
                className="flex"
              >
                <Card
                  className="w-full border-border bg-card shadow-xs hover:shadow-xl hover:border-seneca-crimson/30 transition-all duration-300 rounded-2xl sm:rounded-3xl overflow-hidden flex flex-col justify-between group"
                >
                  <div className="relative h-44 sm:h-64 w-full bg-muted overflow-hidden">
                    <Image
                      src={member.imgUrl}
                      alt={member.name}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                      sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-60 group-hover:opacity-40 transition-opacity" />

                    {member.badge && (
                      <div className="absolute top-2 right-2 sm:top-3 sm:right-3">
                        <span
                          className={`text-[9px] sm:text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full border shadow-xs backdrop-blur-md ${getBadgeColorClasses(
                            member.badgeColor
                          )}`}
                        >
                          {member.badge}
                        </span>
                      </div>
                    )}

                    <div className="absolute bottom-2 left-2 right-2 sm:bottom-3 sm:left-3 sm:right-3 text-white">
                      <span className="text-[9.5px] sm:text-[11px] font-bold text-white/90 bg-black/40 px-1.5 sm:px-2 py-0.5 rounded-md backdrop-blur-xs truncate block max-w-full">
                        {member.department}
                      </span>
                    </div>
                  </div>

                  <CardContent className="p-3 sm:p-5 space-y-2 sm:space-y-3 flex-1 flex flex-col justify-between">
                    <div className="space-y-1">
                      <h4 className="font-heading font-bold text-xs sm:text-base text-foreground group-hover:text-seneca-crimson transition-colors line-clamp-1 leading-snug">
                        {member.name}
                      </h4>
                      <p className="text-[11px] sm:text-xs font-semibold text-seneca-crimson dark:text-seneca-amber-light leading-tight line-clamp-1">
                        {member.role}
                      </p>
                      {member.bio && (
                        <p className="text-[10.5px] sm:text-[11px] text-muted-foreground leading-relaxed pt-0.5 line-clamp-2">
                          {member.bio}
                        </p>
                      )}
                    </div>

                    <div className="pt-2 sm:pt-3 border-t border-border/60 text-[10px] sm:text-[11px] text-muted-foreground space-y-1">
                      <div className="flex items-center gap-1.5 font-medium">
                        <GraduationCap className="h-3 sm:h-3.5 w-3 sm:w-3.5 text-muted-foreground shrink-0" />
                        <span className="truncate">{member.qual}</span>
                      </div>
                      <div className="flex items-center gap-1.5 font-semibold text-foreground">
                        <Award className="h-3 sm:h-3.5 w-3 sm:w-3.5 text-seneca-crimson shrink-0" />
                        <span>{member.exp}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        )}

        {filteredMembers.length === 0 && sectionData.isVisible !== false && (
          <div className="p-12 text-center rounded-3xl border border-dashed border-border bg-card/40 space-y-2">
            <Users className="h-8 w-8 text-muted-foreground mx-auto opacity-50" />
            <h3 className="font-bold text-foreground">No faculty members found</h3>
            <p className="text-xs text-muted-foreground">Try clearing your search query or selecting another department.</p>
          </div>
        )}

        {/* Faculty Careers Recruitment Banner */}
        {careersData.isVisible !== false && (
          <div
            id="careers"
            className="rounded-3xl bg-gradient-to-r from-seneca-crimson-dark via-seneca-crimson to-seneca-amber-dark text-white p-6 sm:p-10 lg:p-12 shadow-2xl flex flex-col lg:flex-row items-center justify-between gap-8 scroll-mt-24"
          >
            <div className="space-y-4 max-w-2xl text-center lg:text-left">
              {careersData.badge && (
                <div className="inline-flex items-center gap-1.5 rounded-full border border-white/30 bg-white/10 px-3.5 py-1 text-xs font-extrabold text-white">
                  <Briefcase className="h-3.5 w-3.5" />
                  <span>{careersData.badge}</span>
                </div>
              )}
              <h3 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold font-heading leading-tight">
                {careersData.heading}
              </h3>
              {careersData.description && (
                <p className="text-xs sm:text-sm text-white/90 leading-relaxed">
                  {careersData.description}
                </p>
              )}

              {careersData.benefits && careersData.benefits.length > 0 && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2 text-left text-xs font-semibold text-white/90">
                  {careersData.benefits.map((b, bIdx) => (
                    <div key={bIdx} className="flex items-start gap-2">
                      <Check className="h-4 w-4 text-seneca-amber-light shrink-0 mt-0.5" />
                      <span>{b}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="flex flex-col items-center gap-3 shrink-0">
              <Button
                size="lg"
                onClick={() => setCareerModalOpen(true)}
                className="rounded-full bg-white text-seneca-crimson hover:bg-white/90 font-bold px-8 py-3 text-sm shrink-0 shadow-xl transition-all hover:scale-105 cursor-pointer"
              >
                <Briefcase className="h-4 w-4 mr-2" />
                <span>{careersData.applyButtonText || "Apply as Teacher"}</span>
              </Button>
              {careersData.contactEmail && (
                <span className="text-[11px] text-white/80">
                  Inquiries: <a href={`mailto:${careersData.contactEmail}`} className="underline font-bold hover:text-white">{careersData.contactEmail}</a>
                </span>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Teacher Application Modal Dialog */}
      <Dialog open={careerModalOpen} onOpenChange={setCareerModalOpen}>
        <DialogContent className="max-w-xl max-h-[92vh] overflow-y-auto rounded-3xl p-6 sm:p-8 space-y-4 shadow-2xl border border-border/80">
          <DialogHeader className="border-b border-border/60 pb-3">
            <div className="flex items-center gap-2 text-seneca-crimson font-bold text-xs">
              <Briefcase className="h-4 w-4" />
              <span>Faculty Career Portal</span>
            </div>
            <DialogTitle className="text-xl font-heading font-extrabold text-foreground">
              Apply as Teacher / Faculty Member
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Join Seneca Academy’s distinguished academic roster. Please provide your verified credentials,
              teaching discipline, and curriculum vitae (CV/Resume).
            </DialogDescription>
          </DialogHeader>

          {submittedAppId ? (
            <div className="py-6 space-y-6 text-center animate-in zoom-in-95 duration-200">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-600 ring-8 ring-emerald-500/10">
                <CheckCircle2 className="h-10 w-10" />
              </div>
              <div className="space-y-2">
                <Badge className="bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 text-xs font-bold">
                  Application Logged Successfully
                </Badge>
                <h3 className="text-2xl font-black font-heading text-foreground">
                  Application Received!
                </h3>
                <p className="text-xs text-muted-foreground max-w-md mx-auto leading-relaxed">
                  Thank you for applying to Seneca Academy. Your application and curriculum vitae have been transmitted
                  to the Principal &amp; Departmental Selection Board.
                </p>

                <div className="pt-2 flex flex-col items-center gap-2">
                  <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">
                    Official Reference Code
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-base font-bold text-seneca-crimson bg-seneca-crimson/10 py-2 px-4 rounded-xl border border-seneca-crimson/20 select-all">
                      {submittedAppId}
                    </span>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => copyReferenceId(submittedAppId)}
                      className="rounded-xl text-xs gap-1 h-9"
                    >
                      {copiedAppId ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5" />}
                      <span>{copiedAppId ? "Copied" : "Copy"}</span>
                    </Button>
                  </div>
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-muted/40 border border-border/60 text-left text-xs space-y-1.5">
                <span className="font-bold text-foreground block">What Happens Next?</span>
                <p className="text-muted-foreground text-[11px] leading-relaxed">
                  1. Academic credentials and experience will be assessed against current faculty openings.
                  <br />
                  2. Shortlisted applicants will receive an invitation via WhatsApp/Email for a pedagogical demonstration.
                </p>
              </div>

              <Button onClick={resetCareerForm} className="rounded-xl px-8 bg-seneca-crimson hover:bg-seneca-crimson/90 text-white font-bold text-xs">
                Done &amp; Close Window
              </Button>
            </div>
          ) : (
            <form onSubmit={handleCareerSubmit} className="space-y-4 pt-1">
              {/* 1. Full Name */}
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-foreground">Full Name *</label>
                  <span className="text-[10px] text-muted-foreground">Letters only, 2–60 chars</span>
                </div>
                <Input
                  required
                  value={careerForm.name}
                  onChange={(e) => {
                    setCareerForm({ ...careerForm, name: e.target.value });
                    if (fieldErrors.name) {
                      setFieldErrors((prev) => {
                        const n = { ...prev };
                        delete n.name;
                        return n;
                      });
                    }
                  }}
                  placeholder="e.g. Dr. Salman Qureshi"
                  className={cn("rounded-xl text-xs", fieldErrors.name && "border-rose-500 focus-visible:ring-rose-500")}
                />
                {fieldErrors.name && (
                  <p className="text-[11px] text-rose-500 flex items-center gap-1 mt-0.5">
                    <AlertCircle className="h-3 w-3" />
                    <span>{fieldErrors.name}</span>
                  </p>
                )}
              </div>

              {/* 2. Email & Phone */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-foreground">Email Address *</label>
                  <Input
                    required
                    type="email"
                    value={careerForm.email}
                    onChange={(e) => {
                      setCareerForm({ ...careerForm, email: e.target.value });
                      if (fieldErrors.email) {
                        setFieldErrors((prev) => {
                          const n = { ...prev };
                          delete n.email;
                          return n;
                        });
                      }
                    }}
                    placeholder="salman@example.com"
                    className={cn("rounded-xl text-xs", fieldErrors.email && "border-rose-500 focus-visible:ring-rose-500")}
                  />
                  {fieldErrors.email && (
                    <p className="text-[11px] text-rose-500 flex items-center gap-1 mt-0.5">
                      <AlertCircle className="h-3 w-3" />
                      <span>{fieldErrors.email}</span>
                    </p>
                  )}
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-foreground">Phone / WhatsApp *</label>
                  <Input
                    required
                    value={careerForm.phone}
                    onChange={(e) => handlePhoneChange(e.target.value)}
                    placeholder="0300 1234567 or +92 300 1234567"
                    className={cn("rounded-xl text-xs", fieldErrors.phone && "border-rose-500 focus-visible:ring-rose-500")}
                  />
                  {fieldErrors.phone && (
                    <p className="text-[11px] text-rose-500 flex items-center gap-1 mt-0.5">
                      <AlertCircle className="h-3 w-3" />
                      <span>{fieldErrors.phone}</span>
                    </p>
                  )}
                </div>
              </div>

              {/* 3. Subject, Experience, Degree */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-foreground">Discipline / Wing</label>
                  <select
                    value={careerForm.subject}
                    onChange={(e) => setCareerForm({ ...careerForm, subject: e.target.value })}
                    className="w-full h-9 rounded-xl border border-input bg-background px-3 py-1 text-xs shadow-xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                  >
                    <option value="Mathematics">Mathematics</option>
                    <option value="Physics / Chemistry">Physics / Chemistry</option>
                    <option value="Computer Science & AI">Computer Science &amp; AI</option>
                    <option value="English Literature">English Literature</option>
                    <option value="Biology / STEM">Biology / STEM</option>
                    <option value="Primary Wing">Primary Wing (Grades 1–5)</option>
                    <option value="Administration">Administration &amp; Labs</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-foreground">Experience</label>
                  <select
                    value={careerForm.experienceYears}
                    onChange={(e) => setCareerForm({ ...careerForm, experienceYears: e.target.value })}
                    className="w-full h-9 rounded-xl border border-input bg-background px-3 py-1 text-xs shadow-xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                  >
                    <option value="1–2 Years">1–2 Years</option>
                    <option value="3–5 Years">3–5 Years</option>
                    <option value="5+ Years">5+ Years</option>
                    <option value="10+ Years">10+ Years Senior</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-foreground">Highest Degree</label>
                  <select
                    value={careerForm.qualification}
                    onChange={(e) => setCareerForm({ ...careerForm, qualification: e.target.value })}
                    className="w-full h-9 rounded-xl border border-input bg-background px-3 py-1 text-xs shadow-xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                  >
                    <option value="B.Sc. / B.Ed.">B.Sc. / B.Ed.</option>
                    <option value="M.Sc. / M.Phil.">M.Sc. / M.Phil.</option>
                    <option value="Ph.D. / Post-Doc">Ph.D. / Post-Doc</option>
                  </select>
                </div>
              </div>

              {/* 4. Resume / CV File Upload Section */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-foreground">
                    Upload Resume / CV *
                  </label>
                  <span className="text-[10px] text-muted-foreground">PDF, DOC, DOCX (Max 5 MB)</span>
                </div>

                {resumeInfo ? (
                  <div className="flex items-center justify-between p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/30">
                    <div className="flex items-center gap-2.5 overflow-hidden">
                      <div className="h-8 w-8 rounded-xl bg-emerald-500/20 text-emerald-600 flex items-center justify-center shrink-0">
                        <FileCheck2 className="h-4 w-4" />
                      </div>
                      <div className="overflow-hidden">
                        <span className="text-xs font-bold text-foreground truncate block">
                          {resumeInfo.fileName}
                        </span>
                        <span className="text-[10px] text-muted-foreground block">
                          {resumeInfo.sizeKb} KB • Ready for submission
                        </span>
                      </div>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setResumeFile(null);
                        setResumeInfo(null);
                      }}
                      className="h-7 px-2 rounded-lg text-rose-500 hover:text-rose-600 hover:bg-rose-500/10 text-xs font-bold"
                    >
                      <X className="h-3.5 w-3.5 mr-1" />
                      <span>Change</span>
                    </Button>
                  </div>
                ) : (
                  <label
                    className={cn(
                      "flex flex-col items-center justify-center p-5 rounded-2xl border-2 border-dashed cursor-pointer transition-all hover:bg-muted/40",
                      fieldErrors.resume
                        ? "border-rose-500 bg-rose-500/5"
                        : "border-border hover:border-seneca-crimson/50 bg-card"
                    )}
                  >
                    <input
                      type="file"
                      accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                      onChange={handleResumeSelect}
                      disabled={uploadingResume}
                      className="hidden"
                    />
                    {uploadingResume ? (
                      <div className="flex items-center gap-2 text-seneca-crimson">
                        <Loader2 className="h-5 w-5 animate-spin" />
                        <span className="text-xs font-bold">Uploading &amp; verifying CV document...</span>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center text-center gap-1.5">
                        <div className="h-10 w-10 rounded-2xl bg-muted flex items-center justify-center text-muted-foreground group-hover:text-foreground">
                          <UploadCloud className="h-5 w-5" />
                        </div>
                        <span className="text-xs font-bold text-foreground">
                          Click to browse or drop your CV here
                        </span>
                        <span className="text-[10px] text-muted-foreground">
                          Supported: Adobe PDF (.pdf) or Microsoft Word (.doc, .docx) up to 5 MB
                        </span>
                      </div>
                    )}
                  </label>
                )}

                {fieldErrors.resume && (
                  <p className="text-[11px] text-rose-500 flex items-center gap-1 mt-0.5">
                    <AlertCircle className="h-3 w-3" />
                    <span>{fieldErrors.resume}</span>
                  </p>
                )}
              </div>

              {/* 5. Cover Letter */}
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-foreground">Cover Note &amp; Career Statement</label>
                  <span className="text-[10px] text-muted-foreground">{careerForm.coverLetter.length}/3000</span>
                </div>
                <textarea
                  rows={3}
                  maxLength={3000}
                  value={careerForm.coverLetter}
                  onChange={(e) => setCareerForm({ ...careerForm, coverLetter: e.target.value })}
                  placeholder="Summarize your teaching philosophy, matric/intermediate board results track record, or pedagogical motivation..."
                  className="w-full rounded-xl border border-input bg-transparent px-3 py-2 text-xs shadow-xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring resize-none"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2 border-t border-border/60">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setCareerModalOpen(false)}
                  className="rounded-xl text-xs font-bold"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={loading || uploadingResume}
                  className="rounded-xl text-xs font-bold gap-1.5 bg-seneca-crimson hover:bg-seneca-crimson/90 text-white shadow-md"
                >
                  {loading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Briefcase className="h-3.5 w-3.5" />}
                  <span>Submit Faculty Application</span>
                </Button>
              </div>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </section>
  );
}

export default FacultySection;
