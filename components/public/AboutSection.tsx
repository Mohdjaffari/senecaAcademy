"use client";

import { useState } from "react";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Compass,
  Target,
  Sparkles,
  BookOpen,
  Award,
  Cpu,
  HeartHandshake,
  ShieldCheck,
  Quote,
} from "lucide-react";

export function AboutSection() {
  const [activeTab, setActiveTab] = useState("vision");

  const pillars = [
    {
      title: "Conceptual STEM Pedagogy",
      desc: "Moving beyond rote memorization into inquiry-based science, robotics, and algorithmic problem solving.",
      icon: <Cpu className="h-5 w-5" />,
    },
    {
      title: "Ethical Character Coaching",
      desc: "Instilling empathy, honesty, personal discipline, and civic responsibility into every student.",
      icon: <HeartHandshake className="h-5 w-5" />,
    },
    {
      title: "Board Examination Mastery",
      desc: "Proven track record of top positions across Karachi Matriculation Board with rigorous test simulations.",
      icon: <Award className="h-5 w-5" />,
    },
    {
      title: "Bilingual Communication",
      desc: "Fostering articulate public speaking, debate, and written eloquence in both English and Urdu.",
      icon: <BookOpen className="h-5 w-5" />,
    },
  ];

  return (
    <section id="about" className="py-20 lg:py-28 bg-card/40 border-t border-border">
      <div className="container space-y-16">
        {/* Top Header & Philosophy */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-6 space-y-6">
            <div className="space-y-2">
              <Badge variant="crimson">Institutional Heritage</Badge>
              <h2 className="text-3xl sm:text-4xl font-extrabold font-heading text-foreground leading-tight">
                Two Decades of Academic Distinction & Moral Leadership
              </h2>
            </div>

            <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
              Founded on the belief that true education must transform both the mind and character, Seneca Academy has established itself as one of Karachi&apos;s most respected educational institutions.
            </p>

            <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
              Our campus in Soldier Bazar provides a secure, technologically advanced, and emotionally supportive environment where students are challenged to reach their highest intellectual potential.
            </p>

            {/* Vision & Mission Tabs */}
            <div className="pt-2">
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="grid grid-cols-2 w-full h-11">
                  <TabsTrigger value="vision" className="text-xs font-bold gap-2">
                    <Compass className="h-4 w-4" />
                    <span>Our Vision</span>
                  </TabsTrigger>
                  <TabsTrigger value="mission" className="text-xs font-bold gap-2">
                    <Target className="h-4 w-4" />
                    <span>Our Mission</span>
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="vision" className="p-4 rounded-2xl bg-card border border-border mt-3 text-xs sm:text-sm text-muted-foreground leading-relaxed">
                  <strong className="text-foreground block mb-1">A Center of Global Educational Excellence</strong>
                  To be recognized as a premier school system fostering innovation, intellectual rigor, and compassionate leadership—empowering graduates who positively shape the future of Pakistan and the global community.
                </TabsContent>

                <TabsContent value="mission" className="p-4 rounded-2xl bg-card border border-border mt-3 text-xs sm:text-sm text-muted-foreground leading-relaxed">
                  <strong className="text-foreground block mb-1">Empowering Every Individual Intellect</strong>
                  To deliver a stimulating, balanced, and values-centered curriculum taught by master educators, cultivating critical thinking, emotional resilience, and academic excellence in every child.
                </TabsContent>
              </Tabs>
            </div>
          </div>

          {/* Right Principal Message Card */}
          <div className="lg:col-span-6">
            <div className="rounded-3xl border border-border bg-gradient-to-br from-card via-card to-seneca-crimson/5 p-6 sm:p-8 shadow-xl relative overflow-hidden space-y-6">
              <div className="flex items-center gap-4">
                <div className="relative h-16 w-16 overflow-hidden rounded-2xl border-2 border-seneca-crimson bg-muted shrink-0">
                  <Image
                    src="https://images.unsplash.com/photo-1554126807-6b10f6f6692a?auto=format&fit=crop&w=400&q=80"
                    alt="Principal M. Zohaib Ali"
                    fill
                    className="object-cover"
                  />
                </div>
                <div>
                  <h3 className="font-heading font-bold text-lg text-foreground">
                    M. Zohaib Ali
                  </h3>
                  <p className="text-xs font-semibold text-seneca-crimson dark:text-seneca-amber-light">
                    Executive Principal & Academic Director
                  </p>
                  <p className="text-[11px] text-muted-foreground">
                    M.Sc. Educational Leadership, Ph.D. Fellow
                  </p>
                </div>
              </div>

              <div className="relative pl-6 italic text-sm text-foreground/90 leading-relaxed border-l-2 border-seneca-crimson space-y-2">
                <Quote className="h-6 w-6 text-seneca-crimson/30 absolute -top-3 -left-3" />
                <p>
                  &ldquo;At Seneca Academy, our objective is far more profound than preparing students for paper exams. We nurture young men and women who possess razor-sharp analytical minds, unyielding ethical compasses, and the courage to lead with empathy.&rdquo;
                </p>
              </div>

              <div className="pt-2 flex items-center justify-between text-xs text-muted-foreground border-t border-border/80">
                <span>Executive Office</span>
                <span className="font-bold text-foreground font-mono">Seneca Academy Karachi</span>
              </div>
            </div>
          </div>
        </div>

        {/* 4 Core Pillars */}
        <div className="space-y-6">
          <div className="text-center space-y-1">
            <span className="text-xs font-bold text-seneca-crimson uppercase tracking-wider">
              The Seneca Standard
            </span>
            <h3 className="text-2xl font-extrabold font-heading text-foreground">
              Four Pillars of Institutional Excellence
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {pillars.map((p, idx) => (
              <Card key={idx} className="border-border bg-card shadow-sm hover:shadow-md transition-all p-6 space-y-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-seneca-crimson/10 text-seneca-crimson">
                  {p.icon}
                </div>
                <h4 className="font-heading font-bold text-base text-foreground">
                  {p.title}
                </h4>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  {p.desc}
                </p>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

export default AboutSection;
