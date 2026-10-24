# EcoLDCE — Campus Solid Waste Management System

[![Node.js](https://img.shields.io/badge/Node.js-v18+-339933?logo=node.js&logoColor=white)](https://nodejs.org/)
[![Express.js](https://img.shields.io/badge/Express.js-v4.19-000000?logo=express&logoColor=white)](https://expressjs.com/)
[![License: Academic](https://img.shields.io/badge/License-Academic%20Evaluation-blue.svg)](LICENSE)
[![Institution](https://img.shields.io/badge/LDCE-Ahmedabad-10b981)](https://ldce.ac.in)

> **Design and Implementation of a Low-Cost Sustainable Solid Waste Segregation and Recycling System for Campus Waste Management**  
> *A Micro-Project submitted for the Course:* **Project Management (Course Code: BE05000481)**  
> **Department of Information Technology, L. D. College of Engineering, Ahmedabad**

---

## 🏛️ Academic & Institutional Details

- **Institution:** L. D. College of Engineering (LDCE), Ahmedabad
- **Department:** Department of Information Technology
- **Course:** Project Management (`BE05000481`)
- **Semester:** Bachelor of Engineering (B.E.), Semester V
- **Academic Year:** 2024–2026
- **Faculty Guide & Mentor:** **Prof. Parth Kasarekar**, Assistant Professor, IT Department

### 👥 Project Team Members

| Sr. | Student Name | Enrolment Number | Role in Project |
|:---:|:---|:---:|:---|
| 1 | **Harshil Bhagora** | `250283116002` | Project Manager & Integration Lead |
| 2 | **Vyom Prajapati** | `250283116008` | Operations & Procurement Coordinator |
| 3 | **Mehul Solanki** | `250283116014` | Full-Stack Web Architect & Waste Audit Lead |
| 4 | **Heer Thakar** | `250283116015` | Quality Control & Environmental Compliance |
| 5 | **Saumya Patel** | `240280116122` | Communications, Training & Student Liaison |

---

## 📌 Executive Summary & Problem Statement

L. D. College of Engineering spans a **59-acre campus** with **14 engineering departments** catering to over **6,000+ students, faculty, and administrative staff**. Prior to this project:
- Campus corridors relied on unsegregated single-bin dumpsters.
- Food waste from the campus canteen contaminated dry recyclable paper and plastics, rendering bulk scrap unrecyclable.
- Campus waste was transported directly to municipal landfills without organic diversion, generating greenhouse gases (methane) and odor issues.

### 🎯 Key SMART Objectives & Results

| Objective | Target Metric | Achieved Outcome | Status |
|:---|:---:|:---:|:---:|
| **Corridor Waste Diversion** | > 85% diverted from landfill | **88.5% Diversion Achieved** | ✅ Exceeded |
| **Source Segregation Accuracy** | > 90% sorting accuracy | **92.0% Accuracy by Day 14** | ✅ Exceeded |
| **Value Engineering Budget** | Ceiling of ₹1,700 INR | **₹1,672 INR** *(91.0% savings vs ₹18,500 baseline)* | ✅ Delivered |
| **Compost Pilot C:N Ratio** | Balanced 25:1 to 30:1 | **28.4:1 Optimal Aerobic Humus** | ✅ Achieved |
| **Corridor Response Time** | Incident triage < 30 mins | **Real-Time Admin Housekeeping Dispatch** | ✅ Live |

---

## 💡 Key Features of the System

### 1. 🏠 Executive Project Dashboard
- **Ishikawa (Fishbone) 6M Root Cause Diagram**: Visualizes campus waste bottlenecks across *Methods, Manpower, Materials, Machinery, Measurement, and Mother Nature*.
- **SMART Goals Tracker**: Real-time progress indicators mapped directly to university project guidelines.
- **Campus Impact Highlights**: Landfill diversion rate, organic recovery weight, and cost efficiency.

### 2. 📊 Waste Audit Analytics & Logging Hub
- **14-Day Baseline Audit Tracking**: Wet organic waste, dry recyclables, non-recyclables, and cross-contamination metrics.
- **Dynamic Data Visualization**: Native SVG multi-stream stacked bar charts and 14-day segregation accuracy trendline (from 54% baseline to 92% compliance).
- **Interactive Waste Entry Portal**: Allows logging new daily weigh-ins directly into the project repository.

### 3. 🗑️ Interactive Waste Stream Guide & Sorter Challenge
- **4-Stream Color-Coded Taxonomy**:
  - 🔵 **Blue Stream**: Dry Recyclables (Paper, Notebooks, PET Bottles, Metal Cans)
  - 🟢 **Green Stream**: Wet Compostable Organics (Fruit peels, canteen vegetable scraps, tea leaves)
  - ⚫ **Black Stream**: Non-Recyclable Landfill Residuals (Wax-coated wrappers, sanitary waste)
  - 🟡 **Amber Stream**: Campus Courtyard Aerobic Composter Feed
- **Multilingual Search Filter**: Real-time item lookup with Gujarati and English vernacular support (e.g. *કાગળ*, *પ્લાસ્ટિકની બોટલ*, *ચાની પત્તી*).
- **Interactive Sorting Quiz**: Real-time educational test with points and instant feedback to train students on proper disposal.

### 4. 📅 Operations, Gantt, WBS & Value Engineering
- **8-Week Critical Path Gantt Schedule**: Task-by-task breakdown from initial baseline audit to station deployment and final audit report.
- **Interactive Work Breakdown Structure (WBS)**: 10 work packages with live status toggling.
- **RACI Governance Matrix**: Clear accountability across all 5 student engineers.
- **Value Engineering Showcase**: Transparent budget ledger showing how upcycled materials saved **₹16,828 INR (91.0% cost reduction)** compared to commercial alternatives.

### 5. 🌿 Aerobic Composter & Chemical C:N Simulator
- **Live C:N Ratio Balancer**: Interactive sliders for green nitrogenous waste (food scraps) and brown carbonaceous waste (dry neem leaves, shredded cardboard).
- **Automated Bio-Chemical Advice**: Warns of ammonia odors if C:N < 20:1, or slow decomposition if C:N > 35:1.
- **Environmental CO₂e Avoidance Counter**: Computes greenhouse gas emissions prevented from entering landfills.

### 6. 🔐 Restricted Housekeeping Dispatch & Admin Console
- **Secure Authentication Gate**: Restricts administrative controls behind an authenticated login session with instant demo auto-fill for evaluators.
- **Real-Time Incident Triage**: Live counters for *Total Reports*, *Pending Verification*, *Housekeeping Dispatched*, and *Resolved & Cleared*.
- **Action Buttons**: 1-click status transitions (`⚡ Dispatch`, `✓ Mark Cleared`, `↺ Re-open`, `🗑️ Dismiss`).
- **Accessible Custom Select Component**: Eliminates OS-level white popup rendering bugs to provide clear, high-contrast stream selection on Windows and mobile.

### 7. 🏫 College Accreditation & Team Section
- High-contrast college accreditation card detailing LDCE, IT Department, Subject, Enrolment Numbers, and Faculty Guide **Prof. Parth Kasarekar**.

---

## 🛠️ Technology Stack

| Layer | Technology | Details |
|:---|:---|:---|
| **Backend** | Node.js & Express.js | Lightweight REST API server for project metrics, alerts, and authentication |
| **Frontend** | Vanilla JavaScript (ES6+) | No heavy frontend frameworks required; fast load time & zero build-step overhead |
| **Styling** | Modern CSS3 | Custom design system with glassmorphism, responsive CSS grid, and tailored dark palette |
| **Storage** | Structured JSON Storage | `data/project_data.json` and `data/alerts.json` with memory caching |
| **Deployment** | Vercel Ready | Configured with `vercel.json` for serverless API routing and static asset delivery |

---

## 🚀 Getting Started Locally

### Prerequisites
- [Node.js](https://nodejs.org/) (v16.0.0 or higher recommended)
- `npm` (bundled with Node.js)
- Modern web browser (Chrome, Edge, Firefox, Safari)

### 1. Clone the Repository
```bash
git clone https://github.com/SolankiMehul7874/ldce-waste-management.git
cd ldce-waste-management
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Launch the Server
```bash
npm start
# or: node server.js
```

### 4. Open in Browser
Visit **`http://localhost:3000`** in your browser.

---

## 🔑 Administrative Demo Credentials

To access the **Corridor Bins & Admin Console**, use the credentials below or click the **`⚡ 1-Click Auto-Fill & Sign In`** button on the sign-in card:

| Role | Username | Password | Access Level |
|:---|:---:|:---:|:---|
| **Chief Housekeeping Supervisor** | `admin` | `admin123` | Full Dispatch, Incident Resolution & Triage |
| **Alternate Admin** | `admin` | `admin` | Full Dispatch & Triage |
| **Corridor Incharge** | `supervisor` | `admin123` | Supervisor Dispatch Console |

---

## 📂 Project Directory Structure

```plaintext
ldce-waste-management/
├── data/
│   ├── alerts.json             # Corridor fill incidents & status logs
│   └── project_data.json       # WBS, Gantt, budget, audit logs, and RACI data
├── public/
│   ├── css/
│   │   └── style.css           # Glassmorphic responsive design system
│   ├── js/
│   │   └── app.js              # SPA navigation, SVG chart rendering, simulator, and admin auth
│   └── index.html              # Single Page Application HTML5 structure
├── .gitignore                  # Git ignore rules
├── package.json                # Project dependencies and startup scripts
├── package-lock.json           # Locked dependency tree
├── server.js                   # Express server & REST API endpoints
├── vercel.json                 # Vercel serverless deployment configuration
└── README.md                   # Project documentation & evaluation reference
```

---

## 📡 REST API Reference

| Method | Endpoint | Description |
|:---:|:---|:---|
| `GET` | `/api/project-info` | Returns project metadata, team members, and SMART objectives |
| `GET` | `/api/audit-logs` | Retrieves all 14-day waste audit log entries |
| `POST` | `/api/audit-logs` | Logs a new daily audit entry with weights and contamination |
| `GET` | `/api/analytics` | Returns computed totals, diversion rates, and segregation accuracy |
| `GET` | `/api/wbs` | Fetches the Work Breakdown Structure packages |
| `PUT` | `/api/wbs/:code/status` | Toggles WBS package completion status |
| `GET` | `/api/gantt` | Returns the 8-week Gantt schedule tasks |
| `GET` | `/api/raci` | Fetches the team RACI governance matrix |
| `GET` | `/api/budget` | Returns budget items and value engineering savings summary |
| `GET` | `/api/risks` | Returns risk register and mitigation protocols |
| `GET` | `/api/compost` | Returns IT courtyard composter pilot parameters |
| `POST` | `/api/compost/simulate` | Simulates C:N ratio and CO₂e avoidance from input weights |
| `GET` | `/api/classifier` | Waste item search with vernacular Gujarati translation |
| `GET` | `/api/alerts` | Fetches active corridor bin reports |
| `POST` | `/api/alerts` | Logs a new bin incident via student portal or modal |
| `PUT` | `/api/alerts/:id/status` | Updates alert status (`Dispatched`, `Resolved`, `Pending`) |
| `DELETE`| `/api/alerts/:id` | Dismisses an alert incident |
| `POST` | `/api/admin/login` | Validates admin supervisor credentials & issues session token |

---

## 📜 Acknowledgments

We express our sincere gratitude to:
- **Prof. Parth Kasarekar**, Assistant Professor, IT Department, for mentorship, continuous guidance, and review of our project deliverables.
- **Head of the Department (IT)** and **Principal, L. D. College of Engineering**, for providing the laboratory facilities and campus corridor pilot permissions.
- The **Estate & Housekeeping Staff of LDCE**, for their active collaboration during corridor audit weighing and pilot composter operations.

---

*Developed with pride by the IT Department Students of L. D. College of Engineering, Ahmedabad.*
