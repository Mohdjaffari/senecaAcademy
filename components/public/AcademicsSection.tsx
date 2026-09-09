"use client";

import { useState } from "react";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  BookOpen,
  Sparkles,
  Award,
  CheckCircle,
  ArrowRight,
  GraduationCap,
  Atom,
  Binary,
} from "lucide-react";

interface Division {
  id: string;
  name: string;
  grades: string;
  subtitle: string;
  description: string;
  image: string;
  curriculumHighlights: string[];
}

const DIVISIONS: Division[] = [
  {
    id: "early-years",
    name: "Early Years & Montessori",
    grades: "Playgroup – Kindergarten",
    subtitle: "Inquiry, Motor Skills & Phonics",
    description:
      "Our early childhood program blends authentic Montessori apparatus with modern phonics and sensory exploration. Children develop joyful reading habits, foundational numeracy, and cooperative social behaviors.",
    image: "https://images.unsplash.com/photo-1587691592099-24045742c181?auto=format&fit=crop&w=800&q=80",
    curriculumHighlights: [
      "Jolly Phonics & Pre-Reading Fluency",
      "Tactile Numeracy & Concrete Math Manipulatives",
      "Emotional Intelligence & Group Collaboration",
      "Creative Art, Music & Motor Coordination",
    ],
  },
  {
    id: "primary",
    name: "Primary School",
    grades: "Grade 1 – Grade 5",
    subtitle: "Conceptual Foundation & Discovery",
    description:
      "Primary years emphasize conceptual clarity over rote repetition. Students engage with Singapore-style Mathematics, hands-on general sciences, bilingual language immersion, and initial computer coding.",
    image: "https://images.unsplash.com/photo-1509062522246-3755977927d7?auto=format&fit=crop&w=800&q=80",
    curriculumHighlights: [
      "Concrete-Pictorial-Abstract (CPA) Math",
      "Experimental Science Lab Inquiries",
      "English Reading Comprehension & Creative Writing",
      "Introductory Block Coding & Logic Games",
    ],
  },
  {
    id: "middle",
    name: "Middle School",
    grades: "Grade 6 – Grade 8",
    subtitle: "Analytical Rigor & STEM Discovery",
    description:
      "Transitioning students into rigorous critical analysis. Middle schoolers conduct laboratory experiments in separate Physics/Chemistry/Biology modules, master Python coding, and hone public debating skills.",
    image: "https://images.unsplash.com/photo-1581092918056-0c4c3acd3789?auto=format&fit=crop&w=800&q=80",
    curriculumHighlights: [
      "Separate Physics, Chemistry & Biology Labs",
      "Python Programming & Robotics Projects",
      "Debating, Model UN & History Research",
      "Structured Diagnostic Testing Series",
    ],
  },
  {
    id: "matric",
    name: "Senior & Board Matriculation",
    grades: "Grade 9 – Grade 10",
    subtitle: "Board Leadership & College Prep",
    description:
      "Targeted preparation for the Karachi Board examinations across Computer Science and Bio-Science groups. Regular mock examinations, past paper workshops, and continuous teacher feedback guarantee top positions.",
    image: "https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=800&q=80",
    curriculumHighlights: [
      "Full Board Syllabus Coverage by December",
      "Intensive Mock Examination Series & Rubric Reviews",
      "Practical Laboratory Journal & Viva Coaching",
      "Pre-Engineering & Pre-Medical Career Counseling",
    ],
  },
];

export function AcademicsSection() {
  const [activeDivisionId, setActiveDivisionId] = useState(DIVISIONS[0].id);

  const activeDiv = DIVISIONS.find((d) => d.id === activeDivisionId) || DIVISIONS[0];

  return (
    <section id="academics" className="py-20 lg:py-28 bg-background border-t border-border">
      <div className="container space-y-12">
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <Badge variant="crimson">Comprehensive Academic Spectrum</Badge>
          <h2 className="text-3xl sm:text-4xl font-extrabold font-heading text-foreground">
            Structured for Progressive Intellectual Growth
          </h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
            From early sensory discovery to senior board preparation, each academic division at Seneca Academy is calibrated to challenge, inspire, and elevate students.
          </p>
        </div>

        {/* Division Selector Pills */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 max-w-4xl mx-auto">
          {DIVISIONS.map((d) => (
            <button
              key={d.id}
              type="button"
              onClick={() => setActiveDivisionId(d.id)}
              className={`p-4 rounded-2xl border text-left transition-all ${
                activeDivisionId === d.id
                  ? "border-seneca-crimson bg-seneca-crimson/10 shadow-md ring-2 ring-seneca-crimson/20"
                  : "border-border bg-card hover:bg-muted/50"
              }`}
            >
              <span className="text-[10px] font-bold uppercase tracking-wider text-seneca-crimson dark:text-seneca-amber-light block">
                {d.grades}
              </span>
              <span className="text-sm font-bold text-foreground block truncate">
                {d.name}
              </span>
            </button>
          ))}
        </div>

        {/* Detailed Selected Division Showcase */}
        <Card className="max-w-5xl mx-auto border-border bg-card shadow-xl overflow-hidden rounded-3xl">
          <div className="grid grid-cols-1 lg:grid-cols-12 items-center">
            {/* Left Image */}
            <div className="lg:col-span-5 relative h-72 lg:h-[450px] w-full bg-muted">
              <Image
                src={activeDiv.image}
                alt={activeDiv.name}
                fill
                className="object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent lg:hidden" />
              <div className="absolute bottom-4 left-4 right-4 text-white lg:hidden">
                <span className="text-xs uppercase font-bold text-seneca-amber-light">{activeDiv.grades}</span>
                <h4 className="text-lg font-bold font-heading">{activeDiv.name}</h4>
              </div>
            </div>

            {/* Right Details */}
            <CardContent className="lg:col-span-7 p-6 sm:p-10 space-y-6">
              <div className="space-y-1">
                <Badge variant="outline">{activeDiv.grades}</Badge>
                <h3 className="text-2xl sm:text-3xl font-extrabold font-heading text-foreground">
                  {activeDiv.name}
                </h3>
                <p className="text-xs font-bold text-seneca-crimson uppercase tracking-wider">
                  {activeDiv.subtitle}
                </p>
              </div>

              <p className="text-sm text-muted-foreground leading-relaxed">
                {activeDiv.description}
              </p>

              <div className="space-y-2.5 pt-2">
                <h5 className="text-xs font-bold uppercase tracking-wider text-foreground">
                  Curriculum Highlights & Methodologies:
                </h5>
                <ul className="space-y-2 text-xs sm:text-sm text-muted-foreground">
                  {activeDiv.curriculumHighlights.map((point, idx) => (
                    <li key={idx} className="flex items-start gap-2.5">
                      <CheckCircle className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                      <span>{point}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="pt-4 flex items-center gap-4">
                <Button asChild variant="glow" size="sm" className="rounded-xl gap-2 font-bold">
                  <a href="#admissions">
                    <span>Enroll in {activeDiv.name}</span>
                    <ArrowRight className="h-4 w-4" />
                  </a>
                </Button>
                <Button asChild variant="outline" size="sm" className="rounded-xl">
                  <a href="#fees">View Fee Schedule</a>
                </Button>
              </div>
            </CardContent>
          </div>
        </Card>
      </div>
    </section>
  );
}

export default AcademicsSection;
