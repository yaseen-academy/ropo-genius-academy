"use client";

import { createContext, useContext, useEffect, useState } from "react";

export const DICT = {
  en: {
    trainerLogin: "Trainer login",
    studentLogin: "Student login",
    heroTitle: "Learn to code, lesson by lesson, with someone checking your work.",
    heroBody:
      "Every course is split into short, focused lessons — four 30-to-45-minute parts each — followed by an exam that shows you exactly where you stand.",
    browseCourses: "Browse courses",
    askWhatsApp: "Ask a question on WhatsApp",
    availableCourses: "Available courses",
    noCourses:
      "No courses published yet. Once a trainer adds one from the dashboard, it will show up here automatically.",
    lessonsBadge: "lessons · 4 parts each",
    enrollWhatsApp: "Enroll via WhatsApp",
    questionsFooter: "Questions? Chat with us on",
    signIn: "Sign in",
    signingIn: "Signing in…",
    username: "Username",
    password: "Password",
    yourName: "Your name",
    accessCode: "Access code",
    anyName: "Any name",
    trainerLoginSubtitle: "Sign in to manage your courses and students.",
    studentLoginSubtitle: "Enter your name and the access code your trainer gave you.",
    welcomeTitle: "Welcome! Tell us a bit about you",
    welcomeName: "What's your name?",
    welcomeAge: "How old are you?",
    welcomeRole: "Are you a trainer or a student?",
    welcomeColor: "Pick your favorite color",
    trainer: "Trainer",
    student: "Student",
    continue: "Continue",
    skip: "Skip",
    gamesNav: "Practice & games",
    gamesTitle: "Practice & games",
    gamesBody:
      "Typing fast makes coding much smoother. Here are a few free sites to practice typing and coding through games.",
  },
  ar: {
    trainerLogin: "دخول المدرب",
    studentLogin: "دخول الطالب",
    heroTitle: "اتعلم البرمجة، درس بدرس، وحد بيراجع شغلك.",
    heroBody:
      "كل كورس مقسم لدروس قصيرة ومركزة — أربع أجزاء من 30 لـ 45 دقيقة لكل درس — وبعدها امتحان يوريك مستواك بالظبط.",
    browseCourses: "تصفح الكورسات",
    askWhatsApp: "اسأل سؤال على واتساب",
    availableCourses: "الكورسات المتاحة",
    noCourses: "لسه مفيش كورسات منشورة. أول ما المدرب يضيف كورس من لوحة التحكم هيظهر هنا تلقائيًا.",
    lessonsBadge: "درس · 4 أجزاء لكل درس",
    enrollWhatsApp: "اشترك عبر واتساب",
    questionsFooter: "عندك سؤال؟ كلمنا على",
    signIn: "تسجيل الدخول",
    signingIn: "جاري الدخول…",
    username: "اسم المستخدم",
    password: "كلمة السر",
    yourName: "اسمك",
    accessCode: "كود الدخول",
    anyName: "أي اسم",
    trainerLoginSubtitle: "سجل دخولك عشان تدير كورساتك وطلابك.",
    studentLoginSubtitle: "اكتب اسمك وكود الدخول اللي المدرب أداهولك.",
    welcomeTitle: "أهلًا بيك! قولنا عن نفسك شوية",
    welcomeName: "إيه اسمك؟",
    welcomeAge: "عندك كام سنة؟",
    welcomeRole: "أنت مدرب ولا طالب؟",
    welcomeColor: "اختار لونك المفضل",
    trainer: "مدرب",
    student: "طالب",
    continue: "استمرار",
    skip: "تخطي",
    gamesNav: "تمرين وألعاب",
    gamesTitle: "تمرين وألعاب",
    gamesBody: "الكتابة بسرعة بتخلي البرمجة أسهل بكتير. دي شوية مواقع مجانية تتمرن فيها على الكتابة والبرمجة من خلال ألعاب.",
  },
};

const LangContext = createContext({ lang: "en", setLang: () => {}, t: (k) => k });

export function LangProvider({ children }) {
  const [lang, setLangState] = useState("en");

  useEffect(() => {
    const saved = window.localStorage.getItem("ca_lang");
    if (saved === "ar" || saved === "en") setLangState(saved);
  }, []);

  useEffect(() => {
    document.documentElement.lang = lang;
    document.documentElement.dir = lang === "ar" ? "rtl" : "ltr";
  }, [lang]);

  function setLang(next) {
    setLangState(next);
    window.localStorage.setItem("ca_lang", next);
  }

  function t(key) {
    return DICT[lang]?.[key] ?? DICT.en[key] ?? key;
  }

  return <LangContext.Provider value={{ lang, setLang, t }}>{children}</LangContext.Provider>;
}

export function useLang() {
  return useContext(LangContext);
}
