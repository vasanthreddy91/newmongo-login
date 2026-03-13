const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const session = require("express-session");

const app = express();

/* -------------------- MIDDLEWARE -------------------- */
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

app.set("trust proxy", 1);

app.use(
  session({
    secret: "hrms-secret-key",
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      sameSite: "lax",
      secure: false, // must be false for localhost http
      maxAge: 1000 * 60 * 60 * 6 // 6 hours
    }
  })
);

/* -------------------- DB -------------------- */
/**
 * ✅ IMPORTANT FIX FOR KUBERNETES:
 * In Kubernetes, Mongo runs in another pod, so NEVER use localhost.
 * Use the service name: "mongo" (from mongo.yaml service name)
 */
const MONGO_URL = process.env.MONGO_URL || "mongodb://mongo:27017/loginDB";

mongoose
  .connect(MONGO_URL, {
    serverSelectionTimeoutMS: 5000
  })
  .then(() => console.log("✅ MongoDB connected:", MONGO_URL))
  .catch(err => console.log("❌ MongoDB connection error:", err));

/* -------------------- MODELS -------------------- */
const User = mongoose.model("User", { username: String, password: String });

const Event = mongoose.model("Event", {
  title: String,
  date: String, // YYYY-MM-DD
  user: String
});

const Attendance = mongoose.model("Attendance", {
  user: String,
  date: String, // YYYY-MM-DD
  status: String // Present/Absent/WFH
});

/* ✅ Employee model */
const Employee = mongoose.model("Employee", {
  empId: String,
  name: String,
  gender: String,
  dob: String,
  email: String,
  phone: String,
  department: String,
  role: String,
  joiningDate: String,
  manager: String,
  status: String, // Active/Inactive
  address: {
    city: String,
    state: String,
    pincode: String
  },
  bank: {
    bankName: String,
    ifsc: String,
    accountNo: String
  },
  salary: {
    basic: Number,
    hra: Number,
    allowances: Number,
    deductions: Number,
    net: Number
  }
});

/* ✅ Leave model */
const Leave = mongoose.model("Leave", {
  user: String,
  empId: String,
  name: String,
  from: String,
  to: String,
  type: String, // Sick/Casual/Earned
  reason: String,
  status: String // Pending/Approved/Rejected
});

/* ✅ Requests */
const Request = mongoose.model("Request", {
  user: String,
  type: String, // Leave/HR
  message: String,
  status: String, // Pending/Approved/Rejected
  createdAt: { type: Date, default: Date.now }
});

/* ✅ NEW: Timesheet model */
const Timesheet = mongoose.model("Timesheet", {
  user: String,
  empId: String,
  empName: String,
  date: String,       // YYYY-MM-DD
  project: String,
  task: String,
  hours: Number,      // 0-24
  notes: String,
  createdAt: { type: Date, default: Date.now }
});

/* -------------------- HOLIDAYS (sample) -------------------- */
const indianHolidays = {
  "2026-01-26": "Republic Day 🇮🇳",
  "2026-08-15": "Independence Day 🇮🇳",
  "2026-10-02": "Gandhi Jayanti 🇮🇳",
  "2026-12-25": "Christmas",
  "2026-10-24": "Diwali"
};

/* -------------------- HELPERS -------------------- */
function requireLogin(req, res, next) {
  if (!req.session.user) return res.redirect("/");
  next();
}

function sidebar(active) {
  const item = (href, label, key) =>
    `<a class="${active === key ? "active" : ""}" href="${href}">${label}</a>`;

  return `
    <div class="sidebar forest-sidebar">
      <div class="side-brand">
        <div class="side-logo">🌿</div>
        <div>
          <div class="side-title">HRMS Cloud</div>
          <div class="side-sub">Forest Edition</div>
        </div>
      </div>

      ${item("/dashboard", "Dashboard", "dashboard")}
      ${item("/calendar", "Calendar", "calendar")}
      ${item("/hrms", "HRMS", "hrms")}
      ${item("/attendance", "Attendance", "attendance")}
      ${item("/timesheet", "Time Sheet", "timesheet")}
      ${item("/leaves", "Leaves", "leaves")}
      ${item("/payroll", "Payroll", "payroll")}
      ${item("/reports", "Reports", "reports")}

      <div class="side-footer">
        <div class="muted">🌲 Nature UI enabled</div>
      </div>
    </div>
  `;
}

function layout({ title, user, active, content }) {
  return `
  <!DOCTYPE html>
  <html>
  <head>
    <title>${title}</title>
    <meta charset="utf-8"/>
    <meta name="viewport" content="width=device-width,initial-scale=1"/>
    <link rel="stylesheet" href="/css/style.css">
  </head>
  <body class="forest-body">

    <div class="header forest-header">
      <div class="logo">
        <span class="logo-badge">🌿</span>
        <span>HRMS Cloud</span>
      </div>
      <div class="top-right">
        <span class="welcome">Welcome ${user}</span>
        <a class="logout" href="/logout">Logout</a>
      </div>
    </div>

    <div class="layout">
      ${sidebar(active)}
      <div class="main forest-main">
        ${content}
      </div>
    </div>

  <!-- ✅ Butterflies Script -->
  <script src="/js/butterflies.js"></script>

  </body>
  </html>
  `;
}

/* -------------------- LOGIN UI (with LIVE butterflies ✅) -------------------- */
app.get("/", (req, res) => {
  res.send(`
  <!DOCTYPE html>
  <html>
  <head>
    <title>HRMS Login</title>
    <meta charset="utf-8"/>
    <meta name="viewport" content="width=device-width,initial-scale=1"/>
    <link rel="stylesheet" href="/css/style.css">
  </head>
  <body class="wildlife-bg">

    <!-- ✅ Butterflies Animation Layer -->
    <div id="butterflies-layer"></div>

    <div class="login-wrap">
      <div class="login-card glass">
        <div class="login-brand">
          <div class="brand-icon">🦋</div>
          <div>
            <div class="brand-title">HRMS</div>
            <div class="brand-sub">Forest Login Portal</div>
          </div>
        </div>

        <div class="login-divider"></div>

        <form method="POST" action="/login" class="login-form">
          <label>Username</label>
          <input name="username" placeholder="Enter username" required />

          <label>Password</label>
          <input type="password" name="password" placeholder="Enter password" required />

          <button class="btn-primary" type="submit">Sign in</button>

          <div class="login-hint">
            Tip: First time login → user auto-creates in MongoDB ✅
          </div>
        </form>
      </div>
    </div>

    <!-- ✅ Butterflies Script -->
    <script src="/js/butterflies.js"></script>

  </body>
  </html>
  `);
});

/* -------------------- LOGIN LOGIC -------------------- */
app.post("/login", async (req, res) => {
  const { username, password } = req.body;

  let user = await User.findOne({ username, password });
  if (!user) user = await User.create({ username, password });

  req.session.user = user.username;

  console.log("✅ Logged in:", user.username);

  req.session.save(() => {
    res.redirect("/dashboard");
  });
});

/* -------------------- ✅ SEED 20 EMPLOYEES -------------------- */
app.get("/seed-employees", requireLogin, async (req, res) => {
  const exists = await Employee.countDocuments();
  if (exists >= 20) {
    return res.send("✅ Employees already seeded in DB (20+ exists).");
  }

  const employees = [
    {
      empId: "EMP001", name: "Aarav Sharma", gender: "Male", dob: "1996-04-12",
      email: "aarav.sharma@company.com", phone: "9876500001",
      department: "HR", role: "HR Executive", joiningDate: "2023-02-10", manager: "Priya Menon",
      status: "Active",
      address: { city: "Hyderabad", state: "Telangana", pincode: "500081" },
      bank: { bankName: "HDFC Bank", ifsc: "HDFC0000123", accountNo: "XXXX0011" },
      salary: { basic: 35000, hra: 14000, allowances: 6000, deductions: 2000, net: 53000 }
    },
    {
      empId: "EMP002", name: "Meera Reddy", gender: "Female", dob: "1997-09-22",
      email: "meera.reddy@company.com", phone: "9876500002",
      department: "IT", role: "Software Engineer", joiningDate: "2022-08-01", manager: "Sandeep Rao",
      status: "Active",
      address: { city: "Bangalore", state: "Karnataka", pincode: "560001" },
      bank: { bankName: "ICICI Bank", ifsc: "ICIC0000456", accountNo: "XXXX0022" },
      salary: { basic: 60000, hra: 24000, allowances: 10000, deductions: 3000, net: 91000 }
    },
    {
      empId: "EMP003", name: "Rohan Verma", gender: "Male", dob: "1994-12-04",
      email: "rohan.verma@company.com", phone: "9876500003",
      department: "Finance", role: "Accountant", joiningDate: "2021-06-15", manager: "Divya Nair",
      status: "Active",
      address: { city: "Mumbai", state: "Maharashtra", pincode: "400001" },
      bank: { bankName: "SBI", ifsc: "SBIN0000789", accountNo: "XXXX0033" },
      salary: { basic: 45000, hra: 18000, allowances: 7000, deductions: 2500, net: 67500 }
    },
    {
      empId: "EMP004", name: "Ananya Singh", gender: "Female", dob: "1998-02-10",
      email: "ananya.singh@company.com", phone: "9876500004",
      department: "Sales", role: "Sales Executive", joiningDate: "2023-10-03", manager: "Rahul Jain",
      status: "Active",
      address: { city: "Delhi", state: "Delhi", pincode: "110001" },
      bank: { bankName: "Axis Bank", ifsc: "UTIB0000543", accountNo: "XXXX0044" },
      salary: { basic: 30000, hra: 12000, allowances: 8000, deductions: 1500, net: 48500 }
    },
    {
      empId: "EMP005", name: "Karthik Naidu", gender: "Male", dob: "1995-07-14",
      email: "karthik.naidu@company.com", phone: "9876500005",
      department: "Operations", role: "Operations Manager", joiningDate: "2020-01-11", manager: "Manoj Kumar",
      status: "Active",
      address: { city: "Chennai", state: "Tamil Nadu", pincode: "600001" },
      bank: { bankName: "Kotak Bank", ifsc: "KKBK0000123", accountNo: "XXXX0055" },
      salary: { basic: 80000, hra: 32000, allowances: 12000, deductions: 5000, net: 119000 }
    }
  ];

  const more = [
    ["EMP006","Pooja Iyer","Female","Admin","Admin Officer","Pune","Maharashtra","411001"],
    ["EMP007","Vikram Rao","Male","IT","DevOps Engineer","Hyderabad","Telangana","500032"],
    ["EMP008","Sneha Kulkarni","Female","Marketing","Digital Marketer","Bangalore","Karnataka","560076"],
    ["EMP009","Rahul Jain","Male","Sales","Sales Manager","Delhi","Delhi","110020"],
    ["EMP010","Divya Nair","Female","Finance","Payroll Specialist","Kochi","Kerala","682001"],
    ["EMP011","Siddharth Gupta","Male","IT","Backend Developer","Noida","Uttar Pradesh","201301"],
    ["EMP012","Neha Kapoor","Female","HR","Recruiter","Gurgaon","Haryana","122001"],
    ["EMP013","Manoj Kumar","Male","Operations","Team Lead","Chennai","Tamil Nadu","600097"],
    ["EMP014","Ishita Bose","Female","Marketing","Content Writer","Kolkata","West Bengal","700001"],
    ["EMP015","Prakash Mishra","Male","IT","Frontend Developer","Hyderabad","Telangana","500090"],
    ["EMP016","Aditi Chawla","Female","Sales","Inside Sales","Jaipur","Rajasthan","302001"],
    ["EMP017","Suresh Patel","Male","Finance","Senior Accountant","Ahmedabad","Gujarat","380001"],
    ["EMP018","Kavya Menon","Female","Admin","Receptionist","Kochi","Kerala","682020"],
    ["EMP019","Nikhil Das","Male","Operations","Logistics Executive","Vizag","Andhra Pradesh","530001"],
    ["EMP020","Ritika Sinha","Female","IT","QA Engineer","Bangalore","Karnataka","560037"]
  ];

  more.forEach((x, idx) => {
    employees.push({
      empId: x[0],
      name: x[1],
      gender: x[2],
      dob: "1996-01-01",
      email: `${x[1].toLowerCase().replace(" ", ".")}@company.com`,
      phone: `98765000${String(idx + 6).padStart(2, "0")}`,
      department: x[3],
      role: x[4],
      joiningDate: "2022-01-01",
      manager: "HRMS Admin",
      status: "Active",
      address: { city: x[5], state: x[6], pincode: x[7] },
      bank: { bankName: "SBI", ifsc: "SBIN0001234", accountNo: `XXXX${idx + 1006}` },
      salary: { basic: 40000 + idx * 2000, hra: 16000 + idx * 800, allowances: 6000, deductions: 2000, net: 60000 + idx * 2500 }
    });
  });

  await Employee.insertMany(employees);

  res.send("✅ Successfully seeded 20 employees. Now open Dashboard.");
});

/* -------------------- DASHBOARD -------------------- */
app.get("/dashboard", requireLogin, async (req, res) => {
  const user = req.session.user;

  const today = new Date();
  const yyyy = today.getFullYear();
  const mm = String(today.getMonth() + 1).padStart(2, "0");
  const dd = String(today.getDate()).padStart(2, "0");
  const todayStr = `${yyyy}-${mm}-${dd}`;

  const totalEmployees = await Employee.countDocuments();

  const presentToday = await Attendance.countDocuments({
    date: todayStr,
    status: { $in: ["Present", "WFH"] }
  });

  const onLeave = await Leave.countDocuments({
    status: "Approved",
    from: { $lte: todayStr },
    to: { $gte: todayStr }
  });

  const pendingLeave = await Leave.countDocuments({ status: "Pending" });
  const pendingReq = await Request.countDocuments({ status: "Pending" });
  const pendingRequests = pendingLeave + pendingReq;

  const content = `
    <h2 class="page-title">Dashboard</h2>

    <div class="cards">
      <div class="card blue glow"><h3>Total Employees</h3><p>${totalEmployees}</p></div>
      <div class="card green glow"><h3>Present Today</h3><p>${presentToday}</p></div>
      <div class="card orange glow"><h3>On Leave</h3><p>${onLeave}</p></div>
      <div class="card red glow"><h3>Pending Requests</h3><p>${pendingRequests}</p></div>
    </div>

    <div class="panel glass">
      <h3>Quick Actions</h3>
      <div class="quick-actions">
        <a class="qa" href="/attendance">Mark Attendance</a>
        <a class="qa" href="/calendar">Open Calendar</a>
        <a class="qa" href="/employee-directory">Employee Directory</a>
        <a class="qa" href="/timesheet">Employee Time Sheet</a>
      </div>
      <div class="muted" style="margin-top:10px;">
        Tip: Open <b>/seed-employees</b> once to load 20 employees.
      </div>
    </div>
  `;

  res.send(layout({ title: "Dashboard", user, active: "dashboard", content }));
});

/* -------------------- EMPLOYEE DIRECTORY -------------------- */
app.get("/employee-directory", requireLogin, async (req, res) => {
  const user = req.session.user;
  const employees = await Employee.find().sort({ empId: 1 });

  const content = `
    <h2 class="page-title">Employee Directory</h2>

    <div class="panel glass">
      <h3>Employees (${employees.length})</h3>
      <table class="table">
        <tr>
          <th>Emp ID</th><th>Name</th><th>Dept</th><th>Role</th><th>Status</th>
        </tr>
        ${employees
          .map(
            e => `
          <tr>
            <td>${e.empId}</td>
            <td>${e.name}</td>
            <td>${e.department}</td>
            <td>${e.role}</td>
            <td>${e.status}</td>
          </tr>
        `
          )
          .join("")}
      </table>
    </div>
  `;

  res.send(layout({ title: "Employee Directory", user, active: "hrms", content }));
});

/* -------------------- CALENDAR -------------------- */
app.get("/calendar", requireLogin, async (req, res) => {
  const user = req.session.user;

  const monthNames = [
    "January","February","March","April","May","June",
    "July","August","September","October","November","December"
  ];

  let month = parseInt(req.query.month || "1", 10);
  let year = parseInt(req.query.year || "2026", 10);

  if (month < 1) { month = 12; year -= 1; }
  if (month > 12) { month = 1; year += 1; }

  const prevMonth = month - 1 < 1 ? 12 : month - 1;
  const prevYear = month - 1 < 1 ? year - 1 : year;

  const nextMonth = month + 1 > 12 ? 1 : month + 1;
  const nextYear = month + 1 > 12 ? year + 1 : year;

  const daysInMonth = new Date(year, month, 0).getDate();
  const firstDayIndex = new Date(year, month - 1, 1).getDay();

  const events = await Event.find({ user });

  const content = `
    <div class="calendar-top">
      <h2 class="page-title">Calendar</h2>

      <div class="calendar-controls">
        <a class="btn-light" href="/calendar?month=${prevMonth}&year=${prevYear}">◀ Prev</a>

        <form class="calendar-select" method="GET" action="/calendar">
          <select name="month">
            ${monthNames.map((m, idx) => {
              const val = idx + 1;
              return `<option value="${val}" ${val === month ? "selected" : ""}>${m}</option>`;
            }).join("")}
          </select>

          <select name="year">
            ${Array.from({ length: 11 }, (_, i) => 2024 + i).map(y => {
              return `<option value="${y}" ${y === year ? "selected" : ""}>${y}</option>`;
            }).join("")}
          </select>

          <button class="btn-primary small" type="submit">Go</button>
        </form>

        <a class="btn-light" href="/calendar?month=${nextMonth}&year=${nextYear}">Next ▶</a>
      </div>
    </div>

    <div class="panel glass">
      <div class="calendar-title">${monthNames[month - 1]} ${year}</div>

      <div class="calendar-grid">
        <div class="day-name">Sun</div>
        <div class="day-name">Mon</div>
        <div class="day-name">Tue</div>
        <div class="day-name">Wed</div>
        <div class="day-name">Thu</div>
        <div class="day-name">Fri</div>
        <div class="day-name">Sat</div>

        ${Array.from({ length: firstDayIndex }, () => `<div class="day empty"></div>`).join("")}

        ${Array.from({ length: daysInMonth }, (_, i) => {
          const d = i + 1;
          const dateStr = `${year}-${String(month).padStart(2,"0")}-${String(d).padStart(2,"0")}`;
          const holiday = indianHolidays[dateStr];
          return `
            <div class="day ${holiday ? "holiday" : ""}">
              <div class="day-num">${d}</div>
              ${holiday ? `<div class="holiday-text">${holiday}</div>` : ""}
            </div>
          `;
        }).join("")}
      </div>
    </div>

    <div class="grid-2">
      <div class="panel glass">
        <h3>Add Event</h3>
        <form method="POST" action="/add-event" class="form-row">
          <input type="date" name="date" required>
          <input type="text" name="title" placeholder="Event title" required>
          <button class="btn-primary" type="submit">Add</button>
        </form>
      </div>

      <div class="panel glass">
        <h3>Your Events</h3>
        <div class="event-list">
          ${
            events.length === 0
              ? `<div class="muted">No events added yet.</div>`
              : events
                  .map(e => `<div class="event-item">📌 <b>${e.date}</b> — ${e.title}</div>`)
                  .join("")
          }
        </div>
      </div>
    </div>
  `;

  res.send(layout({ title: "Calendar", user, active: "calendar", content }));
});

app.post("/add-event", requireLogin, async (req, res) => {
  const user = req.session.user;
  const { title, date } = req.body;
  await Event.create({ title, date, user });
  res.redirect("/calendar");
});

/* -------------------- HRMS -------------------- */
app.get("/hrms", requireLogin, (req, res) => {
  const user = req.session.user;
  const content = `
    <h2 class="page-title">HRMS</h2>
    <div class="panel glass">
      <h3>Services</h3>
      <div class="service-grid">
        <div class="service"><a href="/employee-directory">Employee Directory</a></div>
        <div class="service">Departments</div>
        <div class="service">Roles</div>
        <div class="service">Documents</div>
      </div>
      <div class="muted" style="margin-top:10px;">
        Use <b>/seed-employees</b> once to insert 20 employees.
      </div>
    </div>
  `;
  res.send(layout({ title: "HRMS", user, active: "hrms", content }));
});

/* -------------------- ATTENDANCE -------------------- */
app.get("/attendance", requireLogin, async (req, res) => {
  const user = req.session.user;

  const today = new Date();
  const yyyy = today.getFullYear();
  const mm = String(today.getMonth() + 1).padStart(2, "0");
  const dd = String(today.getDate()).padStart(2, "0");
  const todayStr = `${yyyy}-${mm}-${dd}`;

  const rows = await Attendance.find({ user }).sort({ date: -1 }).limit(15);

  const content = `
    <h2 class="page-title">Attendance</h2>

    <div class="grid-2">
      <div class="panel glass">
        <h3>Mark Attendance</h3>
        <form method="POST" action="/mark-attendance" class="form-col">
          <label>Date</label>
          <input type="date" name="date" value="${todayStr}" required>

          <label>Status</label>
          <select name="status">
            <option>Present</option>
            <option>WFH</option>
            <option>Absent</option>
          </select>

          <button class="btn-primary" type="submit">Save</button>
        </form>
      </div>

      <div class="panel glass">
        <h3>Recent Records</h3>
        ${rows.length === 0 ? `<div class="muted">No attendance records.</div>` : `
          <table class="table">
            <tr><th>Date</th><th>Status</th></tr>
            ${rows.map(r => `<tr><td>${r.date}</td><td>${r.status}</td></tr>`).join("")}
          </table>
        `}
      </div>
    </div>
  `;

  res.send(layout({ title: "Attendance", user, active: "attendance", content }));
});

app.post("/mark-attendance", requireLogin, async (req, res) => {
  const user = req.session.user;
  const { date, status } = req.body;

  await Attendance.findOneAndUpdate(
    { user, date },
    { user, date, status },
    { upsert: true, new: true }
  );

  res.redirect("/attendance");
});

/* -------------------- ✅ TIMESHEET (NEW FEATURE) -------------------- */
app.get("/timesheet", requireLogin, async (req, res) => {
  const user = req.session.user;

  const today = new Date();
  const yyyy = today.getFullYear();
  const mm = String(today.getMonth() + 1).padStart(2, "0");
  const dd = String(today.getDate()).padStart(2, "0");
  const todayStr = `${yyyy}-${mm}-${dd}`;

  const employees = await Employee.find().sort({ empId: 1 });

  const myRows = await Timesheet.find({ user }).sort({ date: -1, createdAt: -1 }).limit(20);
  const totalHours = myRows.reduce((sum, r) => sum + (Number(r.hours) || 0), 0);

  const content = `
    <h2 class="page-title">Employee Time Sheet</h2>

    <div class="grid-2">
      <div class="panel glass">
        <h3>Add Timesheet Entry</h3>

        <form method="POST" action="/timesheet/add" class="form-col">
          <label>Date</label>
          <input type="date" name="date" value="${todayStr}" required>

          <label>Employee</label>
          <select name="empId" required>
            ${employees.map(e => `<option value="${e.empId}">${e.empId} - ${e.name} (${e.department})</option>`).join("")}
          </select>

          <label>Project</label>
          <input name="project" placeholder="Example: HRMS Cloud" required>

          <label>Task</label>
          <input name="task" placeholder="Example: Bug Fix / UI work / Testing" required>

          <label>Hours</label>
          <input type="number" name="hours" min="0" max="24" step="0.5" value="8" required>

          <label>Notes</label>
          <input name="notes" placeholder="Optional notes (meeting, call, etc.)">

          <button class="btn-primary" type="submit">Save Entry</button>
        </form>
      </div>

      <div class="panel glass">
        <h3>Summary</h3>
        <div class="mini-cards">
          <div class="mini-card">
            <div class="mini-title">Recent Entries</div>
            <div class="mini-value">${myRows.length}</div>
          </div>
          <div class="mini-card">
            <div class="mini-title">Total Hours</div>
            <div class="mini-value">${totalHours}</div>
          </div>
        </div>

        <div class="muted" style="margin-top:12px;">
          ✅ Employee list comes from seeded employees (EMP001 - EMP020).
        </div>
      </div>
    </div>

    <div class="panel glass">
      <h3>Your Recent Timesheet</h3>

      ${
        myRows.length === 0
          ? `<div class="muted">No timesheet entries yet.</div>`
          : `
            <table class="table">
              <tr>
                <th>Date</th><th>Emp</th><th>Project</th><th>Task</th><th>Hours</th><th>Notes</th>
              </tr>
              ${myRows.map(r => `
                <tr>
                  <td>${r.date}</td>
                  <td><b>${r.empId}</b> - ${r.empName}</td>
                  <td>${r.project}</td>
                  <td>${r.task}</td>
                  <td><b>${r.hours}</b></td>
                  <td>${r.notes || "-"}</td>
                </tr>
              `).join("")}
            </table>
          `
      }
    </div>
  `;

  res.send(layout({ title: "Timesheet", user, active: "timesheet", content }));
});

app.post("/timesheet/add", requireLogin, async (req, res) => {
  const user = req.session.user;
  const { date, empId, project, task, hours, notes } = req.body;

  const emp = await Employee.findOne({ empId });

  await Timesheet.create({
    user,
    empId,
    empName: emp ? emp.name : empId,
    date,
    project,
    task,
    hours: Number(hours),
    notes
  });

  res.redirect("/timesheet");
});

/* -------------------- LEAVES -------------------- */
app.get("/leaves", requireLogin, async (req, res) => {
  const user = req.session.user;

  const sickBal = 6;
  const casualBal = 12;
  const earnedBal = 18;

  const myLeaves = await Leave.find({ user }).sort({ from: -1 }).limit(20);

  const content = `
    <h2 class="page-title">Leaves</h2>

    <div class="grid-2">
      <div class="panel glass">
        <h3>Apply Leave</h3>
        <form method="POST" action="/apply-leave" class="form-col">
          <label>From</label>
          <input type="date" name="from" required>

          <label>To</label>
          <input type="date" name="to" required>

          <label>Type</label>
          <select name="type">
            <option>Sick</option>
            <option>Casual</option>
            <option>Earned</option>
          </select>

          <label>Reason</label>
          <input name="reason" placeholder="Reason" required>

          <button class="btn-primary" type="submit">Submit Request</button>
        </form>
      </div>

      <div class="panel glass">
        <h3>Leave Balance</h3>
        <table class="table">
          <tr><th>Type</th><th>Balance</th></tr>
          <tr><td>Sick Leave</td><td>${sickBal}</td></tr>
          <tr><td>Casual Leave</td><td>${casualBal}</td></tr>
          <tr><td>Earned Leave</td><td>${earnedBal}</td></tr>
        </table>
      </div>
    </div>

    <div class="panel glass">
      <h3>Your Leave Requests</h3>
      ${
        myLeaves.length === 0
          ? `<div class="muted">No leave requests yet.</div>`
          : `
        <table class="table">
          <tr><th>From</th><th>To</th><th>Type</th><th>Reason</th><th>Status</th></tr>
          ${myLeaves.map(l => `
            <tr>
              <td>${l.from}</td>
              <td>${l.to}</td>
              <td>${l.type}</td>
              <td>${l.reason}</td>
              <td><b>${l.status}</b></td>
            </tr>
          `).join("")}
        </table>
        `
      }
    </div>
  `;

  res.send(layout({ title: "Leaves", user, active: "leaves", content }));
});

app.post("/apply-leave", requireLogin, async (req, res) => {
  const user = req.session.user;
  const { from, to, type, reason } = req.body;

  const emp = await Employee.findOne();

  await Leave.create({
    user,
    empId: emp ? emp.empId : "EMP000",
    name: emp ? emp.name : user,
    from,
    to,
    type,
    reason,
    status: "Pending"
  });

  await Request.create({
    user,
    type: "Leave",
    message: `Leave request ${from} to ${to} (${type})`,
    status: "Pending"
  });

  res.redirect("/leaves");
});

/* -------------------- PAYROLL -------------------- */
app.get("/payroll", requireLogin, async (req, res) => {
  const user = req.session.user;

  const emp = await Employee.findOne();
  const s = emp ? emp.salary : { basic: 0, hra: 0, allowances: 0, deductions: 0, net: 0 };

  const content = `
    <h2 class="page-title">Payroll</h2>

    <div class="grid-2">
      <div class="panel glass">
        <h3>Salary Structure</h3>
        <table class="table">
          <tr><th>Component</th><th>Amount (₹)</th></tr>
          <tr><td>Basic</td><td>${s.basic}</td></tr>
          <tr><td>HRA</td><td>${s.hra}</td></tr>
          <tr><td>Allowances</td><td>${s.allowances}</td></tr>
          <tr><td>Deductions</td><td>${s.deductions}</td></tr>
          <tr><td><b>Net Salary</b></td><td><b>${s.net}</b></td></tr>
        </table>
      </div>

      <div class="panel glass">
        <h3>Payslip (Sample)</h3>
        <div class="muted">Employee: <b>${emp ? emp.name : user}</b></div>
        <div class="muted">Department: <b>${emp ? emp.department : "-"}</b></div>
        <div class="muted">Role: <b>${emp ? emp.role : "-"}</b></div>
        <hr/>
        <div><b>Net Salary:</b> ₹${s.net}</div>
        <div class="muted" style="margin-top:10px;">(In real app: monthly payslip download PDF)</div>
      </div>
    </div>
  `;

  res.send(layout({ title: "Payroll", user, active: "payroll", content }));
});

/* -------------------- REPORTS -------------------- */
app.get("/reports", requireLogin, async (req, res) => {
  const user = req.session.user;

  const totalEmployees = await Employee.countDocuments();
  const totalAttendance = await Attendance.countDocuments();
  const totalLeaves = await Leave.countDocuments();

  const content = `
    <h2 class="page-title">Reports</h2>
    <div class="panel glass">
      <h3>System Reports</h3>
      <table class="table">
        <tr><th>Report</th><th>Total</th></tr>
        <tr><td>Employee Report</td><td>${totalEmployees}</td></tr>
        <tr><td>Attendance Report</td><td>${totalAttendance}</td></tr>
        <tr><td>Leave Report</td><td>${totalLeaves}</td></tr>
      </table>
      <div class="muted" style="margin-top:10px;">
        Real app: Export to Excel/PDF + Filters by Month/Department.
      </div>
    </div>
  `;
  res.send(layout({ title: "Reports", user, active: "reports", content }));
});

/* -------------------- LOGOUT -------------------- */
app.get("/logout", (req, res) => {
  req.session.destroy(() => {
    res.redirect("/");
  });
});

/* -------------------- SERVER -------------------- */
app.listen(3000, () => {
  console.log("Server running on port 3000");
});
