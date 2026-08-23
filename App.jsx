import React, { useState, useEffect, useMemo } from "react";
import {
  LayoutDashboard, BookOpen, CalendarDays, ClipboardList, CheckSquare,
  GraduationCap, Calculator, FolderOpen, Bell, Settings, Menu, X, Search,
  Plus, Clock, TrendingUp, AlertCircle, ChevronRight, ChevronDown, Trash2,
  Pencil, User, Moon, Sun, LogOut, Filter, Download, MapPin, Square,
  CheckCircle2, FileText, Link2, BadgeCheck, Sparkles, Mail, Lock
} from "lucide-react";
import { supabase } from "./supabaseClient.js";

/* =========================================================================
   DESIGN TOKENS
   ========================================================================= */
const FONT_HEAD = "'Poppins', sans-serif";
const FONT_BODY = "'Inter', sans-serif";

const COURSE_COLORS = [
  { bg: "bg-purple-50", text: "text-purple-700", dot: "bg-purple-500", chip: "bg-purple-100 text-purple-700", bar: "bg-purple-500" },
  { bg: "bg-blue-50", text: "text-blue-700", dot: "bg-blue-500", chip: "bg-blue-100 text-blue-700", bar: "bg-blue-500" },
  { bg: "bg-indigo-50", text: "text-indigo-700", dot: "bg-indigo-500", chip: "bg-indigo-100 text-indigo-700", bar: "bg-indigo-500" },
  { bg: "bg-violet-50", text: "text-violet-700", dot: "bg-violet-500", chip: "bg-violet-100 text-violet-700", bar: "bg-violet-500" },
  { bg: "bg-sky-50", text: "text-sky-700", dot: "bg-sky-500", chip: "bg-sky-100 text-sky-700", bar: "bg-sky-500" },
  { bg: "bg-fuchsia-50", text: "text-fuchsia-700", dot: "bg-fuchsia-500", chip: "bg-fuchsia-100 text-fuchsia-700", bar: "bg-fuchsia-500" },
];

const GRADE_POINTS = { A: 4.0, "A-": 3.7, "B+": 3.3, B: 3.0, "B-": 2.7, "C+": 2.3, C: 2.0, "C-": 1.7, "D+": 1.3, D: 1.0, F: 0.0 };
const GRADES = Object.keys(GRADE_POINTS);
const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const SLOTS = ["08:30 – 09:50", "10:00 – 11:20", "11:30 – 12:50", "13:30 – 14:50", "15:00 – 16:20"];

/* =========================================================================
   HELPERS
   ========================================================================= */
function courseColor(idx) { return COURSE_COLORS[((idx % COURSE_COLORS.length) + COURSE_COLORS.length) % COURSE_COLORS.length]; }
function findCourse(courses, id) { return courses.find((c) => c.id === id); }
function daysUntil(dateStr) {
  if (!dateStr) return 0;
  const today = new Date(); today.setHours(0, 0, 0, 0);
  const target = new Date(dateStr + "T00:00:00");
  return Math.round((target - today) / 86400000);
}
function formatDate(dateStr) {
  if (!dateStr) return "";
  const d = new Date(dateStr + "T00:00:00");
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}
function attendanceColor(pct) {
  if (pct >= 85) return { text: "text-emerald-600", bar: "bg-emerald-500", bg: "bg-emerald-50" };
  if (pct >= 75) return { text: "text-amber-600", bar: "bg-amber-500", bg: "bg-amber-50" };
  return { text: "text-rose-600", bar: "bg-rose-500", bg: "bg-rose-50" };
}
function priorityStyle(p) {
  if (p === "High") return "bg-rose-100 text-rose-700";
  if (p === "Medium") return "bg-amber-100 text-amber-700";
  return "bg-slate-100 text-slate-600";
}

/* =========================================================================
   REUSABLE UI ATOMS
   ========================================================================= */
function Card({ children, className = "" }) {
  return <div className={`bg-white rounded-2xl border border-slate-100 shadow-sm ${className}`}>{children}</div>;
}
function SectionHeader({ title, subtitle, action }) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
      <div>
        <h2 style={{ fontFamily: FONT_HEAD }} className="text-xl sm:text-2xl font-semibold text-slate-800">{title}</h2>
        {subtitle && <p className="text-sm text-slate-500 mt-0.5">{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}
function ProgressBar({ value, colorClass = "bg-purple-500", trackClass = "bg-slate-100" }) {
  return (
    <div className={`w-full h-2 rounded-full ${trackClass} overflow-hidden`}>
      <div className={`h-full rounded-full ${colorClass} transition-all duration-500`} style={{ width: `${Math.min(100, Math.max(0, value))}%` }} />
    </div>
  );
}
function ToggleSwitch({ checked, onChange }) {
  return (
    <button onClick={() => onChange(!checked)} className={`relative w-11 h-6 rounded-full transition-colors duration-200 shrink-0 ${checked ? "bg-purple-500" : "bg-slate-200"}`}>
      <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform duration-200 ${checked ? "translate-x-5" : "translate-x-0"}`} />
    </button>
  );
}
function Modal({ open, onClose, title, children }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/40" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-md p-6 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h3 style={{ fontFamily: FONT_HEAD }} className="text-lg font-semibold text-slate-800">{title}</h3>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400"><X size={18} /></button>
        </div>
        {children}
      </div>
    </div>
  );
}
function Field({ label, children }) {
  return (
    <label className="block mb-3">
      <span className="block text-xs font-medium text-slate-500 mb-1.5">{label}</span>
      {children}
    </label>
  );
}
const inputCls = "w-full rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-purple-300 focus:border-purple-300";

function EmptyState({ icon: Icon, text }) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center text-slate-400">
      <Icon size={32} className="mb-2 opacity-60" />
      <p className="text-sm">{text}</p>
    </div>
  );
}

/* =========================================================================
   AUTH SCREEN — sign up / log in with Supabase
   ========================================================================= */
function AuthScreen() {
  const [mode, setMode] = useState("login"); // "login" | "signup"
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = "https://fonts.googleapis.com/css2?family=Poppins:wght@500;600;700&family=Inter:wght@400;500;600&display=swap";
    document.head.appendChild(link);
    return () => document.head.removeChild(link);
  }, []);

  async function handleSubmit(e) {
    e.preventDefault();
    setError(""); setInfo(""); setBusy(true);
    try {
      if (mode === "signup") {
        const { data, error: signUpError } = await supabase.auth.signUp({
          email, password, options: { data: { full_name: name || "Student" } },
        });
        if (signUpError) throw signUpError;
        if (data.session === null) {
          setInfo("Account bana gaya! Agar email confirmation on hai to apna inbox check karen, warna seedha login kar len.");
        }
      } else {
        const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
        if (signInError) throw signInError;
      }
    } catch (err) {
      setError(err.message || "Something went wrong.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div style={{ fontFamily: FONT_BODY }} className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="flex items-center gap-2.5 justify-center mb-6">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center">
            <GraduationCap size={20} className="text-white" />
          </div>
          <span style={{ fontFamily: FONT_HEAD }} className="text-xl font-semibold text-slate-800">UniMate</span>
        </div>
        <Card className="p-6">
          <h1 style={{ fontFamily: FONT_HEAD }} className="text-lg font-semibold text-slate-800 mb-1">{mode === "login" ? "Welcome back" : "Create your account"}</h1>
          <p className="text-sm text-slate-500 mb-5">{mode === "login" ? "Log in to see your dashboard" : "Har student ka apna alag data hota hai"}</p>

          <form onSubmit={handleSubmit}>
            {mode === "signup" && (
              <Field label="Full name">
                <input className={inputCls} value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Zainab Raza" required />
              </Field>
            )}
            <Field label="Email">
              <input type="email" className={inputCls} value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" required />
            </Field>
            <Field label="Password">
              <input type="password" className={inputCls} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="At least 6 characters" minLength={6} required />
            </Field>

            {error && <p className="text-xs text-rose-600 bg-rose-50 rounded-lg px-3 py-2 mb-3">{error}</p>}
            {info && <p className="text-xs text-emerald-600 bg-emerald-50 rounded-lg px-3 py-2 mb-3">{info}</p>}

            <button type="submit" disabled={busy} className="w-full bg-gradient-to-r from-purple-500 to-blue-500 text-white text-sm font-medium py-2.5 rounded-xl hover:opacity-90 disabled:opacity-60">
              {busy ? "Please wait…" : mode === "login" ? "Log in" : "Sign up"}
            </button>
          </form>

          <p className="text-xs text-slate-500 text-center mt-4">
            {mode === "login" ? "Naya account nahi hai?" : "Pehle se account hai?"}{" "}
            <button onClick={() => { setMode(mode === "login" ? "signup" : "login"); setError(""); setInfo(""); }} className="text-purple-600 font-medium hover:underline">
              {mode === "login" ? "Sign up" : "Log in"}
            </button>
          </p>
        </Card>
      </div>
    </div>
  );
}

/* =========================================================================
   NAVIGATION
   ========================================================================= */
const NAV_ITEMS = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "courses", label: "Courses", icon: BookOpen },
  { id: "timetable", label: "Timetable", icon: CalendarDays },
  { id: "assignments", label: "Assignments", icon: ClipboardList },
  { id: "attendance", label: "Attendance", icon: CheckSquare },
  { id: "exams", label: "Exams", icon: GraduationCap },
  { id: "gpa", label: "GPA Calculator", icon: Calculator },
  { id: "notes", label: "Notes & Resources", icon: FolderOpen },
  { id: "notifications", label: "Notifications", icon: Bell },
  { id: "settings", label: "Settings", icon: Settings },
];

function Sidebar({ active, setActive, mobileOpen, setMobileOpen, unreadCount }) {
  const content = (
    <div className="h-full flex flex-col bg-white">
      <div className="flex items-center gap-2.5 px-6 py-6">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center shrink-0">
          <GraduationCap size={19} className="text-white" />
        </div>
        <span style={{ fontFamily: FONT_HEAD }} className="text-lg font-semibold text-slate-800">UniMate</span>
      </div>
      <nav className="flex-1 px-3 space-y-1 overflow-y-auto pb-4">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive = active === item.id;
          return (
            <button key={item.id} onClick={() => { setActive(item.id); setMobileOpen(false); }}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors relative ${isActive ? "bg-gradient-to-r from-purple-500 to-blue-500 text-white shadow-sm" : "text-slate-500 hover:bg-slate-50 hover:text-slate-700"}`}>
              <Icon size={18} />
              <span className="flex-1 text-left">{item.label}</span>
              {item.id === "notifications" && unreadCount > 0 && (
                <span className={`text-[11px] font-semibold rounded-full px-1.5 py-0.5 ${isActive ? "bg-white/25 text-white" : "bg-rose-100 text-rose-600"}`}>{unreadCount}</span>
              )}
            </button>
          );
        })}
      </nav>
      <div className="px-6 py-4 border-t border-slate-100">
        <p className="text-xs text-slate-400">UniMate v1.0 · Connected</p>
      </div>
    </div>
  );
  return (
    <>
      <aside className="hidden lg:block w-64 shrink-0 border-r border-slate-100">{content}</aside>
      {mobileOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="absolute inset-0 bg-slate-900/40" onClick={() => setMobileOpen(false)} />
          <div className="absolute left-0 top-0 h-full w-72 shadow-xl">{content}</div>
        </div>
      )}
    </>
  );
}

function Topbar({ setMobileOpen, profile, unreadCount, setActive, onLogout }) {
  const initials = (profile.full_name || "S").split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase();
  return (
    <div className="sticky top-0 z-30 bg-white/80 backdrop-blur border-b border-slate-100 px-4 sm:px-6 py-3 flex items-center gap-3">
      <button onClick={() => setMobileOpen(true)} className="lg:hidden p-2 rounded-lg hover:bg-slate-100 text-slate-500"><Menu size={20} /></button>
      <div className="flex-1 max-w-md hidden sm:flex items-center gap-2 bg-slate-50 rounded-xl px-3 py-2 border border-slate-100">
        <Search size={16} className="text-slate-400" />
        <input placeholder="Search courses, assignments, notes…" className="bg-transparent outline-none text-sm text-slate-600 w-full placeholder:text-slate-400" />
      </div>
      <div className="flex-1 sm:hidden" />
      <button onClick={() => setActive("notifications")} className="relative p-2 rounded-lg hover:bg-slate-100 text-slate-500">
        <Bell size={19} />
        {unreadCount > 0 && <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-rose-500 rounded-full" />}
      </button>
      <button onClick={onLogout} className="p-2 rounded-lg hover:bg-slate-100 text-slate-500" title="Log out"><LogOut size={18} /></button>
      <button onClick={() => setActive("settings")} className="flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-xl hover:bg-slate-50">
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-400 to-blue-400 flex items-center justify-center text-white text-xs font-semibold">{initials}</div>
        <span className="hidden sm:block text-sm font-medium text-slate-600">{(profile.full_name || "Student").split(" ")[0]}</span>
      </button>
    </div>
  );
}

/* =========================================================================
   DASHBOARD
   ========================================================================= */
function DashboardPage({ courses, assignments, attendance, exams, timetable, profile, setActive }) {
  const overallGpa = useMemo(() => {
    const a = assignments.filter((x) => x.grade);
    return a.length ? "—" : "—";
  }, [assignments]);
  const totalPresent = attendance.reduce((s, a) => s + a.present, 0);
  const totalClasses = attendance.reduce((s, a) => s + a.total, 0);
  const overallAttendance = totalClasses ? Math.round((totalPresent / totalClasses) * 100) : 0;
  const pendingCount = assignments.filter((a) => a.status === "pending").length;
  const nextExam = [...exams].sort((a, b) => new Date(a.date) - new Date(b.date))[0];

  const timelineItems = useMemo(() => {
    const items = [];
    const todayDay = DAYS[(new Date().getDay() + 6) % 7];
    timetable.filter((t) => t.day === todayDay).forEach((t) =>
      items.push({ kind: "class", time: SLOTS[t.slot]?.split(" – ")[0] || "", label: findCourse(courses, t.course_id)?.code || "Class", sub: t.room, courseIdx: courses.findIndex((c) => c.id === t.course_id) })
    );
    assignments.filter((a) => a.status === "pending").slice(0, 2).forEach((a) =>
      items.push({ kind: "assignment", time: formatDate(a.due), label: a.title, sub: findCourse(courses, a.course_id)?.code, courseIdx: courses.findIndex((c) => c.id === a.course_id) })
    );
    if (nextExam) items.push({ kind: "exam", time: `${formatDate(nextExam.date)} · ${nextExam.time}`, label: `${nextExam.type} – ${findCourse(courses, nextExam.course_id)?.name || ""}`, sub: nextExam.room, courseIdx: courses.findIndex((c) => c.id === nextExam.course_id) });
    return items;
  }, [courses, assignments, nextExam, timetable]);

  const stats = [
    { label: "Courses Enrolled", value: courses.length, icon: BookOpen, tone: "purple" },
    { label: "Attendance", value: `${overallAttendance}%`, icon: CheckSquare, tone: "blue" },
    { label: "Pending Assignments", value: pendingCount, icon: ClipboardList, tone: "violet" },
    { label: "Next Exam", value: nextExam ? `${daysUntil(nextExam.date)}d` : "—", icon: Clock, tone: "sky" },
  ];
  const toneMap = { purple: "bg-purple-50 text-purple-600", blue: "bg-blue-50 text-blue-600", violet: "bg-violet-50 text-violet-600", sky: "bg-sky-50 text-sky-600" };

  return (
    <div>
      <div className="mb-6">
        <h1 style={{ fontFamily: FONT_HEAD }} className="text-2xl sm:text-3xl font-semibold text-slate-800">Hi {(profile.full_name || "Student").split(" ")[0]}, welcome back 👋</h1>
        <p className="text-sm text-slate-500 mt-1">Here's what's on your plate today.</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {stats.map((s) => (
          <Card key={s.label} className="p-4 sm:p-5">
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center mb-3 ${toneMap[s.tone]}`}><s.icon size={17} /></div>
            <p style={{ fontFamily: FONT_HEAD }} className="text-xl sm:text-2xl font-semibold text-slate-800">{s.value}</p>
            <p className="text-xs text-slate-500 mt-0.5">{s.label}</p>
          </Card>
        ))}
      </div>

      <Card className="p-5 mb-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Sparkles size={16} className="text-purple-500" />
            <h3 style={{ fontFamily: FONT_HEAD }} className="font-semibold text-slate-800">Coming up</h3>
          </div>
          <button onClick={() => setActive("timetable")} className="text-xs font-medium text-purple-600 flex items-center gap-0.5 hover:underline">View timetable <ChevronRight size={14} /></button>
        </div>
        {timelineItems.length === 0 ? (
          <EmptyState icon={Sparkles} text="Nothing scheduled yet — add a course or assignment to get started." />
        ) : (
          <div className="flex gap-4 overflow-x-auto pb-1 -mx-1 px-1">
            {timelineItems.map((it, i) => {
              const c = courseColor(it.courseIdx >= 0 ? it.courseIdx : 0);
              const kindLabel = it.kind === "class" ? "Class" : it.kind === "assignment" ? "Due" : "Exam";
              return (
                <div key={i} className="min-w-[180px] flex flex-col gap-2">
                  <div className="flex items-center gap-2">
                    <span className={`w-2 h-2 rounded-full ${c.dot}`} />
                    <span className="text-xs text-slate-400">{it.time}</span>
                  </div>
                  <div className={`rounded-xl border border-slate-100 p-3 ${c.bg}`}>
                    <p className={`text-[11px] font-semibold uppercase tracking-wide ${c.text} mb-1`}>{kindLabel}</p>
                    <p className="text-sm font-medium text-slate-700 leading-snug">{it.label}</p>
                    <p className="text-xs text-slate-400 mt-1">{it.sub}</p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 style={{ fontFamily: FONT_HEAD }} className="font-semibold text-slate-800">Attendance snapshot</h3>
            <button onClick={() => setActive("attendance")} className="text-xs font-medium text-purple-600 hover:underline">See all</button>
          </div>
          {attendance.length === 0 ? <EmptyState icon={CheckSquare} text="No attendance records yet." /> : (
            <div className="space-y-4">
              {attendance.slice(0, 4).map((a) => {
                const course = findCourse(courses, a.course_id);
                const pct = a.total ? Math.round((a.present / a.total) * 100) : 0;
                const tone = attendanceColor(pct);
                return (
                  <div key={a.id}>
                    <div className="flex justify-between text-xs mb-1.5">
                      <span className="font-medium text-slate-600">{course?.code}</span>
                      <span className={`font-semibold ${tone.text}`}>{pct}%</span>
                    </div>
                    <ProgressBar value={pct} colorClass={tone.bar} />
                  </div>
                );
              })}
            </div>
          )}
        </Card>

        <Card className="p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 style={{ fontFamily: FONT_HEAD }} className="font-semibold text-slate-800">Pending assignments</h3>
            <button onClick={() => setActive("assignments")} className="text-xs font-medium text-purple-600 hover:underline">See all</button>
          </div>
          {assignments.filter((a) => a.status === "pending").length === 0 ? <EmptyState icon={ClipboardList} text="No pending assignments." /> : (
            <div className="space-y-3">
              {assignments.filter((a) => a.status === "pending").slice(0, 4).map((a) => {
                const course = findCourse(courses, a.course_id);
                const idx = courses.findIndex((c) => c.id === a.course_id);
                const c = courseColor(idx);
                return (
                  <div key={a.id} className="flex items-center gap-3">
                    <span className={`w-2 h-2 rounded-full ${c.dot} shrink-0`} />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-slate-700 truncate">{a.title}</p>
                      <p className="text-xs text-slate-400">{course?.code} · due {formatDate(a.due)}</p>
                    </div>
                    <span className={`text-[11px] font-medium px-2 py-0.5 rounded-full shrink-0 ${priorityStyle(a.priority)}`}>{a.priority}</span>
                  </div>
                );
              })}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}

/* =========================================================================
   COURSES
   ========================================================================= */
function CoursesPage({ courses, onAdd, onDelete }) {
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState({ code: "", name: "", instructor: "", credits: 3 });

  async function addCourse() {
    if (!form.code || !form.name) return;
    await onAdd({ ...form, credits: Number(form.credits) });
    setForm({ code: "", name: "", instructor: "", credits: 3 });
    setModalOpen(false);
  }

  return (
    <div>
      <SectionHeader title="Courses" subtitle={`${courses.length} enrolled this semester`}
        action={<button onClick={() => setModalOpen(true)} className="flex items-center gap-1.5 bg-gradient-to-r from-purple-500 to-blue-500 text-white text-sm font-medium px-4 py-2 rounded-xl shadow-sm hover:opacity-90"><Plus size={16} /> Add course</button>} />
      {courses.length === 0 ? <EmptyState icon={BookOpen} text="No courses yet — tap 'Add course' to get started." /> : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
          {courses.map((c, i) => {
            const col = courseColor(i);
            return (
              <Card key={c.id} className="p-5">
                <div className="flex items-start justify-between mb-3">
                  <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${col.chip}`}>{c.code}</span>
                  <button onClick={() => onDelete(c.id)} className="text-slate-300 hover:text-rose-500"><Trash2 size={15} /></button>
                </div>
                <h3 style={{ fontFamily: FONT_HEAD }} className="font-semibold text-slate-800 mb-1 leading-snug">{c.name}</h3>
                <p className="text-sm text-slate-500 mb-4">{c.instructor}</p>
                <div className="flex items-center justify-between text-xs text-slate-400 pt-3 border-t border-slate-100">
                  <span>{c.credits} Credit Hours</span>
                  <span className={`w-2 h-2 rounded-full ${col.dot}`} />
                </div>
              </Card>
            );
          })}
        </div>
      )}
      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Add a course">
        <Field label="Course code"><input className={inputCls} value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value })} placeholder="e.g. CS-401" /></Field>
        <Field label="Course name"><input className={inputCls} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="e.g. Artificial Intelligence" /></Field>
        <Field label="Instructor"><input className={inputCls} value={form.instructor} onChange={(e) => setForm({ ...form, instructor: e.target.value })} placeholder="e.g. Dr. Ahmed Raza" /></Field>
        <Field label="Credit hours">
          <select className={inputCls} value={form.credits} onChange={(e) => setForm({ ...form, credits: e.target.value })}>{[1, 2, 3, 4].map((n) => <option key={n} value={n}>{n}</option>)}</select>
        </Field>
        <button onClick={addCourse} className="w-full mt-2 bg-gradient-to-r from-purple-500 to-blue-500 text-white text-sm font-medium py-2.5 rounded-xl hover:opacity-90">Add course</button>
      </Modal>
    </div>
  );
}

/* =========================================================================
   TIMETABLE
   ========================================================================= */
function TimetablePage({ courses, timetable, onAdd, onDelete }) {
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState({ course_id: courses[0]?.id || "", day: "Mon", slot: 0, room: "" });

  async function addEntry() {
    if (!form.course_id) return;
    await onAdd({ ...form, slot: Number(form.slot) });
    setModalOpen(false);
  }

  return (
    <div>
      <SectionHeader title="Timetable" subtitle="Your weekly class schedule"
        action={<button onClick={() => setModalOpen(true)} disabled={courses.length === 0} className="flex items-center gap-1.5 bg-gradient-to-r from-purple-500 to-blue-500 text-white text-sm font-medium px-4 py-2 rounded-xl shadow-sm hover:opacity-90 disabled:opacity-40"><Plus size={16} /> Add class</button>} />
      {courses.length === 0 && <p className="text-sm text-slate-400 mb-4">Add a course first, then you can place it on the timetable.</p>}
      <Card className="p-4 sm:p-5 overflow-x-auto">
        <div className="min-w-[720px]">
          <div className="grid grid-cols-[100px_repeat(6,1fr)] gap-2 mb-2">
            <div />
            {DAYS.map((d) => <div key={d} className="text-center text-xs font-semibold text-slate-500 py-2">{d}</div>)}
          </div>
          {SLOTS.map((slot, slotIdx) => (
            <div key={slot} className="grid grid-cols-[100px_repeat(6,1fr)] gap-2 mb-2">
              <div className="text-xs text-slate-400 flex items-center pr-2">{slot}</div>
              {DAYS.map((day) => {
                const entry = timetable.find((t) => t.day === day && t.slot === slotIdx);
                if (!entry) return <div key={day} className="h-16 rounded-xl bg-slate-50" />;
                const idx = courses.findIndex((c) => c.id === entry.course_id);
                const c = courseColor(idx);
                const course = findCourse(courses, entry.course_id);
                return (
                  <button key={day} onClick={() => onDelete(entry.id)} className={`h-16 rounded-xl p-2 text-left ${c.bg} border border-white`}>
                    <p className={`text-xs font-semibold ${c.text} truncate`}>{course?.code}</p>
                    <p className="text-[11px] text-slate-500 truncate flex items-center gap-1"><MapPin size={10} />{entry.room}</p>
                  </button>
                );
              })}
            </div>
          ))}
        </div>
      </Card>
      <p className="text-xs text-slate-400 mt-3">Tap a filled slot to remove it.</p>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Add a class">
        <Field label="Course">
          <select className={inputCls} value={form.course_id} onChange={(e) => setForm({ ...form, course_id: e.target.value })}>
            {courses.map((c) => <option key={c.id} value={c.id}>{c.code} – {c.name}</option>)}
          </select>
        </Field>
        <Field label="Day">
          <select className={inputCls} value={form.day} onChange={(e) => setForm({ ...form, day: e.target.value })}>{DAYS.map((d) => <option key={d}>{d}</option>)}</select>
        </Field>
        <Field label="Time slot">
          <select className={inputCls} value={form.slot} onChange={(e) => setForm({ ...form, slot: e.target.value })}>{SLOTS.map((s, i) => <option key={s} value={i}>{s}</option>)}</select>
        </Field>
        <Field label="Room"><input className={inputCls} value={form.room} onChange={(e) => setForm({ ...form, room: e.target.value })} placeholder="e.g. Room-210" /></Field>
        <button onClick={addEntry} className="w-full mt-2 bg-gradient-to-r from-purple-500 to-blue-500 text-white text-sm font-medium py-2.5 rounded-xl hover:opacity-90">Add to timetable</button>
      </Modal>
    </div>
  );
}

/* =========================================================================
   ASSIGNMENTS
   ========================================================================= */
function AssignmentsPage({ courses, assignments, onAdd, onToggleStatus }) {
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState({ title: "", course_id: courses[0]?.id || "", due: "", priority: "Medium" });
  const groups = [{ key: "pending", label: "Pending" }, { key: "submitted", label: "Submitted" }, { key: "graded", label: "Graded" }];

  async function addAssignment() {
    if (!form.title || !form.due) return;
    await onAdd({ ...form, status: "pending" });
    setForm({ title: "", course_id: courses[0]?.id || "", due: "", priority: "Medium" });
    setModalOpen(false);
  }

  return (
    <div>
      <SectionHeader title="Assignments" subtitle="Track submissions across all courses"
        action={<button onClick={() => setModalOpen(true)} disabled={courses.length === 0} className="flex items-center gap-1.5 bg-gradient-to-r from-purple-500 to-blue-500 text-white text-sm font-medium px-4 py-2 rounded-xl shadow-sm hover:opacity-90 disabled:opacity-40"><Plus size={16} /> New</button>} />
      {assignments.length === 0 ? <EmptyState icon={ClipboardList} text="No assignments yet." /> : (
        <div className="space-y-6">
          {groups.map((g) => {
            const list = assignments.filter((a) => a.status === g.key).sort((a, b) => new Date(a.due) - new Date(b.due));
            if (list.length === 0) return null;
            return (
              <div key={g.key}>
                <h4 className="text-xs font-semibold uppercase tracking-wide text-slate-400 mb-2.5">{g.label} ({list.length})</h4>
                <div className="space-y-2.5">
                  {list.map((a) => {
                    const course = findCourse(courses, a.course_id);
                    const idx = courses.findIndex((c) => c.id === a.course_id);
                    const c = courseColor(idx);
                    return (
                      <Card key={a.id} className="p-4 flex items-center gap-3">
                        <button onClick={() => onToggleStatus(a)} className="shrink-0 text-slate-300 hover:text-purple-500">
                          {a.status === "pending" ? <Square size={19} /> : <CheckCircle2 size={19} className="text-purple-500" />}
                        </button>
                        <div className="flex-1 min-w-0">
                          <p className={`text-sm font-medium text-slate-700 ${a.status !== "pending" ? "line-through decoration-slate-300" : ""}`}>{a.title}</p>
                          <div className="flex items-center gap-2 mt-1 flex-wrap">
                            <span className={`text-[11px] font-medium px-2 py-0.5 rounded-full ${c.chip}`}>{course?.code}</span>
                            <span className="text-xs text-slate-400">Due {formatDate(a.due)}</span>
                            {a.grade && <span className="text-xs font-semibold text-emerald-600">Grade: {a.grade}</span>}
                          </div>
                        </div>
                        <span className={`text-[11px] font-medium px-2 py-0.5 rounded-full shrink-0 ${priorityStyle(a.priority)}`}>{a.priority}</span>
                      </Card>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}
      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Add assignment">
        <Field label="Title"><input className={inputCls} value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="e.g. Lab Report 3" /></Field>
        <Field label="Course">
          <select className={inputCls} value={form.course_id} onChange={(e) => setForm({ ...form, course_id: e.target.value })}>{courses.map((c) => <option key={c.id} value={c.id}>{c.code} – {c.name}</option>)}</select>
        </Field>
        <Field label="Due date"><input type="date" className={inputCls} value={form.due} onChange={(e) => setForm({ ...form, due: e.target.value })} /></Field>
        <Field label="Priority">
          <select className={inputCls} value={form.priority} onChange={(e) => setForm({ ...form, priority: e.target.value })}>{["High", "Medium", "Low"].map((p) => <option key={p}>{p}</option>)}</select>
        </Field>
        <button onClick={addAssignment} className="w-full mt-2 bg-gradient-to-r from-purple-500 to-blue-500 text-white text-sm font-medium py-2.5 rounded-xl hover:opacity-90">Add assignment</button>
      </Modal>
    </div>
  );
}

/* =========================================================================
   ATTENDANCE
   ========================================================================= */
function AttendancePage({ courses, attendance, onMark }) {
  const totalPresent = attendance.reduce((s, a) => s + a.present, 0);
  const totalClasses = attendance.reduce((s, a) => s + a.total, 0);
  const overall = totalClasses ? Math.round((totalPresent / totalClasses) * 100) : 0;

  return (
    <div>
      <SectionHeader title="Attendance" subtitle="Minimum 75% required to stay exam-eligible" />
      {courses.length === 0 ? <EmptyState icon={CheckSquare} text="Add a course first to start tracking attendance." /> : (
        <>
          <Card className="p-5 mb-6 flex items-center gap-5">
            <div className={`w-16 h-16 rounded-2xl flex items-center justify-center text-lg font-semibold shrink-0 ${attendanceColor(overall).bg} ${attendanceColor(overall).text}`}>{overall}%</div>
            <div>
              <p style={{ fontFamily: FONT_HEAD }} className="font-semibold text-slate-800">Overall attendance</p>
              <p className="text-sm text-slate-500">{totalPresent} present out of {totalClasses} classes held</p>
            </div>
          </Card>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {courses.map((course, idx) => {
              const a = attendance.find((x) => x.course_id === course.id) || { course_id: course.id, present: 0, total: 0 };
              const c = courseColor(idx);
              const pct = a.total ? Math.round((a.present / a.total) * 100) : 0;
              const tone = attendanceColor(pct);
              return (
                <Card key={course.id} className="p-5">
                  <div className="flex items-center justify-between mb-2">
                    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${c.chip}`}>{course.code}</span>
                    <span className={`text-sm font-semibold ${tone.text}`}>{pct}%</span>
                  </div>
                  <p className="text-sm text-slate-600 mb-3 truncate">{course.name}</p>
                  <ProgressBar value={pct} colorClass={tone.bar} />
                  <div className="flex items-center justify-between mt-3">
                    <span className="text-xs text-slate-400">{a.present}/{a.total} classes</span>
                    <div className="flex gap-2">
                      <button onClick={() => onMark(course.id, true, a)} className="text-xs font-medium px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-600 hover:bg-emerald-100">Present</button>
                      <button onClick={() => onMark(course.id, false, a)} className="text-xs font-medium px-2.5 py-1 rounded-lg bg-rose-50 text-rose-600 hover:bg-rose-100">Absent</button>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}

/* =========================================================================
   EXAMS
   ========================================================================= */
function ExamsPage({ courses, exams, onAdd }) {
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState({ course_id: courses[0]?.id || "", type: "Midterm", date: "", time: "", room: "" });
  const sorted = [...exams].sort((a, b) => new Date(a.date) - new Date(b.date));

  async function addExam() {
    if (!form.date) return;
    await onAdd(form);
    setModalOpen(false);
  }

  return (
    <div>
      <SectionHeader title="Exams" subtitle="Stay ahead of quizzes, midterms & finals"
        action={<button onClick={() => setModalOpen(true)} disabled={courses.length === 0} className="flex items-center gap-1.5 bg-gradient-to-r from-purple-500 to-blue-500 text-white text-sm font-medium px-4 py-2 rounded-xl shadow-sm hover:opacity-90 disabled:opacity-40"><Plus size={16} /> Add exam</button>} />
      {sorted.length === 0 ? <EmptyState icon={GraduationCap} text="No exams scheduled yet." /> : (
        <div className="space-y-3">
          {sorted.map((e) => {
            const course = findCourse(courses, e.course_id);
            const idx = courses.findIndex((c) => c.id === e.course_id);
            const c = courseColor(idx);
            const d = daysUntil(e.date);
            return (
              <Card key={e.id} className="p-4 sm:p-5 flex items-center gap-4">
                <div className={`w-14 h-14 rounded-2xl flex flex-col items-center justify-center shrink-0 ${c.bg}`}>
                  <span className={`text-lg font-semibold ${c.text}`} style={{ fontFamily: FONT_HEAD }}>{d >= 0 ? d : "–"}</span>
                  <span className={`text-[10px] ${c.text}`}>{d >= 0 ? (d === 0 ? "today" : "days") : "passed"}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className={`text-[11px] font-medium px-2 py-0.5 rounded-full ${c.chip}`}>{course?.code}</span>
                    <span className="text-xs font-semibold text-slate-500">{e.type}</span>
                  </div>
                  <p className="text-sm font-medium text-slate-700 mt-1 truncate">{course?.name}</p>
                  <p className="text-xs text-slate-400 mt-0.5">{formatDate(e.date)} · {e.time} · {e.room}</p>
                </div>
              </Card>
            );
          })}
        </div>
      )}
      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Add exam">
        <Field label="Course">
          <select className={inputCls} value={form.course_id} onChange={(e) => setForm({ ...form, course_id: e.target.value })}>{courses.map((c) => <option key={c.id} value={c.id}>{c.code} – {c.name}</option>)}</select>
        </Field>
        <Field label="Type">
          <select className={inputCls} value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}>{["Quiz", "Midterm", "Final"].map((t) => <option key={t}>{t}</option>)}</select>
        </Field>
        <Field label="Date"><input type="date" className={inputCls} value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} /></Field>
        <Field label="Time"><input className={inputCls} value={form.time} onChange={(e) => setForm({ ...form, time: e.target.value })} placeholder="e.g. 09:00 AM" /></Field>
        <Field label="Room"><input className={inputCls} value={form.room} onChange={(e) => setForm({ ...form, room: e.target.value })} placeholder="e.g. Hall-A" /></Field>
        <button onClick={addExam} className="w-full mt-2 bg-gradient-to-r from-purple-500 to-blue-500 text-white text-sm font-medium py-2.5 rounded-xl hover:opacity-90">Add exam</button>
      </Modal>
    </div>
  );
}

/* =========================================================================
   GPA / CGPA CALCULATOR
   ========================================================================= */
function GPACalculatorPage({ semesters, onAddSemester }) {
  const [tab, setTab] = useState("semester");
  const [rows, setRows] = useState([{ id: 1, name: "Course 1", credits: 3, grade: "A" }]);
  const [semForm, setSemForm] = useState({ name: "", gpa: "", credits: "" });

  const semesterGpa = useMemo(() => {
    const totalCredits = rows.reduce((s, r) => s + Number(r.credits || 0), 0);
    const totalPoints = rows.reduce((s, r) => s + Number(r.credits || 0) * GRADE_POINTS[r.grade], 0);
    return totalCredits ? (totalPoints / totalCredits).toFixed(2) : "0.00";
  }, [rows]);

  const cgpa = useMemo(() => {
    const totalCredits = semesters.reduce((s, r) => s + Number(r.credits || 0), 0);
    const totalPoints = semesters.reduce((s, r) => s + Number(r.credits || 0) * Number(r.gpa || 0), 0);
    return totalCredits ? (totalPoints / totalCredits).toFixed(2) : "0.00";
  }, [semesters]);

  function updateRow(id, field, value) { setRows(rows.map((r) => r.id === id ? { ...r, [field]: value } : r)); }
  function addRow() { setRows([...rows, { id: Date.now(), name: `Course ${rows.length + 1}`, credits: 3, grade: "A" }]); }
  function removeRow(id) { setRows(rows.filter((r) => r.id !== id)); }
  async function addSemester() {
    if (!semForm.name || !semForm.gpa || !semForm.credits) return;
    await onAddSemester({ name: semForm.name, gpa: Number(semForm.gpa), credits: Number(semForm.credits) });
    setSemForm({ name: "", gpa: "", credits: "" });
  }

  return (
    <div>
      <SectionHeader title="GPA / CGPA Calculator" subtitle="4.0 grading scale" />
      <div className="flex gap-2 mb-6 bg-slate-100 rounded-xl p-1 w-fit">
        {[{ id: "semester", label: "Semester GPA" }, { id: "cgpa", label: "CGPA" }].map((t) => (
          <button key={t.id} onClick={() => setTab(t.id)} className={`text-sm font-medium px-4 py-1.5 rounded-lg transition-colors ${tab === t.id ? "bg-white text-purple-600 shadow-sm" : "text-slate-500"}`}>{t.label}</button>
        ))}
      </div>
      {tab === "semester" ? (
        <Card className="p-5">
          <div className="space-y-3 mb-4">
            {rows.map((r) => (
              <div key={r.id} className="grid grid-cols-[1fr_80px_90px_32px] sm:grid-cols-[1fr_100px_110px_36px] gap-2 items-center">
                <input className={inputCls} value={r.name} onChange={(e) => updateRow(r.id, "name", e.target.value)} placeholder="Course name" />
                <input type="number" min="1" max="6" className={inputCls} value={r.credits} onChange={(e) => updateRow(r.id, "credits", e.target.value)} />
                <select className={inputCls} value={r.grade} onChange={(e) => updateRow(r.id, "grade", e.target.value)}>{GRADES.map((g) => <option key={g}>{g}</option>)}</select>
                <button onClick={() => removeRow(r.id)} className="text-slate-300 hover:text-rose-500 justify-self-center"><Trash2 size={16} /></button>
              </div>
            ))}
          </div>
          <button onClick={addRow} className="text-sm font-medium text-purple-600 flex items-center gap-1 mb-5 hover:underline"><Plus size={15} /> Add course</button>
          <div className="rounded-xl bg-gradient-to-r from-purple-500 to-blue-500 p-5 flex items-center justify-between">
            <span className="text-white/90 text-sm font-medium">Semester GPA</span>
            <span style={{ fontFamily: FONT_HEAD }} className="text-2xl font-semibold text-white">{semesterGpa}</span>
          </div>
        </Card>
      ) : (
        <Card className="p-5">
          {semesters.length === 0 ? <EmptyState icon={Calculator} text="Add past semesters to calculate your CGPA." /> : (
            <div className="space-y-2.5 mb-5">
              {semesters.map((s) => (
                <div key={s.id} className="flex items-center justify-between p-3 rounded-xl bg-slate-50">
                  <span className="text-sm font-medium text-slate-700">{s.name}</span>
                  <span className="text-xs text-slate-400">{s.credits} credits</span>
                  <span className="text-sm font-semibold text-purple-600">{Number(s.gpa).toFixed(2)}</span>
                </div>
              ))}
            </div>
          )}
          <div className="grid grid-cols-1 sm:grid-cols-[1fr_100px_100px_auto] gap-2 mb-5">
            <input className={inputCls} placeholder="Semester name" value={semForm.name} onChange={(e) => setSemForm({ ...semForm, name: e.target.value })} />
            <input className={inputCls} placeholder="GPA" type="number" step="0.01" max="4" value={semForm.gpa} onChange={(e) => setSemForm({ ...semForm, gpa: e.target.value })} />
            <input className={inputCls} placeholder="Credits" type="number" value={semForm.credits} onChange={(e) => setSemForm({ ...semForm, credits: e.target.value })} />
            <button onClick={addSemester} className="bg-purple-50 text-purple-600 text-sm font-medium rounded-xl px-4 hover:bg-purple-100">Add</button>
          </div>
          <div className="rounded-xl bg-gradient-to-r from-purple-500 to-blue-500 p-5 flex items-center justify-between">
            <span className="text-white/90 text-sm font-medium">Cumulative CGPA</span>
            <span style={{ fontFamily: FONT_HEAD }} className="text-2xl font-semibold text-white">{cgpa}</span>
          </div>
        </Card>
      )}
    </div>
  );
}

/* =========================================================================
   NOTES & RESOURCES
   ========================================================================= */
const NOTE_ICONS = { PDF: FileText, Slides: FileText, Doc: FileText, Link: Link2 };

function NotesPage({ courses, notes, onAdd }) {
  const [filter, setFilter] = useState("all");
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState({ title: "", course_id: courses[0]?.id || "", type: "PDF" });

  async function addNote() {
    if (!form.title) return;
    await onAdd(form);
    setForm({ title: "", course_id: courses[0]?.id || "", type: "PDF" });
    setModalOpen(false);
  }
  const filtered = filter === "all" ? notes : notes.filter((n) => n.course_id === filter);

  return (
    <div>
      <SectionHeader title="Notes & Resources" subtitle="Everything you've saved, organized by course"
        action={<button onClick={() => setModalOpen(true)} disabled={courses.length === 0} className="flex items-center gap-1.5 bg-gradient-to-r from-purple-500 to-blue-500 text-white text-sm font-medium px-4 py-2 rounded-xl shadow-sm hover:opacity-90 disabled:opacity-40"><Plus size={16} /> Add resource</button>} />
      {courses.length > 0 && (
        <div className="flex items-center gap-2 mb-5 overflow-x-auto pb-1">
          <button onClick={() => setFilter("all")} className={`text-xs font-medium px-3 py-1.5 rounded-full shrink-0 ${filter === "all" ? "bg-purple-500 text-white" : "bg-slate-100 text-slate-500"}`}>All</button>
          {courses.map((c) => (
            <button key={c.id} onClick={() => setFilter(c.id)} className={`text-xs font-medium px-3 py-1.5 rounded-full shrink-0 ${filter === c.id ? "bg-purple-500 text-white" : "bg-slate-100 text-slate-500"}`}>{c.code}</button>
          ))}
        </div>
      )}
      {filtered.length === 0 ? <EmptyState icon={FolderOpen} text="No resources here yet." /> : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
          {filtered.map((n) => {
            const course = findCourse(courses, n.course_id);
            const idx = courses.findIndex((c) => c.id === n.course_id);
            const c = courseColor(idx);
            const Icon = NOTE_ICONS[n.type] || FileText;
            return (
              <Card key={n.id} className="p-5">
                <div className="flex items-start justify-between mb-3">
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${c.bg} ${c.text}`}><Icon size={16} /></div>
                </div>
                <p className="text-sm font-medium text-slate-700 leading-snug mb-2">{n.title}</p>
                <div className="flex items-center justify-between text-xs text-slate-400">
                  <span className={`px-2 py-0.5 rounded-full ${c.chip}`}>{course?.code}</span>
                  <span>{formatDate(n.created_at?.slice(0, 10))}</span>
                </div>
              </Card>
            );
          })}
        </div>
      )}
      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Add resource">
        <Field label="Title"><input className={inputCls} value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="e.g. Chapter 4 Notes" /></Field>
        <Field label="Course">
          <select className={inputCls} value={form.course_id} onChange={(e) => setForm({ ...form, course_id: e.target.value })}>{courses.map((c) => <option key={c.id} value={c.id}>{c.code} – {c.name}</option>)}</select>
        </Field>
        <Field label="Type">
          <select className={inputCls} value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}>{["PDF", "Slides", "Doc", "Link"].map((t) => <option key={t}>{t}</option>)}</select>
        </Field>
        <button onClick={addNote} className="w-full mt-2 bg-gradient-to-r from-purple-500 to-blue-500 text-white text-sm font-medium py-2.5 rounded-xl hover:opacity-90">Save resource</button>
      </Modal>
    </div>
  );
}

/* =========================================================================
   NOTIFICATIONS
   ========================================================================= */
const NOTIF_STYLE = {
  assignment: { icon: ClipboardList, tone: "bg-purple-50 text-purple-600" },
  exam: { icon: GraduationCap, tone: "bg-rose-50 text-rose-600" },
  attendance: { icon: CheckSquare, tone: "bg-amber-50 text-amber-600" },
  system: { icon: BadgeCheck, tone: "bg-blue-50 text-blue-600" },
};

function NotificationsPage({ notifications, onMarkAllRead, onToggleRead }) {
  return (
    <div>
      <SectionHeader title="Notifications" subtitle={`${notifications.filter((n) => !n.read).length} unread`}
        action={notifications.length > 0 && <button onClick={onMarkAllRead} className="text-sm font-medium text-purple-600 hover:underline">Mark all as read</button>} />
      {notifications.length === 0 ? <EmptyState icon={Bell} text="You're all caught up." /> : (
        <div className="space-y-2.5">
          {notifications.map((n) => {
            const s = NOTIF_STYLE[n.type] || NOTIF_STYLE.system;
            const Icon = s.icon;
            return (
              <Card key={n.id} className={`p-4 flex items-start gap-3 cursor-pointer ${!n.read ? "border-purple-100" : ""}`} onClick={() => onToggleRead(n)}>
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${s.tone}`}><Icon size={16} /></div>
                <div className="flex-1 min-w-0">
                  <p className={`text-sm ${!n.read ? "font-medium text-slate-800" : "text-slate-500"}`}>{n.message}</p>
                  <p className="text-xs text-slate-400 mt-1">{new Date(n.created_at).toLocaleString()}</p>
                </div>
                {!n.read && <span className="w-2 h-2 rounded-full bg-purple-500 mt-1.5 shrink-0" />}
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}

/* =========================================================================
   SETTINGS
   ========================================================================= */
function SettingsPage({ profile, onSave, onLogout, userEmail, darkMode, setDarkMode }) {
  const [form, setForm] = useState(profile);
  const [saved, setSaved] = useState(false);
  useEffect(() => { setForm(profile); }, [profile]);
  const initials = (form.full_name || "S").split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase();

  async function save() {
    await onSave(form);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  return (
    <div>
      <SectionHeader title="Settings" subtitle="Manage your profile and preferences" />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-5">
          <h3 style={{ fontFamily: FONT_HEAD }} className="font-semibold text-slate-800 mb-4">Profile</h3>
          <div className="flex items-center gap-4 mb-5">
            <div className="w-14 h-14 rounded-full bg-gradient-to-br from-purple-400 to-blue-400 flex items-center justify-center text-white font-semibold text-lg">{initials}</div>
            <div>
              <p className="font-medium text-slate-700">{form.full_name}</p>
              <p className="text-xs text-slate-400">{userEmail}</p>
            </div>
          </div>
          <Field label="Full name"><input className={inputCls} value={form.full_name || ""} onChange={(e) => setForm({ ...form, full_name: e.target.value })} /></Field>
          <Field label="University"><input className={inputCls} value={form.university || ""} onChange={(e) => setForm({ ...form, university: e.target.value })} /></Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Department"><input className={inputCls} value={form.department || ""} onChange={(e) => setForm({ ...form, department: e.target.value })} /></Field>
            <Field label="Current semester"><input className={inputCls} value={form.semester || ""} onChange={(e) => setForm({ ...form, semester: e.target.value })} /></Field>
          </div>
          <button onClick={save} className="w-full mt-2 bg-gradient-to-r from-purple-500 to-blue-500 text-white text-sm font-medium py-2.5 rounded-xl hover:opacity-90">{saved ? "Saved ✓" : "Save changes"}</button>
        </Card>

        <div className="space-y-6">
          <Card className="p-5">
            <h3 style={{ fontFamily: FONT_HEAD }} className="font-semibold text-slate-800 mb-4">Appearance</h3>
            <div className="flex gap-3">
              {[{ id: "light", label: "Light", icon: Sun }, { id: "dark", label: "Dark", icon: Moon }].map((t) => {
                const isActive = (t.id === "dark") === darkMode;
                return (
                  <button key={t.id} onClick={() => setDarkMode(t.id === "dark")} className={`flex-1 flex flex-col items-center gap-2 py-4 rounded-xl border ${isActive ? "border-purple-300 bg-purple-50 text-purple-600" : "border-slate-100 text-slate-400"}`}>
                    <t.icon size={18} /><span className="text-xs font-medium">{t.label}</span>
                  </button>
                );
              })}
            </div>
          </Card>
          <Card className="p-5">
            <button onClick={onLogout} className="w-full flex items-center justify-center gap-2 text-sm font-medium text-rose-500 py-2.5 rounded-xl hover:bg-rose-50"><LogOut size={16} /> Log out</button>
          </Card>
        </div>
      </div>
    </div>
  );
}

/* =========================================================================
   MAIN APP (after login)
   ========================================================================= */
function MainApp({ session }) {
  const userId = session.user.id;
  const [active, setActive] = useState("dashboard");
  const [mobileOpen, setMobileOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  const [courses, setCourses] = useState([]);
  const [timetable, setTimetable] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [attendance, setAttendance] = useState([]);
  const [exams, setExams] = useState([]);
  const [notes, setNotes] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [semesters, setSemesters] = useState([]);
  const [profile, setProfile] = useState({ full_name: "Student", university: "", department: "", semester: "" });
  const [darkMode, setDarkMode] = useState(() => typeof window !== "undefined" && localStorage.getItem("unimate-theme") === "dark");
  useEffect(() => { localStorage.setItem("unimate-theme", darkMode ? "dark" : "light"); }, [darkMode]);

  useEffect(() => {
    async function loadAll() {
      setLoading(true);
      const [p, c, t, a, at, ex, n, no, se] = await Promise.all([
        supabase.from("profiles").select("*").eq("id", userId).maybeSingle(),
        supabase.from("courses").select("*").order("created_at"),
        supabase.from("timetable_entries").select("*"),
        supabase.from("assignments").select("*").order("due"),
        supabase.from("attendance_records").select("*"),
        supabase.from("exams").select("*").order("date"),
        supabase.from("notes_resources").select("*").order("created_at", { ascending: false }),
        supabase.from("notifications").select("*").order("created_at", { ascending: false }),
        supabase.from("semesters").select("*").order("created_at"),
      ]);
      if (p.data) setProfile(p.data);
      setCourses(c.data || []);
      setTimetable(t.data || []);
      setAssignments(a.data || []);
      setAttendance(at.data || []);
      setExams(ex.data || []);
      setNotes(n.data || []);
      setNotifications(no.data || []);
      setSemesters(se.data || []);
      setLoading(false);
    }
    loadAll();
  }, [userId]);

  const unreadCount = notifications.filter((n) => !n.read).length;

  /* ---- Courses ---- */
  async function addCourse(payload) {
    const { data } = await supabase.from("courses").insert({ ...payload, user_id: userId }).select().single();
    if (data) setCourses((prev) => [...prev, data]);
  }
  async function deleteCourse(id) {
    await supabase.from("courses").delete().eq("id", id);
    setCourses((prev) => prev.filter((c) => c.id !== id));
    setAttendance((prev) => prev.filter((a) => a.course_id !== id));
    setTimetable((prev) => prev.filter((t) => t.course_id !== id));
  }

  /* ---- Timetable ---- */
  async function addTimetableEntry(payload) {
    const { data } = await supabase.from("timetable_entries").insert({ ...payload, user_id: userId }).select().single();
    if (data) setTimetable((prev) => [...prev, data]);
  }
  async function deleteTimetableEntry(id) {
    await supabase.from("timetable_entries").delete().eq("id", id);
    setTimetable((prev) => prev.filter((t) => t.id !== id));
  }

  /* ---- Assignments ---- */
  async function addAssignment(payload) {
    const { data } = await supabase.from("assignments").insert({ ...payload, user_id: userId }).select().single();
    if (data) setAssignments((prev) => [...prev, data]);
  }
  async function toggleAssignmentStatus(a) {
    const next = a.status === "pending" ? "submitted" : a.status === "submitted" ? "pending" : a.status;
    const { data } = await supabase.from("assignments").update({ status: next }).eq("id", a.id).select().single();
    if (data) setAssignments((prev) => prev.map((x) => x.id === a.id ? data : x));
  }

  /* ---- Attendance ---- */
  async function markAttendance(courseId, present, existing) {
    const newPresent = (existing.present || 0) + (present ? 1 : 0);
    const newTotal = (existing.total || 0) + 1;
    const { data } = await supabase.from("attendance_records")
      .upsert({ id: existing.id, course_id: courseId, user_id: userId, present: newPresent, total: newTotal }, { onConflict: "user_id,course_id" })
      .select().single();
    if (data) setAttendance((prev) => {
      const exists = prev.some((a) => a.course_id === courseId);
      return exists ? prev.map((a) => a.course_id === courseId ? data : a) : [...prev, data];
    });
  }

  /* ---- Exams ---- */
  async function addExam(payload) {
    const { data } = await supabase.from("exams").insert({ ...payload, user_id: userId }).select().single();
    if (data) setExams((prev) => [...prev, data]);
  }

  /* ---- Notes ---- */
  async function addNote(payload) {
    const { data } = await supabase.from("notes_resources").insert({ ...payload, user_id: userId }).select().single();
    if (data) setNotes((prev) => [data, ...prev]);
  }

  /* ---- Notifications ---- */
  async function markAllRead() {
    await supabase.from("notifications").update({ read: true }).eq("user_id", userId).eq("read", false);
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  }
  async function toggleRead(n) {
    const { data } = await supabase.from("notifications").update({ read: !n.read }).eq("id", n.id).select().single();
    if (data) setNotifications((prev) => prev.map((x) => x.id === n.id ? data : x));
  }

  /* ---- Semesters (CGPA) ---- */
  async function addSemester(payload) {
    const { data } = await supabase.from("semesters").insert({ ...payload, user_id: userId }).select().single();
    if (data) setSemesters((prev) => [...prev, data]);
  }

  /* ---- Profile ---- */
  async function saveProfile(payload) {
    const { data } = await supabase.from("profiles").upsert({ id: userId, ...payload }).select().single();
    if (data) setProfile(data);
  }

  async function handleLogout() { await supabase.auth.signOut(); }

  const pages = {
    dashboard: <DashboardPage courses={courses} assignments={assignments} attendance={attendance} exams={exams} timetable={timetable} profile={profile} setActive={setActive} />,
    courses: <CoursesPage courses={courses} onAdd={addCourse} onDelete={deleteCourse} />,
    timetable: <TimetablePage courses={courses} timetable={timetable} onAdd={addTimetableEntry} onDelete={deleteTimetableEntry} />,
    assignments: <AssignmentsPage courses={courses} assignments={assignments} onAdd={addAssignment} onToggleStatus={toggleAssignmentStatus} />,
    attendance: <AttendancePage courses={courses} attendance={attendance} onMark={markAttendance} />,
    exams: <ExamsPage courses={courses} exams={exams} onAdd={addExam} />,
    gpa: <GPACalculatorPage semesters={semesters} onAddSemester={addSemester} />,
    notes: <NotesPage courses={courses} notes={notes} onAdd={addNote} />,
    notifications: <NotificationsPage notifications={notifications} onMarkAllRead={markAllRead} onToggleRead={toggleRead} />,
    settings: <SettingsPage profile={profile} onSave={saveProfile} onLogout={handleLogout} userEmail={session.user.email} darkMode={darkMode} setDarkMode={setDarkMode} />,
  };

  return (
    <div style={{ fontFamily: FONT_BODY }} className={`flex h-screen bg-slate-50 text-slate-700 ${darkMode ? "dark" : ""}`}>
      <Sidebar active={active} setActive={setActive} mobileOpen={mobileOpen} setMobileOpen={setMobileOpen} unreadCount={unreadCount} />
      <div className="flex-1 flex flex-col min-w-0">
        <Topbar setMobileOpen={setMobileOpen} profile={profile} unreadCount={unreadCount} setActive={setActive} onLogout={handleLogout} />
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          {loading ? <p className="text-sm text-slate-400">Loading your data…</p> : pages[active]}
        </main>
      </div>
    </div>
  );
}

/* =========================================================================
   ROOT — decides Auth vs Main app
   ========================================================================= */
export default function App() {
  const [session, setSession] = useState(undefined); // undefined = checking, null = logged out

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSession(data.session));
    const { data: listener } = supabase.auth.onAuthStateChange((_event, newSession) => setSession(newSession));
    return () => listener.subscription.unsubscribe();
  }, []);

  if (session === undefined) {
    return <div style={{ fontFamily: FONT_BODY }} className="min-h-screen flex items-center justify-center bg-slate-50 text-slate-400 text-sm">Loading…</div>;
  }
  if (!session) return <AuthScreen />;
  return <MainApp session={session} />;
}
