import React, { useState, useEffect, useMemo } from "react";
import {
  LayoutDashboard, BookOpen, CalendarDays, ClipboardList, CheckSquare,
  GraduationCap, Calculator, FolderOpen, Bell, Settings, Menu, X, Search,
  Plus, Clock, TrendingUp, AlertCircle, ChevronRight, ChevronDown, Trash2,
  Pencil, User, Moon, Sun, LogOut, Filter, Download, MapPin, Square,
  CheckCircle2, FileText, Link2, BadgeCheck, Sparkles
} from "lucide-react";

/* =========================================================================
   DESIGN TOKENS
   Soft purple + blue + white + light grey, rounded cards, professional feel.
   Fonts injected once (Poppins for headings, Inter for body/data).
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

/* =========================================================================
   MOCK DATA  (swap these with real API calls once the backend exists —
   see the `api` object below, which is the single seam to change later)
   ========================================================================= */
const initialCourses = [
  { id: "c1", code: "CS-301", name: "Data Structures & Algorithms", instructor: "Dr. Ayesha Khan", credits: 3 },
  { id: "c2", code: "CS-315", name: "Database Systems", instructor: "Mr. Bilal Ahmed", credits: 3 },
  { id: "c3", code: "CS-322", name: "Operating Systems", instructor: "Dr. Sana Malik", credits: 4 },
  { id: "c4", code: "MATH-241", name: "Discrete Mathematics", instructor: "Dr. Imran Qureshi", credits: 3 },
  { id: "c5", code: "ENG-201", name: "Technical Writing", instructor: "Ms. Hira Fatima", credits: 2 },
  { id: "c6", code: "CS-330", name: "Software Engineering", instructor: "Dr. Usman Tariq", credits: 3 },
];

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const SLOTS = ["08:30 – 09:50", "10:00 – 11:20", "11:30 – 12:50", "13:30 – 14:50", "15:00 – 16:20"];

const initialTimetable = [
  { day: "Mon", slot: 0, courseId: "c1", room: "Lab-3" },
  { day: "Mon", slot: 2, courseId: "c4", room: "Room-210" },
  { day: "Tue", slot: 1, courseId: "c2", room: "Room-114" },
  { day: "Tue", slot: 3, courseId: "c6", room: "Room-208" },
  { day: "Wed", slot: 0, courseId: "c1", room: "Lab-3" },
  { day: "Wed", slot: 2, courseId: "c3", room: "Lab-1" },
  { day: "Thu", slot: 1, courseId: "c2", room: "Room-114" },
  { day: "Thu", slot: 4, courseId: "c5", room: "Room-301" },
  { day: "Fri", slot: 0, courseId: "c4", room: "Room-210" },
  { day: "Fri", slot: 2, courseId: "c3", room: "Lab-1" },
  { day: "Sat", slot: 1, courseId: "c6", room: "Room-208" },
];

const initialAssignments = [
  { id: "a1", title: "Binary Search Trees – Problem Set", courseId: "c1", due: "2026-08-25", priority: "High", status: "pending" },
  { id: "a2", title: "ER Diagram for Library System", courseId: "c2", due: "2026-08-27", priority: "Medium", status: "pending" },
  { id: "a3", title: "Process Scheduling Report", courseId: "c3", due: "2026-08-29", priority: "High", status: "pending" },
  { id: "a4", title: "Proof Set – Induction", courseId: "c4", due: "2026-08-20", priority: "Medium", status: "submitted" },
  { id: "a5", title: "Resume & Cover Letter Draft", courseId: "c5", due: "2026-08-15", priority: "Low", status: "graded", grade: "A-" },
  { id: "a6", title: "Sprint 1 – User Stories", courseId: "c6", due: "2026-09-02", priority: "Medium", status: "pending" },
];

const initialAttendance = [
  { courseId: "c1", present: 42, total: 48 },
  { courseId: "c2", present: 30, total: 40 },
  { courseId: "c3", present: 25, total: 36 },
  { courseId: "c4", present: 38, total: 40 },
  { courseId: "c5", present: 20, total: 28 },
  { courseId: "c6", present: 33, total: 38 },
];

const initialExams = [
  { id: "e1", courseId: "c3", type: "Midterm", date: "2026-08-27", time: "09:00 AM", room: "Hall-A" },
  { id: "e2", courseId: "c2", type: "Midterm", date: "2026-08-30", time: "11:00 AM", room: "Hall-B" },
  { id: "e3", courseId: "c1", type: "Final", date: "2026-09-15", time: "09:00 AM", room: "Hall-A" },
  { id: "e4", courseId: "c4", type: "Quiz", date: "2026-08-24", time: "10:00 AM", room: "Room-210" },
  { id: "e5", courseId: "c6", type: "Final", date: "2026-09-18", time: "02:00 PM", room: "Hall-C" },
];

const initialNotes = [
  { id: "n1", courseId: "c1", title: "Trees & Graphs – Lecture Slides", type: "Slides", date: "2026-08-18" },
  { id: "n2", courseId: "c2", title: "Normalization Cheat Sheet", type: "PDF", date: "2026-08-16" },
  { id: "n3", courseId: "c3", title: "Scheduling Algorithms Notes", type: "Doc", date: "2026-08-19" },
  { id: "n4", courseId: "c4", title: "Induction & Recursion Examples", type: "PDF", date: "2026-08-12" },
  { id: "n5", courseId: "c6", title: "SRS Template (Google Doc)", type: "Link", date: "2026-08-20" },
];

const initialNotifications = [
  { id: "no1", type: "assignment", message: "\"Process Scheduling Report\" is due in 6 days.", time: "2h ago", read: false },
  { id: "no2", type: "exam", message: "Quiz for Discrete Mathematics is tomorrow at 10:00 AM.", time: "5h ago", read: false },
  { id: "no3", type: "attendance", message: "Your attendance in Operating Systems dropped to 69%.", time: "1d ago", read: false },
  { id: "no4", type: "system", message: "New resource added to Software Engineering.", time: "2d ago", read: true },
  { id: "no5", type: "assignment", message: "\"Resume & Cover Letter Draft\" was graded: A-.", time: "3d ago", read: true },
];

const initialSemesters = [
  { id: "s1", name: "Semester 1", gpa: 3.62, credits: 16 },
  { id: "s2", name: "Semester 2", gpa: 3.75, credits: 18 },
  { id: "s3", name: "Semester 3", gpa: 3.58, credits: 17 },
];

const profileDefault = { name: "Zainab Raza", email: "zainab.raza@student.edu.pk", university: "National University of Sciences", department: "Computer Science", semester: "5th Semester" };

/* Single seam for the future backend — every page reads through here so
   swapping mock arrays for fetch() calls later means editing only this. */
const api = {
  getCourses: () => initialCourses,
  getTimetable: () => initialTimetable,
  getAssignments: () => initialAssignments,
  getAttendance: () => initialAttendance,
  getExams: () => initialExams,
  getNotes: () => initialNotes,
  getNotifications: () => initialNotifications,
  getSemesters: () => initialSemesters,
  getProfile: () => profileDefault,
};

/* =========================================================================
   HELPERS
   ========================================================================= */
function courseColor(idx) { return COURSE_COLORS[idx % COURSE_COLORS.length]; }
function findCourse(courses, id) { return courses.find((c) => c.id === id); }
function daysUntil(dateStr) {
  const today = new Date("2026-08-23T00:00:00");
  const target = new Date(dateStr + "T00:00:00");
  return Math.round((target - today) / 86400000);
}
function formatDate(dateStr) {
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
    <button
      onClick={() => onChange(!checked)}
      className={`relative w-11 h-6 rounded-full transition-colors duration-200 shrink-0 ${checked ? "bg-purple-500" : "bg-slate-200"}`}
    >
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
            <button
              key={item.id}
              onClick={() => { setActive(item.id); setMobileOpen(false); }}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors relative ${
                isActive ? "bg-gradient-to-r from-purple-500 to-blue-500 text-white shadow-sm" : "text-slate-500 hover:bg-slate-50 hover:text-slate-700"
              }`}
            >
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
        <p className="text-xs text-slate-400">UniMate v1.0 · Frontend Preview</p>
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

function Topbar({ setMobileOpen, profile, unreadCount, setActive }) {
  const initials = profile.name.split(" ").map((n) => n[0]).join("").slice(0, 2);
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
      <button onClick={() => setActive("settings")} className="flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-xl hover:bg-slate-50">
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-400 to-blue-400 flex items-center justify-center text-white text-xs font-semibold">{initials}</div>
        <span className="hidden sm:block text-sm font-medium text-slate-600">{profile.name.split(" ")[0]}</span>
      </button>
    </div>
  );
}

/* =========================================================================
   DASHBOARD
   ========================================================================= */
function DashboardPage({ courses, assignments, attendance, exams, profile, setActive }) {
  const overallGpa = 3.68;
  const overallAttendance = Math.round((attendance.reduce((s, a) => s + a.present, 0) / attendance.reduce((s, a) => s + a.total, 0)) * 100);
  const pendingCount = assignments.filter((a) => a.status === "pending").length;
  const nextExam = [...exams].sort((a, b) => new Date(a.date) - new Date(b.date))[0];

  const timelineItems = useMemo(() => {
    const items = [];
    initialTimetable.filter((t) => t.day === "Mon").forEach((t) => items.push({ kind: "class", time: SLOTS[t.slot].split(" – ")[0], label: findCourse(courses, t.courseId)?.code, sub: t.room, courseIdx: courses.findIndex((c) => c.id === t.courseId) }));
    assignments.filter((a) => a.status === "pending").slice(0, 2).forEach((a) => items.push({ kind: "assignment", time: formatDate(a.due), label: a.title, sub: findCourse(courses, a.courseId)?.code, courseIdx: courses.findIndex((c) => c.id === a.courseId) }));
    if (nextExam) items.push({ kind: "exam", time: `${formatDate(nextExam.date)} · ${nextExam.time}`, label: `${nextExam.type} – ${findCourse(courses, nextExam.courseId)?.name}`, sub: nextExam.room, courseIdx: courses.findIndex((c) => c.id === nextExam.courseId) });
    return items;
  }, [courses, assignments, nextExam]);

  const stats = [
    { label: "Current CGPA", value: overallGpa.toFixed(2), icon: GraduationCap, tone: "purple" },
    { label: "Attendance", value: `${overallAttendance}%`, icon: CheckSquare, tone: "blue" },
    { label: "Pending Assignments", value: pendingCount, icon: ClipboardList, tone: "violet" },
    { label: "Next Exam", value: nextExam ? `${daysUntil(nextExam.date)}d` : "—", icon: Clock, tone: "sky" },
  ];
  const toneMap = { purple: "bg-purple-50 text-purple-600", blue: "bg-blue-50 text-blue-600", violet: "bg-violet-50 text-violet-600", sky: "bg-sky-50 text-sky-600" };

  return (
    <div>
      <div className="mb-6">
        <h1 style={{ fontFamily: FONT_HEAD }} className="text-2xl sm:text-3xl font-semibold text-slate-800">Hi {profile.name.split(" ")[0]}, welcome back 👋</h1>
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

      {/* Signature element: chronological "today at a glance" strip mixing classes, assignments & exams */}
      <Card className="p-5 mb-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Sparkles size={16} className="text-purple-500" />
            <h3 style={{ fontFamily: FONT_HEAD }} className="font-semibold text-slate-800">Coming up</h3>
          </div>
          <button onClick={() => setActive("timetable")} className="text-xs font-medium text-purple-600 flex items-center gap-0.5 hover:underline">View timetable <ChevronRight size={14} /></button>
        </div>
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
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 style={{ fontFamily: FONT_HEAD }} className="font-semibold text-slate-800">Attendance snapshot</h3>
            <button onClick={() => setActive("attendance")} className="text-xs font-medium text-purple-600 hover:underline">See all</button>
          </div>
          <div className="space-y-4">
            {attendance.slice(0, 4).map((a) => {
              const course = findCourse(courses, a.courseId);
              const pct = Math.round((a.present / a.total) * 100);
              const tone = attendanceColor(pct);
              return (
                <div key={a.courseId}>
                  <div className="flex justify-between text-xs mb-1.5">
                    <span className="font-medium text-slate-600">{course?.code}</span>
                    <span className={`font-semibold ${tone.text}`}>{pct}%</span>
                  </div>
                  <ProgressBar value={pct} colorClass={tone.bar} />
                </div>
              );
            })}
          </div>
        </Card>

        <Card className="p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 style={{ fontFamily: FONT_HEAD }} className="font-semibold text-slate-800">Pending assignments</h3>
            <button onClick={() => setActive("assignments")} className="text-xs font-medium text-purple-600 hover:underline">See all</button>
          </div>
          <div className="space-y-3">
            {assignments.filter((a) => a.status === "pending").slice(0, 4).map((a) => {
              const course = findCourse(courses, a.courseId);
              const idx = courses.findIndex((c) => c.id === a.courseId);
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
        </Card>
      </div>
    </div>
  );
}

/* =========================================================================
   COURSES
   ========================================================================= */
function CoursesPage({ courses, setCourses }) {
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState({ code: "", name: "", instructor: "", credits: 3 });

  function addCourse() {
    if (!form.code || !form.name) return;
    setCourses([...courses, { id: "c" + Date.now(), ...form, credits: Number(form.credits) }]);
    setForm({ code: "", name: "", instructor: "", credits: 3 });
    setModalOpen(false);
  }

  return (
    <div>
      <SectionHeader
        title="Courses"
        subtitle={`${courses.length} enrolled this semester`}
        action={<button onClick={() => setModalOpen(true)} className="flex items-center gap-1.5 bg-gradient-to-r from-purple-500 to-blue-500 text-white text-sm font-medium px-4 py-2 rounded-xl shadow-sm hover:opacity-90"><Plus size={16} /> Add course</button>}
      />
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
        {courses.map((c, i) => {
          const col = courseColor(i);
          return (
            <Card key={c.id} className="p-5">
              <div className="flex items-start justify-between mb-3">
                <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${col.chip}`}>{c.code}</span>
                <button onClick={() => setCourses(courses.filter((x) => x.id !== c.id))} className="text-slate-300 hover:text-rose-500"><Trash2 size={15} /></button>
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

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Add a course">
        <Field label="Course code"><input className={inputCls} value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value })} placeholder="e.g. CS-401" /></Field>
        <Field label="Course name"><input className={inputCls} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="e.g. Artificial Intelligence" /></Field>
        <Field label="Instructor"><input className={inputCls} value={form.instructor} onChange={(e) => setForm({ ...form, instructor: e.target.value })} placeholder="e.g. Dr. Ahmed Raza" /></Field>
        <Field label="Credit hours">
          <select className={inputCls} value={form.credits} onChange={(e) => setForm({ ...form, credits: e.target.value })}>
            {[1, 2, 3, 4].map((n) => <option key={n} value={n}>{n}</option>)}
          </select>
        </Field>
        <button onClick={addCourse} className="w-full mt-2 bg-gradient-to-r from-purple-500 to-blue-500 text-white text-sm font-medium py-2.5 rounded-xl hover:opacity-90">Add course</button>
      </Modal>
    </div>
  );
}

/* =========================================================================
   TIMETABLE
   ========================================================================= */
function TimetablePage({ courses, timetable }) {
  return (
    <div>
      <SectionHeader title="Timetable" subtitle="Your weekly class schedule" />
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
                const idx = courses.findIndex((c) => c.id === entry.courseId);
                const c = courseColor(idx);
                const course = findCourse(courses, entry.courseId);
                return (
                  <div key={day} className={`h-16 rounded-xl p-2 ${c.bg} border border-white`}>
                    <p className={`text-xs font-semibold ${c.text} truncate`}>{course?.code}</p>
                    <p className="text-[11px] text-slate-500 truncate flex items-center gap-1"><MapPin size={10} />{entry.room}</p>
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

/* =========================================================================
   ASSIGNMENTS
   ========================================================================= */
function AssignmentsPage({ courses, assignments, setAssignments }) {
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState({ title: "", courseId: courses[0]?.id, due: "", priority: "Medium" });
  const groups = [
    { key: "pending", label: "Pending" },
    { key: "submitted", label: "Submitted" },
    { key: "graded", label: "Graded" },
  ];

  function addAssignment() {
    if (!form.title || !form.due) return;
    setAssignments([...assignments, { id: "a" + Date.now(), ...form, status: "pending" }]);
    setForm({ title: "", courseId: courses[0]?.id, due: "", priority: "Medium" });
    setModalOpen(false);
  }
  function toggleStatus(id) {
    setAssignments(assignments.map((a) => a.id === id ? { ...a, status: a.status === "pending" ? "submitted" : a.status === "submitted" ? "pending" : a.status } : a));
  }

  return (
    <div>
      <SectionHeader
        title="Assignments"
        subtitle="Track submissions across all courses"
        action={<button onClick={() => setModalOpen(true)} className="flex items-center gap-1.5 bg-gradient-to-r from-purple-500 to-blue-500 text-white text-sm font-medium px-4 py-2 rounded-xl shadow-sm hover:opacity-90"><Plus size={16} /> New</button>}
      />
      <div className="space-y-6">
        {groups.map((g) => {
          const list = assignments.filter((a) => a.status === g.key).sort((a, b) => new Date(a.due) - new Date(b.due));
          if (list.length === 0) return null;
          return (
            <div key={g.key}>
              <h4 className="text-xs font-semibold uppercase tracking-wide text-slate-400 mb-2.5">{g.label} ({list.length})</h4>
              <div className="space-y-2.5">
                {list.map((a) => {
                  const course = findCourse(courses, a.courseId);
                  const idx = courses.findIndex((c) => c.id === a.courseId);
                  const c = courseColor(idx);
                  return (
                    <Card key={a.id} className="p-4 flex items-center gap-3">
                      <button onClick={() => toggleStatus(a.id)} className="shrink-0 text-slate-300 hover:text-purple-500">
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

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Add assignment">
        <Field label="Title"><input className={inputCls} value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="e.g. Lab Report 3" /></Field>
        <Field label="Course">
          <select className={inputCls} value={form.courseId} onChange={(e) => setForm({ ...form, courseId: e.target.value })}>
            {courses.map((c) => <option key={c.id} value={c.id}>{c.code} – {c.name}</option>)}
          </select>
        </Field>
        <Field label="Due date"><input type="date" className={inputCls} value={form.due} onChange={(e) => setForm({ ...form, due: e.target.value })} /></Field>
        <Field label="Priority">
          <select className={inputCls} value={form.priority} onChange={(e) => setForm({ ...form, priority: e.target.value })}>
            {["High", "Medium", "Low"].map((p) => <option key={p}>{p}</option>)}
          </select>
        </Field>
        <button onClick={addAssignment} className="w-full mt-2 bg-gradient-to-r from-purple-500 to-blue-500 text-white text-sm font-medium py-2.5 rounded-xl hover:opacity-90">Add assignment</button>
      </Modal>
    </div>
  );
}

/* =========================================================================
   ATTENDANCE
   ========================================================================= */
function AttendancePage({ courses, attendance, setAttendance }) {
  function mark(courseId, present) {
    setAttendance(attendance.map((a) => a.courseId === courseId ? { ...a, present: a.present + (present ? 1 : 0), total: a.total + 1 } : a));
  }
  const totalPresent = attendance.reduce((s, a) => s + a.present, 0);
  const totalClasses = attendance.reduce((s, a) => s + a.total, 0);
  const overall = Math.round((totalPresent / totalClasses) * 100);

  return (
    <div>
      <SectionHeader title="Attendance" subtitle="Minimum 75% required to stay exam-eligible" />
      <Card className="p-5 mb-6 flex items-center gap-5">
        <div className={`w-16 h-16 rounded-2xl flex items-center justify-center text-lg font-semibold shrink-0 ${attendanceColor(overall).bg} ${attendanceColor(overall).text}`}>{overall}%</div>
        <div>
          <p style={{ fontFamily: FONT_HEAD }} className="font-semibold text-slate-800">Overall attendance</p>
          <p className="text-sm text-slate-500">{totalPresent} present out of {totalClasses} classes held</p>
        </div>
      </Card>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        {attendance.map((a) => {
          const course = findCourse(courses, a.courseId);
          const idx = courses.findIndex((c) => c.id === a.courseId);
          const c = courseColor(idx);
          const pct = Math.round((a.present / a.total) * 100);
          const tone = attendanceColor(pct);
          return (
            <Card key={a.courseId} className="p-5">
              <div className="flex items-center justify-between mb-2">
                <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${c.chip}`}>{course?.code}</span>
                <span className={`text-sm font-semibold ${tone.text}`}>{pct}%</span>
              </div>
              <p className="text-sm text-slate-600 mb-3 truncate">{course?.name}</p>
              <ProgressBar value={pct} colorClass={tone.bar} />
              <div className="flex items-center justify-between mt-3">
                <span className="text-xs text-slate-400">{a.present}/{a.total} classes</span>
                <div className="flex gap-2">
                  <button onClick={() => mark(a.courseId, true)} className="text-xs font-medium px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-600 hover:bg-emerald-100">Present</button>
                  <button onClick={() => mark(a.courseId, false)} className="text-xs font-medium px-2.5 py-1 rounded-lg bg-rose-50 text-rose-600 hover:bg-rose-100">Absent</button>
                </div>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

/* =========================================================================
   EXAMS
   ========================================================================= */
function ExamsPage({ courses, exams }) {
  const sorted = [...exams].sort((a, b) => new Date(a.date) - new Date(b.date));
  return (
    <div>
      <SectionHeader title="Exams" subtitle="Stay ahead of quizzes, midterms & finals" />
      <div className="space-y-3">
        {sorted.map((e) => {
          const course = findCourse(courses, e.courseId);
          const idx = courses.findIndex((c) => c.id === e.courseId);
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
    </div>
  );
}

/* =========================================================================
   GPA / CGPA CALCULATOR
   ========================================================================= */
function GPACalculatorPage({ semesters, setSemesters }) {
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
  function addSemester() {
    if (!semForm.name || !semForm.gpa || !semForm.credits) return;
    setSemesters([...semesters, { id: "s" + Date.now(), name: semForm.name, gpa: Number(semForm.gpa), credits: Number(semForm.credits) }]);
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
                <select className={inputCls} value={r.grade} onChange={(e) => updateRow(r.id, "grade", e.target.value)}>
                  {GRADES.map((g) => <option key={g}>{g}</option>)}
                </select>
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
          <div className="space-y-2.5 mb-5">
            {semesters.map((s) => (
              <div key={s.id} className="flex items-center justify-between p-3 rounded-xl bg-slate-50">
                <span className="text-sm font-medium text-slate-700">{s.name}</span>
                <span className="text-xs text-slate-400">{s.credits} credits</span>
                <span className="text-sm font-semibold text-purple-600">{Number(s.gpa).toFixed(2)}</span>
              </div>
            ))}
          </div>
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

function NotesPage({ courses, notes, setNotes }) {
  const [filter, setFilter] = useState("all");
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState({ title: "", courseId: courses[0]?.id, type: "PDF" });

  function addNote() {
    if (!form.title) return;
    setNotes([{ id: "n" + Date.now(), ...form, date: "2026-08-23" }, ...notes]);
    setForm({ title: "", courseId: courses[0]?.id, type: "PDF" });
    setModalOpen(false);
  }
  const filtered = filter === "all" ? notes : notes.filter((n) => n.courseId === filter);

  return (
    <div>
      <SectionHeader
        title="Notes & Resources"
        subtitle="Everything you've saved, organized by course"
        action={<button onClick={() => setModalOpen(true)} className="flex items-center gap-1.5 bg-gradient-to-r from-purple-500 to-blue-500 text-white text-sm font-medium px-4 py-2 rounded-xl shadow-sm hover:opacity-90"><Plus size={16} /> Add resource</button>}
      />
      <div className="flex items-center gap-2 mb-5 overflow-x-auto pb-1">
        <button onClick={() => setFilter("all")} className={`text-xs font-medium px-3 py-1.5 rounded-full shrink-0 ${filter === "all" ? "bg-purple-500 text-white" : "bg-slate-100 text-slate-500"}`}>All</button>
        {courses.map((c) => (
          <button key={c.id} onClick={() => setFilter(c.id)} className={`text-xs font-medium px-3 py-1.5 rounded-full shrink-0 ${filter === c.id ? "bg-purple-500 text-white" : "bg-slate-100 text-slate-500"}`}>{c.code}</button>
        ))}
      </div>

      {filtered.length === 0 ? <EmptyState icon={FolderOpen} text="No resources here yet." /> : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
          {filtered.map((n) => {
            const course = findCourse(courses, n.courseId);
            const idx = courses.findIndex((c) => c.id === n.courseId);
            const c = courseColor(idx);
            const Icon = NOTE_ICONS[n.type] || FileText;
            return (
              <Card key={n.id} className="p-5">
                <div className="flex items-start justify-between mb-3">
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${c.bg} ${c.text}`}><Icon size={16} /></div>
                  <button className="text-slate-300 hover:text-purple-500"><Download size={15} /></button>
                </div>
                <p className="text-sm font-medium text-slate-700 leading-snug mb-2">{n.title}</p>
                <div className="flex items-center justify-between text-xs text-slate-400">
                  <span className={`px-2 py-0.5 rounded-full ${c.chip}`}>{course?.code}</span>
                  <span>{formatDate(n.date)}</span>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Add resource">
        <Field label="Title"><input className={inputCls} value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="e.g. Chapter 4 Notes" /></Field>
        <Field label="Course">
          <select className={inputCls} value={form.courseId} onChange={(e) => setForm({ ...form, courseId: e.target.value })}>
            {courses.map((c) => <option key={c.id} value={c.id}>{c.code} – {c.name}</option>)}
          </select>
        </Field>
        <Field label="Type">
          <select className={inputCls} value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}>
            {["PDF", "Slides", "Doc", "Link"].map((t) => <option key={t}>{t}</option>)}
          </select>
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

function NotificationsPage({ notifications, setNotifications }) {
  function markAllRead() { setNotifications(notifications.map((n) => ({ ...n, read: true }))); }
  function toggleRead(id) { setNotifications(notifications.map((n) => n.id === id ? { ...n, read: !n.read } : n)); }

  return (
    <div>
      <SectionHeader
        title="Notifications"
        subtitle={`${notifications.filter((n) => !n.read).length} unread`}
        action={<button onClick={markAllRead} className="text-sm font-medium text-purple-600 hover:underline">Mark all as read</button>}
      />
      <div className="space-y-2.5">
        {notifications.map((n) => {
          const s = NOTIF_STYLE[n.type];
          const Icon = s.icon;
          return (
            <Card key={n.id} className={`p-4 flex items-start gap-3 cursor-pointer ${!n.read ? "border-purple-100" : ""}`} onClick={() => toggleRead(n.id)}>
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${s.tone}`}><Icon size={16} /></div>
              <div className="flex-1 min-w-0">
                <p className={`text-sm ${!n.read ? "font-medium text-slate-800" : "text-slate-500"}`}>{n.message}</p>
                <p className="text-xs text-slate-400 mt-1">{n.time}</p>
              </div>
              {!n.read && <span className="w-2 h-2 rounded-full bg-purple-500 mt-1.5 shrink-0" />}
            </Card>
          );
        })}
      </div>
    </div>
  );
}

/* =========================================================================
   SETTINGS
   ========================================================================= */
function SettingsPage({ profile, setProfile }) {
  const [prefs, setPrefs] = useState({ assignmentReminders: true, examAlerts: true, attendanceAlerts: false });
  const [theme, setTheme] = useState("light");
  const initials = profile.name.split(" ").map((n) => n[0]).join("").slice(0, 2);

  return (
    <div>
      <SectionHeader title="Settings" subtitle="Manage your profile and preferences" />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-5">
          <h3 style={{ fontFamily: FONT_HEAD }} className="font-semibold text-slate-800 mb-4">Profile</h3>
          <div className="flex items-center gap-4 mb-5">
            <div className="w-14 h-14 rounded-full bg-gradient-to-br from-purple-400 to-blue-400 flex items-center justify-center text-white font-semibold text-lg">{initials}</div>
            <div>
              <p className="font-medium text-slate-700">{profile.name}</p>
              <p className="text-xs text-slate-400">{profile.email}</p>
            </div>
          </div>
          <Field label="Full name"><input className={inputCls} value={profile.name} onChange={(e) => setProfile({ ...profile, name: e.target.value })} /></Field>
          <Field label="Email"><input className={inputCls} value={profile.email} onChange={(e) => setProfile({ ...profile, email: e.target.value })} /></Field>
          <Field label="University"><input className={inputCls} value={profile.university} onChange={(e) => setProfile({ ...profile, university: e.target.value })} /></Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Department"><input className={inputCls} value={profile.department} onChange={(e) => setProfile({ ...profile, department: e.target.value })} /></Field>
            <Field label="Current semester"><input className={inputCls} value={profile.semester} onChange={(e) => setProfile({ ...profile, semester: e.target.value })} /></Field>
          </div>
          <button className="w-full mt-2 bg-gradient-to-r from-purple-500 to-blue-500 text-white text-sm font-medium py-2.5 rounded-xl hover:opacity-90">Save changes</button>
        </Card>

        <div className="space-y-6">
          <Card className="p-5">
            <h3 style={{ fontFamily: FONT_HEAD }} className="font-semibold text-slate-800 mb-4">Notification preferences</h3>
            {[
              { key: "assignmentReminders", label: "Assignment reminders" },
              { key: "examAlerts", label: "Exam alerts" },
              { key: "attendanceAlerts", label: "Attendance warnings" },
            ].map((p) => (
              <div key={p.key} className="flex items-center justify-between py-2.5 border-b border-slate-50 last:border-0">
                <span className="text-sm text-slate-600">{p.label}</span>
                <ToggleSwitch checked={prefs[p.key]} onChange={(v) => setPrefs({ ...prefs, [p.key]: v })} />
              </div>
            ))}
          </Card>

          <Card className="p-5">
            <h3 style={{ fontFamily: FONT_HEAD }} className="font-semibold text-slate-800 mb-4">Appearance</h3>
            <div className="flex gap-3">
              {[{ id: "light", label: "Light", icon: Sun }, { id: "dark", label: "Dark", icon: Moon }].map((t) => (
                <button key={t.id} onClick={() => setTheme(t.id)} className={`flex-1 flex flex-col items-center gap-2 py-4 rounded-xl border ${theme === t.id ? "border-purple-300 bg-purple-50 text-purple-600" : "border-slate-100 text-slate-400"}`}>
                  <t.icon size={18} /><span className="text-xs font-medium">{t.label}</span>
                </button>
              ))}
            </div>
            <p className="text-xs text-slate-400 mt-3">Dark mode is coming once the backend theme sync is in place.</p>
          </Card>

          <Card className="p-5">
            <button className="w-full flex items-center justify-center gap-2 text-sm font-medium text-rose-500 py-2.5 rounded-xl hover:bg-rose-50"><LogOut size={16} /> Log out</button>
          </Card>
        </div>
      </div>
    </div>
  );
}

/* =========================================================================
   ROOT APP
   ========================================================================= */
export default function App() {
  const [active, setActive] = useState("dashboard");
  const [mobileOpen, setMobileOpen] = useState(false);

  const [courses, setCourses] = useState(api.getCourses());
  const [timetable] = useState(api.getTimetable());
  const [assignments, setAssignments] = useState(api.getAssignments());
  const [attendance, setAttendance] = useState(api.getAttendance());
  const [exams] = useState(api.getExams());
  const [notes, setNotes] = useState(api.getNotes());
  const [notifications, setNotifications] = useState(api.getNotifications());
  const [semesters, setSemesters] = useState(api.getSemesters());
  const [profile, setProfile] = useState(api.getProfile());

  const unreadCount = notifications.filter((n) => !n.read).length;

  const pages = {
    dashboard: <DashboardPage courses={courses} assignments={assignments} attendance={attendance} exams={exams} profile={profile} setActive={setActive} />,
    courses: <CoursesPage courses={courses} setCourses={setCourses} />,
    timetable: <TimetablePage courses={courses} timetable={timetable} />,
    assignments: <AssignmentsPage courses={courses} assignments={assignments} setAssignments={setAssignments} />,
    attendance: <AttendancePage courses={courses} attendance={attendance} setAttendance={setAttendance} />,
    exams: <ExamsPage courses={courses} exams={exams} />,
    gpa: <GPACalculatorPage semesters={semesters} setSemesters={setSemesters} />,
    notes: <NotesPage courses={courses} notes={notes} setNotes={setNotes} />,
    notifications: <NotificationsPage notifications={notifications} setNotifications={setNotifications} />,
    settings: <SettingsPage profile={profile} setProfile={setProfile} />,
  };

  return (
    <div style={{ fontFamily: FONT_BODY }} className="flex h-screen bg-slate-50 text-slate-700">
      <Sidebar active={active} setActive={setActive} mobileOpen={mobileOpen} setMobileOpen={setMobileOpen} unreadCount={unreadCount} />
      <div className="flex-1 flex flex-col min-w-0">
        <Topbar setMobileOpen={setMobileOpen} profile={profile} unreadCount={unreadCount} setActive={setActive} />
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          {pages[active]}
        </main>
      </div>
    </div>
  );
}
