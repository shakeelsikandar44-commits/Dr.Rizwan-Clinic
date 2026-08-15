import React, { useState, useEffect, useCallback } from "react";
import {
  MapPin, Clock, Mail, Lock, User, LogOut, CheckCircle2, AlertCircle,
  Stethoscope, ChevronRight, ChevronLeft, Eye, EyeOff, Sparkles,
  CalendarCheck, ClipboardList, ShieldCheck, RefreshCcw, Home as HomeIcon
} from "lucide-react";

/* ---------------------------------------------------------
   Dr. Rizwan Siddqi — Clinic Appointment App (prototype)
   Single-file React demo. Data is simulated with
   window.storage (in-browser), since a real production
   backend (DB, password hashing, real email delivery)
   needs actual server infrastructure this artifact can't
   provision. See the "Demo mode" notes in the UI.
--------------------------------------------------------- */

const CLINIC = {
  name: "Dr. Rizwan Siddqi",
  timings: [
    { label: "Afternoon", value: "12:30 PM – 04:00 PM" },
    { label: "Evening", value: "07:30 PM – 11:00 PM" },
  ],
  address: "Laiq Ali Chowk, Near Park Area, POFs, Wah Cantt",
  mapUrl:
    "https://www.google.com/maps/search/?api=1&query=" +
    encodeURIComponent("Laiq Ali Chowk, Near Park Area, POFs, Wah Cantt"),
};

const FONT_IMPORT = `
@import url('https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,400;0,9..144,600;0,9..144,700;1,9..144,500&family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@500;700&display=swap');
`;

function genCode() {
  return String(Math.floor(100000 + Math.random() * 900000));
}
function todayStr() {
  return new Date().toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}
function formatVisitDate(isoDate) {
  if (!isoDate) return "";
  const d = new Date(isoDate + "T00:00:00");
  return d.toLocaleDateString("en-GB", {
    weekday: "short",
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}
function isoToday() {
  const d = new Date();
  return d.toISOString().slice(0, 10);
}
function storeGet(key) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}
function storeSet(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* ignore in demo */
  }
}

function Toast({ toast }) {
  if (!toast) return null;
  const isErr = toast.type === "error";
  return (
    <div
      className={
        "fixed left-1/2 -translate-x-1/2 top-4 z-50 max-w-[340px] w-[92%] rounded-xl px-4 py-3 shadow-lg border flex items-start gap-2 " +
        (isErr
          ? "bg-rose-50 border-rose-200 text-rose-800"
          : "bg-emerald-50 border-emerald-200 text-emerald-800")
      }
    >
      {isErr ? (
        <AlertCircle size={18} className="mt-0.5 shrink-0" />
      ) : (
        <CheckCircle2 size={18} className="mt-0.5 shrink-0" />
      )}
      <span className="text-sm leading-snug" style={{ fontFamily: "Inter, sans-serif" }}>
        {toast.msg}
      </span>
    </div>
  );
}

function PulseDivider() {
  return (
    <svg width="140" height="24" viewBox="0 0 140 24" className="mx-auto">
      <polyline
        points="0,12 30,12 40,2 50,22 60,12 90,12 98,4 106,20 114,12 140,12"
        fill="none"
        stroke="#0d9488"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="ekg-line"
      />
    </svg>
  );
}

function TopBar({ title, onBack }) {
  return (
    <div className="flex items-center gap-2 px-5 pt-5 pb-2">
      {onBack && (
        <button
          onClick={onBack}
          className="w-9 h-9 rounded-full bg-white border border-slate-200 flex items-center justify-center text-slate-600 active:scale-95 transition"
        >
          <ChevronLeft size={18} />
        </button>
      )}
      <h1
        className="text-slate-800 text-lg font-semibold"
        style={{ fontFamily: "Inter, sans-serif" }}
      >
        {title}
      </h1>
    </div>
  );
}

function Field({ icon: Icon, ...props }) {
  return (
    <div className="relative">
      <Icon size={17} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-teal-600" />
      <input
        {...props}
        className="w-full bg-white border border-slate-200 rounded-xl pl-10 pr-3 py-3 text-sm text-slate-800 placeholder-slate-400 outline-none focus:ring-2 focus:ring-teal-500/40 focus:border-teal-500 transition"
        style={{ fontFamily: "Inter, sans-serif" }}
      />
    </div>
  );
}

function PrimaryButton({ children, ...props }) {
  return (
    <button
      {...props}
      className="w-full bg-teal-700 hover:bg-teal-800 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium rounded-xl py-3.5 flex items-center justify-center gap-1.5 active:scale-[0.98] transition shadow-sm shadow-teal-700/20"
      style={{ fontFamily: "Inter, sans-serif" }}
    >
      {children}
    </button>
  );
}

function GhostButton({ children, ...props }) {
  return (
    <button
      {...props}
      className="w-full bg-white border border-slate-200 hover:border-teal-300 text-slate-700 font-medium rounded-xl py-3 flex items-center justify-center gap-1.5 active:scale-[0.98] transition"
      style={{ fontFamily: "Inter, sans-serif" }}
    >
      {children}
    </button>
  );
}

function Frame({ children }) {
  return (
    <div className="min-h-full w-full flex items-start justify-center py-6 px-3">
      <div className="w-full max-w-[380px] bg-gradient-to-b from-sky-50 to-white rounded-[2rem] shadow-xl border border-slate-200 min-h-[720px] overflow-hidden relative">
        {children}
      </div>
    </div>
  );
}

export default function App() {
  const [view, setView] = useState("home");
  const [history, setHistory] = useState([]);
  const [toast, setToast] = useState(null);
  const [users, setUsers] = useState({});
  const [session, setSession] = useState(null); // logged-in email
  const [appointments, setAppointments] = useState([]);
  const [lastBooked, setLastBooked] = useState(null);
  const [loading, setLoading] = useState(true);

  // booking form state
  const [bookingType, setBookingType] = useState(null); // "consultation" | "special"
  const [patientName, setPatientName] = useState("");
  const [patientAge, setPatientAge] = useState("");
  const [visitDate, setVisitDate] = useState("");
  const [visitSlot, setVisitSlot] = useState("");

  // signup flow state
  const [signupEmail, setSignupEmail] = useState("");
  const [signupName, setSignupName] = useState("");
  const [sentCode, setSentCode] = useState("");
  const [codeInput, setCodeInput] = useState("");
  const [pw1, setPw1] = useState("");
  const [pw2, setPw2] = useState("");
  const [showPw, setShowPw] = useState(false);

  // login flow
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPw, setLoginPw] = useState("");

  // forgot password flow
  const [forgotEmail, setForgotEmail] = useState("");
  const [forgotCode, setForgotCode] = useState("");
  const [forgotStage, setForgotStage] = useState("email"); // email -> code -> newpw
  const [forgotInput, setForgotInput] = useState("");
  const [newPw1, setNewPw1] = useState("");
  const [newPw2, setNewPw2] = useState("");

  const showToast = useCallback((msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3200);
  }, []);

  const go = (v) => {
    setHistory((h) => [...h, view]);
    setView(v);
  };
  const back = () => {
    setHistory((h) => {
      const copy = [...h];
      const prev = copy.pop();
      setView(prev || "home");
      return copy;
    });
  };

  // initial load
  useEffect(() => {
    const u = storeGet("clinic:users") || {};
    setUsers(u);
    setLoading(false);
  }, []);

  const loadAppointments = useCallback((email) => {
    const list = storeGet("clinic:appointments:" + email) || [];
    setAppointments(list);
  }, []);

  // ---------- signup ----------
  const startSignup = () => {
    setSignupEmail("");
    setSignupName("");
    setCodeInput("");
    setPw1("");
    setPw2("");
    go("signup");
  };

  const sendVerification = async () => {
    if (!signupName.trim()) return showToast("Please enter your full name.", "error");
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(signupEmail))
      return showToast("Please enter a valid email address.", "error");
    if (users[signupEmail]) return showToast("An account with this email already exists.", "error");
    const code = genCode();
    setSentCode(code);
    go("verify");
    showToast(`Demo mode: no real inbox here, so your verification code is ${code}`, "success");
  };

  const confirmCode = () => {
    if (codeInput.trim() !== sentCode) {
      return showToast("Incorrect verification code. Please try again.", "error");
    }
    showToast("Email verified.", "success");
    go("setpassword");
  };

  const createAccount = async () => {
    if (pw1.length < 6) return showToast("Password should be at least 6 characters.", "error");
    if (pw1 !== pw2) {
      return showToast("Passwords do not match. Please enter the same password in both fields.", "error");
    }
    const updated = { ...users, [signupEmail]: { name: signupName, password: pw1 } };
    setUsers(updated);
    storeSet("clinic:users", updated);
    showToast("Account created successfully.", "success");
    setSession(signupEmail);
    loadAppointments(signupEmail);
    setHistory([]);
    setView("dashboard");
  };

  // ---------- login ----------
  const doLogin = async () => {
    const u = users[loginEmail];
    if (!u || u.password !== loginPw) {
      return showToast("Incorrect email or password.", "error");
    }
    setSession(loginEmail);
    loadAppointments(loginEmail);
    showToast(`Welcome back, ${u.name.split(" ")[0]}.`, "success");
    setHistory([]);
    setView("dashboard");
  };

  const doLogout = () => {
    setSession(null);
    setAppointments([]);
    setHistory([]);
    setView("home");
    showToast("You have been logged out.", "success");
  };

  // ---------- forgot password ----------
  const forgotSendCode = () => {
    if (!users[forgotEmail]) return showToast("No account found with this email.", "error");
    const code = genCode();
    setForgotCode(code);
    setForgotStage("code");
    showToast(`Demo mode: your password reset code is ${code}`, "success");
  };
  const forgotVerify = () => {
    if (forgotInput.trim() !== forgotCode) return showToast("Incorrect reset code.", "error");
    setForgotStage("newpw");
  };
  const forgotReset = async () => {
    if (newPw1.length < 6) return showToast("Password should be at least 6 characters.", "error");
    if (newPw1 !== newPw2) return showToast("Passwords do not match. Please enter the same password in both fields.", "error");
    const updated = { ...users, [forgotEmail]: { ...users[forgotEmail], password: newPw1 } };
    setUsers(updated);
    storeSet("clinic:users", updated);
    showToast("Password reset successfully. Please log in.", "success");
    setForgotStage("email");
    setForgotEmail("");
    setForgotInput("");
    setNewPw1("");
    setNewPw2("");
    setHistory([]);
    setView("login");
  };

  // ---------- booking ----------
  const openBookingForm = (type) => {
    setBookingType(type);
    setPatientName("");
    setPatientAge("");
    setVisitDate("");
    setVisitSlot("");
    go("bookingForm");
  };

  const submitBooking = async () => {
    if (!patientName.trim()) return showToast("Please enter the patient's name.", "error");
    const ageNum = Number(patientAge);
    if (!patientAge || isNaN(ageNum) || ageNum <= 0 || ageNum > 120) {
      return showToast("Please enter a valid age.", "error");
    }
    if (!visitDate) return showToast("Please select a visit date.", "error");
    if (!visitSlot) return showToast("Please select a visit time.", "error");

    let record;
    if (bookingType === "special") {
      // shared, global counter so numbers stay sequential across everyone using the app
      const counterState = storeGet("clinic:special-counter") || { count: 0 };
      const nextCount = counterState.count + 1;
      storeSet("clinic:special-counter", { count: nextCount });
      const number = "Spe-" + String(nextCount).padStart(3, "0");
      record = {
        id: number,
        type: "Special Appointment",
        fee: "PKR 1,000",
        status: "Confirmed",
        date: todayStr(),
        visitDate: formatVisitDate(visitDate),
        visitSlot,
        patient: patientName.trim(),
        age: ageNum,
        email: session,
      };
    } else {
      record = {
        id: "CON-" + Date.now().toString().slice(-6),
        type: "Doctor Consultation",
        fee: "PKR 500",
        status: "Confirmed",
        date: todayStr(),
        visitDate: formatVisitDate(visitDate),
        visitSlot,
        patient: patientName.trim(),
        age: ageNum,
        email: session,
      };
    }

    const list = [record, ...appointments];
    setAppointments(list);
    storeSet("clinic:appointments:" + session, list);
    setLastBooked(record);
    showToast("Appointment booked successfully.", "success");
    setHistory([]);
    setView("confirm");
  };

  // ---------------- VIEWS ----------------

  const HomeView = (
    <div className="flex flex-col h-full pb-8">
      <div className="px-6 pt-10 pb-6 text-center">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-teal-700 text-white mb-4 shadow-md shadow-teal-700/30">
          <Stethoscope size={26} />
        </div>
        <h1
          className="doctor-name text-3xl text-slate-800 mb-1"
          style={{ fontFamily: "Fraunces, serif", fontWeight: 600 }}
        >
          {CLINIC.name}
        </h1>
        <p className="text-teal-700 text-xs tracking-wide uppercase" style={{ fontFamily: "Inter, sans-serif" }}>
          General &amp; Special Consultations
        </p>
        <div className="mt-3">
          <PulseDivider />
        </div>
      </div>

      <div className="px-5 space-y-3 flex-1">
        <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm">
          <div className="flex items-center gap-2 text-slate-800 mb-3">
            <Clock size={16} className="text-teal-700" />
            <span className="text-sm font-semibold" style={{ fontFamily: "Inter, sans-serif" }}>
              Clinic Timings
            </span>
          </div>
          <div className="space-y-2">
            {CLINIC.timings.map((t) => (
              <div key={t.label} className="flex items-center justify-between text-sm">
                <span className="text-slate-500" style={{ fontFamily: "Inter, sans-serif" }}>
                  {t.label}
                </span>
                <span className="text-slate-800 font-medium" style={{ fontFamily: "Inter, sans-serif" }}>
                  {t.value}
                </span>
              </div>
            ))}
          </div>
        </div>

        <a
          href={CLINIC.mapUrl}
          target="_blank"
          rel="noreferrer"
          className="block bg-white rounded-2xl border border-slate-200 p-4 shadow-sm active:scale-[0.98] transition"
        >
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-50 flex items-center justify-center shrink-0">
              <MapPin size={17} className="text-emerald-600" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold text-slate-800" style={{ fontFamily: "Inter, sans-serif" }}>
                Clinic Location
              </p>
              <p className="text-xs text-slate-500 mt-0.5 leading-snug" style={{ fontFamily: "Inter, sans-serif" }}>
                {CLINIC.address}
              </p>
              <p className="text-xs text-teal-700 mt-1.5 font-medium" style={{ fontFamily: "Inter, sans-serif" }}>
                Open in Maps →
              </p>
            </div>
          </div>
        </a>
      </div>

      <div className="px-5 mt-4 space-y-2.5">
        <PrimaryButton onClick={() => (session ? setView("dashboard") : startSignup())}>
          {session ? "Go to Dashboard" : "Get Started / Book Appointment"}
          <ChevronRight size={17} />
        </PrimaryButton>
        {!session && (
          <GhostButton onClick={() => go("login")}>
            <User size={16} /> I already have an account
          </GhostButton>
        )}
      </div>
    </div>
  );

  const SignupView = (
    <div className="px-6 pt-2 pb-8">
      <TopBar title="Create Account" onBack={back} />
      <p className="text-xs text-slate-500 px-0.5 mb-5" style={{ fontFamily: "Inter, sans-serif" }}>
        Enter your details to get a verification code by email.
      </p>
      <div className="space-y-3">
        <Field icon={User} placeholder="Full name" value={signupName} onChange={(e) => setSignupName(e.target.value)} />
        <Field icon={Mail} placeholder="Email address" type="email" value={signupEmail} onChange={(e) => setSignupEmail(e.target.value)} />
      </div>
      <div className="mt-6">
        <PrimaryButton onClick={sendVerification}>
          Send Verification Code <ChevronRight size={17} />
        </PrimaryButton>
      </div>
    </div>
  );

  const VerifyView = (
    <div className="px-6 pt-2 pb-8">
      <TopBar title="Verify Your Email" onBack={back} />
      <p className="text-xs text-slate-500 px-0.5 mb-5" style={{ fontFamily: "Inter, sans-serif" }}>
        We sent a 6-digit code to <span className="font-medium text-slate-700">{signupEmail}</span>.
      </p>
      <Field icon={ShieldCheck} placeholder="Enter verification code" value={codeInput} onChange={(e) => setCodeInput(e.target.value)} />
      <div className="mt-6">
        <PrimaryButton onClick={confirmCode}>
          Verify Code <ChevronRight size={17} />
        </PrimaryButton>
      </div>
      <button
        onClick={sendVerification}
        className="w-full text-center text-xs text-teal-700 font-medium mt-4"
        style={{ fontFamily: "Inter, sans-serif" }}
      >
        Resend code
      </button>
    </div>
  );

  const SetPasswordView = (
    <div className="px-6 pt-2 pb-8">
      <TopBar title="Create Password" onBack={back} />
      <p className="text-xs text-slate-500 px-0.5 mb-5" style={{ fontFamily: "Inter, sans-serif" }}>
        Choose a password with at least 6 characters.
      </p>
      <div className="space-y-3">
        <div className="relative">
          <Field
            icon={Lock}
            placeholder="Password"
            type={showPw ? "text" : "password"}
            value={pw1}
            onChange={(e) => setPw1(e.target.value)}
          />
          <button
            onClick={() => setShowPw((s) => !s)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
          >
            {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        </div>
        <Field
          icon={Lock}
          placeholder="Confirm password"
          type={showPw ? "text" : "password"}
          value={pw2}
          onChange={(e) => setPw2(e.target.value)}
        />
      </div>
      <div className="mt-6">
        <PrimaryButton onClick={createAccount}>
          Create Account <ChevronRight size={17} />
        </PrimaryButton>
      </div>
    </div>
  );

  const LoginView = (
    <div className="px-6 pt-2 pb-8">
      <TopBar title="Log In" onBack={back} />
      <div className="space-y-3 mt-4">
        <Field icon={Mail} placeholder="Email address" type="email" value={loginEmail} onChange={(e) => setLoginEmail(e.target.value)} />
        <Field icon={Lock} placeholder="Password" type="password" value={loginPw} onChange={(e) => setLoginPw(e.target.value)} />
      </div>
      <button
        onClick={() => {
          setForgotStage("email");
          go("forgot");
        }}
        className="text-xs text-teal-700 font-medium mt-2.5 block"
        style={{ fontFamily: "Inter, sans-serif" }}
      >
        Forgot password?
      </button>
      <div className="mt-6">
        <PrimaryButton onClick={doLogin}>
          Log In <ChevronRight size={17} />
        </PrimaryButton>
      </div>
      <button
        onClick={startSignup}
        className="w-full text-center text-xs text-slate-500 mt-4"
        style={{ fontFamily: "Inter, sans-serif" }}
      >
        Don't have an account? <span className="text-teal-700 font-medium">Sign up</span>
      </button>
    </div>
  );

  const ForgotView = (
    <div className="px-6 pt-2 pb-8">
      <TopBar title="Reset Password" onBack={back} />
      {forgotStage === "email" && (
        <>
          <p className="text-xs text-slate-500 px-0.5 mb-5" style={{ fontFamily: "Inter, sans-serif" }}>
            Enter your account email to receive a reset code.
          </p>
          <Field icon={Mail} placeholder="Email address" type="email" value={forgotEmail} onChange={(e) => setForgotEmail(e.target.value)} />
          <div className="mt-6">
            <PrimaryButton onClick={forgotSendCode}>Send Reset Code</PrimaryButton>
          </div>
        </>
      )}
      {forgotStage === "code" && (
        <>
          <p className="text-xs text-slate-500 px-0.5 mb-5" style={{ fontFamily: "Inter, sans-serif" }}>
            Enter the code sent to {forgotEmail}.
          </p>
          <Field icon={ShieldCheck} placeholder="Reset code" value={forgotInput} onChange={(e) => setForgotInput(e.target.value)} />
          <div className="mt-6">
            <PrimaryButton onClick={forgotVerify}>Verify Code</PrimaryButton>
          </div>
        </>
      )}
      {forgotStage === "newpw" && (
        <>
          <div className="space-y-3">
            <Field icon={Lock} placeholder="New password" type="password" value={newPw1} onChange={(e) => setNewPw1(e.target.value)} />
            <Field icon={Lock} placeholder="Confirm new password" type="password" value={newPw2} onChange={(e) => setNewPw2(e.target.value)} />
          </div>
          <div className="mt-6">
            <PrimaryButton onClick={forgotReset}>Reset Password</PrimaryButton>
          </div>
        </>
      )}
    </div>
  );

  const DashboardView = session && (
    <div className="px-5 pt-6 pb-8">
      <div className="flex items-center justify-between mb-5">
        <div>
          <p className="text-xs text-slate-500" style={{ fontFamily: "Inter, sans-serif" }}>
            Welcome to
          </p>
          <p className="text-base font-semibold text-slate-800" style={{ fontFamily: "Fraunces, serif" }}>
            {CLINIC.name} Clinic
          </p>
        </div>
        <button
          onClick={() => go("profile")}
          className="w-10 h-10 rounded-full bg-teal-700 text-white flex items-center justify-center text-sm font-semibold"
        >
          {users[session]?.name?.[0]?.toUpperCase() || "U"}
        </button>
      </div>

      <p className="text-sm text-slate-600 mb-3" style={{ fontFamily: "Inter, sans-serif" }}>
        Hi {users[session]?.name?.split(" ")[0]}, choose an appointment type below.
      </p>

      <div className="space-y-3">
        <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm">
          <div className="flex items-center gap-2 mb-1">
            <Stethoscope size={16} className="text-teal-700" />
            <span className="text-sm font-semibold text-slate-800" style={{ fontFamily: "Inter, sans-serif" }}>
              Doctor Consultation
            </span>
          </div>
          <p className="text-xs text-slate-500 mb-3" style={{ fontFamily: "Inter, sans-serif" }}>
            Consultation Fee: <span className="font-semibold text-slate-700">PKR 500</span>
          </p>
          <PrimaryButton onClick={() => openBookingForm("consultation")}>Book Consultation</PrimaryButton>
        </div>

        <div className="bg-white rounded-2xl border border-amber-200 p-4 shadow-sm relative overflow-hidden">
          <span className="absolute top-3 right-3 text-[10px] font-semibold bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full" style={{ fontFamily: "Inter, sans-serif" }}>
            Priority
          </span>
          <div className="flex items-center gap-2 mb-1">
            <Sparkles size={16} className="text-amber-500" />
            <span className="text-sm font-semibold text-slate-800" style={{ fontFamily: "Inter, sans-serif" }}>
              Special Appointment
            </span>
          </div>
          <p className="text-xs text-slate-500 mb-3" style={{ fontFamily: "Inter, sans-serif" }}>
            Special Appointment Fee: <span className="font-semibold text-slate-700">PKR 1,000</span>
          </p>
          <button
            onClick={() => openBookingForm("special")}
            className="w-full bg-amber-500 hover:bg-amber-600 text-white font-medium rounded-xl py-3.5 flex items-center justify-center gap-1.5 active:scale-[0.98] transition"
            style={{ fontFamily: "Inter, sans-serif" }}
          >
            Book Special Appointment
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2.5 mt-5">
        <GhostButton onClick={() => go("appointments")}>
          <ClipboardList size={15} /> My Appointments
        </GhostButton>
        <GhostButton onClick={() => setView("home")}>
          <HomeIcon size={15} /> Home
        </GhostButton>
      </div>
    </div>
  );

  const BookingFormView = (
    <div className="px-6 pt-2 pb-8">
      <TopBar
        title={bookingType === "special" ? "Special Appointment" : "Doctor Consultation"}
        onBack={back}
      />
      <p className="text-xs text-slate-500 px-0.5 mb-5" style={{ fontFamily: "Inter, sans-serif" }}>
        Enter the patient's details for this appointment.
      </p>
      <div className="space-y-3">
        <Field
          icon={User}
          placeholder="Patient name"
          value={patientName}
          onChange={(e) => setPatientName(e.target.value)}
        />
        <Field
          icon={ClipboardList}
          placeholder="Patient age"
          type="number"
          min="1"
          max="120"
          value={patientAge}
          onChange={(e) => setPatientAge(e.target.value)}
        />
        <div className="relative">
          <CalendarCheck size={17} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-teal-600 pointer-events-none" />
          <input
            type="date"
            min={isoToday()}
            value={visitDate}
            onChange={(e) => setVisitDate(e.target.value)}
            className="w-full bg-white border border-slate-200 rounded-xl pl-10 pr-3 py-3 text-sm text-slate-800 outline-none focus:ring-2 focus:ring-teal-500/40 focus:border-teal-500 transition"
            style={{ fontFamily: "Inter, sans-serif" }}
          />
        </div>
        <div className="relative">
          <Clock size={17} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-teal-600 pointer-events-none z-10" />
          <select
            value={visitSlot}
            onChange={(e) => setVisitSlot(e.target.value)}
            className="w-full bg-white border border-slate-200 rounded-xl pl-10 pr-3 py-3 text-sm text-slate-800 outline-none focus:ring-2 focus:ring-teal-500/40 focus:border-teal-500 transition appearance-none"
            style={{ fontFamily: "Inter, sans-serif" }}
          >
            <option value="" disabled>
              Select a time slot
            </option>
            {CLINIC.timings.map((t) => (
              <option key={t.label} value={`${t.label} · ${t.value}`}>
                {t.label} · {t.value}
              </option>
            ))}
          </select>
        </div>
      </div>
      <div className="mt-6">
        <PrimaryButton onClick={submitBooking}>
          Confirm Booking <ChevronRight size={17} />
        </PrimaryButton>
      </div>
    </div>
  );

  const ConfirmView = lastBooked && (
    <div className="px-6 pt-6 pb-8">
      <div className="text-center mb-4">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-emerald-100 text-emerald-600 mb-3">
          <CheckCircle2 size={28} />
        </div>
        <h2 className="text-lg font-semibold text-slate-800" style={{ fontFamily: "Inter, sans-serif" }}>
          Appointment Confirmed
        </h2>
      </div>

      {lastBooked.type === "Special Appointment" && (
        <div className="bg-amber-50 border border-dashed border-amber-300 rounded-2xl p-4 text-center mb-4">
          <p className="text-[11px] text-amber-700 uppercase tracking-wide mb-1" style={{ fontFamily: "Inter, sans-serif" }}>
            Your Special Appointment Number
          </p>
          <p className="text-2xl text-amber-700" style={{ fontFamily: "JetBrains Mono, monospace", fontWeight: 700 }}>
            {lastBooked.id}
          </p>
        </div>
      )}

      <div className="bg-white rounded-2xl border border-slate-200 divide-y divide-slate-100 overflow-hidden">
        {[
          ["Patient Name", lastBooked.patient],
          ["Patient Age", lastBooked.age],
          ["Appointment Type", lastBooked.type],
          ["Fee", lastBooked.fee],
          ["Appointment No.", lastBooked.id],
          ["Visit Date", lastBooked.visitDate],
          ["Visit Time", lastBooked.visitSlot],
          ["Clinic Location", CLINIC.address],
          ["Booking Date", lastBooked.date],
          ["Status", lastBooked.status],
        ].map(([k, v]) => (
          <div key={k} className="flex items-start justify-between gap-3 px-4 py-2.5">
            <span className="text-xs text-slate-500 shrink-0" style={{ fontFamily: "Inter, sans-serif" }}>
              {k}
            </span>
            <span className="text-xs text-slate-800 font-medium text-right" style={{ fontFamily: "Inter, sans-serif" }}>
              {v}
            </span>
          </div>
        ))}
      </div>

      <p className="text-[11px] text-slate-400 text-center mt-3" style={{ fontFamily: "Inter, sans-serif" }}>
        A confirmation email would be sent to {lastBooked.email} in production.
      </p>

      <div className="mt-5 space-y-2.5">
        <PrimaryButton onClick={() => setView("dashboard")}>Back to Dashboard</PrimaryButton>
        <GhostButton onClick={() => go("appointments")}>
          <ClipboardList size={15} /> View My Appointments
        </GhostButton>
      </div>
    </div>
  );

  const AppointmentsView = (
    <div className="px-6 pt-2 pb-8">
      <TopBar title="My Appointments" onBack={back} />
      {appointments.length === 0 ? (
        <p className="text-sm text-slate-500 text-center mt-10" style={{ fontFamily: "Inter, sans-serif" }}>
          No appointments booked yet.
        </p>
      ) : (
        <div className="space-y-2.5 mt-3">
          {appointments.map((a) => (
            <div key={a.id + a.date} className="bg-white rounded-2xl border border-slate-200 p-4">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-sm font-semibold text-slate-800" style={{ fontFamily: "Inter, sans-serif" }}>
                  {a.type}
                </span>
                <span className="text-[10px] bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-full font-medium" style={{ fontFamily: "Inter, sans-serif" }}>
                  {a.status}
                </span>
              </div>
              <p className="text-xs text-slate-500" style={{ fontFamily: "Inter, sans-serif" }}>
                {a.id} · {a.fee}
              </p>
              {a.visitDate && (
                <p className="text-xs text-teal-700 mt-0.5 font-medium" style={{ fontFamily: "Inter, sans-serif" }}>
                  {a.visitDate} · {a.visitSlot}
                </p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );

  const ProfileView = session && (
    <div className="px-6 pt-2 pb-8">
      <TopBar title="My Profile" onBack={back} />
      <div className="flex flex-col items-center mt-4 mb-6">
        <div className="w-16 h-16 rounded-full bg-teal-700 text-white flex items-center justify-center text-xl font-semibold mb-2">
          {users[session]?.name?.[0]?.toUpperCase()}
        </div>
        <p className="text-sm font-semibold text-slate-800" style={{ fontFamily: "Inter, sans-serif" }}>
          {users[session]?.name}
        </p>
        <p className="text-xs text-slate-500" style={{ fontFamily: "Inter, sans-serif" }}>
          {session}
        </p>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 divide-y divide-slate-100 overflow-hidden mb-4">
        <div className="flex items-center gap-3 px-4 py-3">
          <Clock size={15} className="text-teal-700" />
          <div className="text-xs text-slate-600" style={{ fontFamily: "Inter, sans-serif" }}>
            {CLINIC.timings.map((t) => t.value).join(" · ")}
          </div>
        </div>
        <div className="flex items-center gap-3 px-4 py-3">
          <MapPin size={15} className="text-teal-700" />
          <div className="text-xs text-slate-600" style={{ fontFamily: "Inter, sans-serif" }}>
            {CLINIC.address}
          </div>
        </div>
        <div className="flex items-center gap-3 px-4 py-3">
          <ClipboardList size={15} className="text-teal-700" />
          <div className="text-xs text-slate-600" style={{ fontFamily: "Inter, sans-serif" }}>
            {appointments.length} appointment{appointments.length !== 1 ? "s" : ""} booked
          </div>
        </div>
      </div>

      <div className="space-y-2.5">
        <GhostButton
          onClick={() => {
            setForgotEmail(session);
            setForgotStage("email");
            go("forgot");
          }}
        >
          <RefreshCcw size={15} /> Change Password
        </GhostButton>
        <button
          onClick={doLogout}
          className="w-full bg-rose-50 border border-rose-200 text-rose-600 font-medium rounded-xl py-3 flex items-center justify-center gap-1.5 active:scale-[0.98] transition"
          style={{ fontFamily: "Inter, sans-serif" }}
        >
          <LogOut size={15} /> Log Out
        </button>
      </div>
    </div>
  );

  const viewMap = {
    home: HomeView,
    signup: SignupView,
    verify: VerifyView,
    setpassword: SetPasswordView,
    login: LoginView,
    forgot: ForgotView,
    dashboard: DashboardView,
    bookingForm: BookingFormView,
    confirm: ConfirmView,
    appointments: AppointmentsView,
    profile: ProfileView,
  };

  return (
    <div className="min-h-screen w-full bg-slate-100">
      <style>{`
        ${FONT_IMPORT}
        @keyframes glowPulse {
          0%   { text-shadow: 0 0 0px rgba(13,148,136,0); }
          40%  { text-shadow: 0 0 16px rgba(13,148,136,0.55), 0 0 2px rgba(13,148,136,0.4); }
          60%  { text-shadow: 0 0 16px rgba(13,148,136,0.55), 0 0 2px rgba(13,148,136,0.4); }
          100% { text-shadow: 0 0 0px rgba(13,148,136,0); }
        }
        .doctor-name {
          animation: glowPulse 4s ease-in-out infinite;
        }
        @keyframes ekgDraw {
          0% { stroke-dashoffset: 300; opacity: 0.3; }
          50% { stroke-dashoffset: 0; opacity: 1; }
          100% { stroke-dashoffset: -300; opacity: 0.3; }
        }
        .ekg-line {
          stroke-dasharray: 300;
          animation: ekgDraw 4s linear infinite;
        }
        @media (prefers-reduced-motion: reduce) {
          .doctor-name, .ekg-line { animation: none; }
        }
      `}</style>
      <Toast toast={toast} />
      <Frame>{loading ? (
        <div className="flex items-center justify-center h-[720px] text-slate-400 text-sm" style={{ fontFamily: "Inter, sans-serif" }}>
          Loading clinic…
        </div>
      ) : (
        viewMap[view]
      )}</Frame>
    </div>
  );
}
