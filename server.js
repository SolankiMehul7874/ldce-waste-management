const express = require('express');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;
const DATA_FILE = path.join(__dirname, 'data', 'project_data.json');
const ALERTS_FILE = path.join(__dirname, 'data', 'alerts.json');

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// In-memory cache for serverless environments (where filesystem may be read-only)
let cachedProjectData = null;
let cachedAlerts = null;

// Helper to read project data
function readProjectData() {
  if (cachedProjectData) {
    return cachedProjectData;
  }
  try {
    const raw = fs.readFileSync(DATA_FILE, 'utf-8');
    cachedProjectData = JSON.parse(raw);
    return cachedProjectData;
  } catch (err) {
    console.error('Error reading project data:', err);
    return cachedProjectData;
  }
}

// Helper to write project data
function writeProjectData(data) {
  cachedProjectData = data;
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), 'utf-8');
    return true;
  } catch (err) {
    console.warn('Filesystem write not permitted or failed (running in serverless?); retained in memory:', err.message);
    return true;
  }
}

// Helper to read alerts
function readAlerts() {
  if (cachedAlerts) {
    return cachedAlerts;
  }
  try {
    if (!fs.existsSync(ALERTS_FILE)) {
      const defaultAlerts = [
        {
          id: 1,
          type: "fill_level",
          bin: "Blue (Dry Recyclables)",
          location: "IT Ground Floor Lobby",
          reportedBy: "Housekeeping Staff - Ramesh",
          status: "Resolved",
          timestamp: "2026-10-23 11:30 AM",
          note: "Cardboard cartons accumulated during lab submission; cleared and flattened for AMC scrap dispatch."
        },
        {
          id: 2,
          type: "compost_turn",
          bin: "Pilot Aerobic Composter",
          location: "IT Dept Courtyard",
          reportedBy: "Mehul Solanki (Audit Lead)",
          status: "Completed",
          timestamp: "2026-10-24 09:15 AM",
          note: "Turned compost; added 400g crushed neem leaves to maintain 30:1 C:N ratio. Moisture: 58%."
        }
      ];
      try {
        fs.writeFileSync(ALERTS_FILE, JSON.stringify(defaultAlerts, null, 2));
      } catch (e) {
        // Ignore write error on read-only system
      }
      cachedAlerts = defaultAlerts;
      return cachedAlerts;
    }
    const raw = fs.readFileSync(ALERTS_FILE, 'utf-8');
    cachedAlerts = JSON.parse(raw);
    return cachedAlerts;
  } catch (err) {
    return cachedAlerts || [];
  }
}

// Helper to write alerts
function writeAlerts(alerts) {
  cachedAlerts = alerts;
  try {
    fs.writeFileSync(ALERTS_FILE, JSON.stringify(alerts, null, 2), 'utf-8');
    return true;
  } catch (err) {
    console.warn('Filesystem write not permitted or failed (running in serverless?); retained in memory:', err.message);
    return true;
  }
}

// Compute live analytics based on audit logs
function calculateAnalytics(auditLogs) {
  if (!auditLogs || auditLogs.length === 0) {
    return {
      totalCollectedKg: 0,
      totalWetKg: 0,
      totalDryKg: 0,
      totalInertKg: 0,
      totalContaminationKg: 0,
      diversionRatePct: 0,
      avgAccuracyPct: 0,
      co2eSavedKg: 0,
      treesConserved: 0,
      monetaryValueINR: 0,
      dailyAverageKg: 0
    };
  }

  let totalWet = 0;
  let totalDry = 0;
  let totalInert = 0;
  let totalContam = 0;
  let accuracySum = 0;

  auditLogs.forEach(entry => {
    const wet = Number(entry.wetKg) || 0;
    const dry = Number(entry.dryRecyclableKg) || 0;
    const inert = Number(entry.nonRecyclableKg) || 0;
    const contam = Number(entry.contaminationKg) || 0;

    totalWet += wet;
    totalDry += dry;
    totalInert += inert;
    totalContam += contam;

    const streamTotal = wet + dry + inert;
    const acc = streamTotal > 0 ? ((1 - (contam / streamTotal)) * 100) : 100;
    accuracySum += Math.max(0, Math.min(100, acc));
  });

  const totalCollected = totalWet + totalDry + totalInert;
  const diversionRate = totalCollected > 0 ? (((totalWet + totalDry) / totalCollected) * 100) : 0;
  const avgAccuracy = accuracySum / auditLogs.length;

  // Ecological math from report:
  // 1 kg food waste composted aerobically avoids approx 1.2 kg CO2e emissions compared to anaerobic landfill
  const co2eSaved = totalWet * 1.2;
  // Every 54 kg of clean paper recycled saves ~1 tree
  const treesConserved = Number((totalDry * 0.6 / 54).toFixed(2));
  // Monetary salvage: Clean paper ~₹14/kg, PET ~₹25/kg (average dry rate ₹18/kg)
  const monetaryValue = Math.round(totalDry * 18);

  return {
    totalCollectedKg: Number(totalCollected.toFixed(2)),
    totalWetKg: Number(totalWet.toFixed(2)),
    totalDryKg: Number(totalDry.toFixed(2)),
    totalInertKg: Number(totalInert.toFixed(2)),
    totalContaminationKg: Number(totalContam.toFixed(2)),
    diversionRatePct: Number(diversionRate.toFixed(1)),
    avgAccuracyPct: Number(avgAccuracy.toFixed(1)),
    co2eSavedKg: Number(co2eSaved.toFixed(1)),
    treesConserved: treesConserved,
    monetaryValueINR: monetaryValue,
    dailyAverageKg: Number((totalCollected / auditLogs.length).toFixed(2)),
    daysAudited: auditLogs.length
  };
}

// ---------------- API ROUTES ----------------

// Get general project info
app.get('/api/project-info', (req, res) => {
  const data = readProjectData();
  if (!data) return res.status(500).json({ error: 'Failed to load project data' });
  res.json({
    projectInfo: data.projectInfo,
    teamMembers: data.teamMembers,
    smartObjectives: data.smartObjectives,
    ishikawaRootCauses: data.ishikawaRootCauses,
    streams: data.streams
  });
});

// Get all audit logs
app.get('/api/audit-logs', (req, res) => {
  const data = readProjectData();
  if (!data) return res.status(500).json({ error: 'Failed to load project data' });
  res.json(data.auditLogs);
});

// Post a new audit log entry (QR Code or Manual Entry simulation)
app.post('/api/audit-logs', (req, res) => {
  const data = readProjectData();
  if (!data) return res.status(500).json({ error: 'Failed to load project data' });

  const { wetKg, dryRecyclableKg, nonRecyclableKg, contaminationKg, notes } = req.body;
  if (wetKg === undefined || dryRecyclableKg === undefined || nonRecyclableKg === undefined) {
    return res.status(400).json({ error: 'Missing required weight metrics' });
  }

  const nextDay = data.auditLogs.length + 1;
  const newEntry = {
    day: nextDay,
    date: `Day ${nextDay} (${new Date().toLocaleDateString('en-GB')})`,
    wetKg: parseFloat(wetKg) || 0,
    dryRecyclableKg: parseFloat(dryRecyclableKg) || 0,
    nonRecyclableKg: parseFloat(nonRecyclableKg) || 0,
    contaminationKg: parseFloat(contaminationKg) || 0,
    compostBatch: "Batch " + (Math.floor(nextDay / 7) + 1),
    notes: notes || "Audited via LDCE Smart Corridor QR Portal"
  };

  data.auditLogs.push(newEntry);
  writeProjectData(data);

  const analytics = calculateAnalytics(data.auditLogs);
  res.status(201).json({ success: true, entry: newEntry, analytics });
});

// Get calculated analytics
app.get('/api/analytics', (req, res) => {
  const data = readProjectData();
  if (!data) return res.status(500).json({ error: 'Failed to load project data' });
  const analytics = calculateAnalytics(data.auditLogs);
  res.json(analytics);
});

// Work Breakdown Structure
app.get('/api/wbs', (req, res) => {
  const data = readProjectData();
  if (!data) return res.status(500).json({ error: 'Failed to load project data' });
  res.json(data.wbsPackages);
});

// Toggle WBS status
app.put('/api/wbs/:code/status', (req, res) => {
  const data = readProjectData();
  if (!data) return res.status(500).json({ error: 'Failed to load project data' });
  const pkg = data.wbsPackages.find(p => p.code === req.params.code);
  if (!pkg) return res.status(404).json({ error: 'WBS package not found' });

  pkg.status = req.body.status || (pkg.status === 'Completed' ? 'In Progress' : 'Completed');
  writeProjectData(data);
  res.json({ success: true, package: pkg });
});

// Gantt Chart Schedule
app.get('/api/gantt', (req, res) => {
  const data = readProjectData();
  if (!data) return res.status(500).json({ error: 'Failed to load project data' });
  res.json(data.ganttTasks);
});

// RACI Matrix
app.get('/api/raci', (req, res) => {
  const data = readProjectData();
  if (!data) return res.status(500).json({ error: 'Failed to load project data' });
  res.json(data.raciMatrix);
});

// Budget & Cost Planning
app.get('/api/budget', (req, res) => {
  const data = readProjectData();
  if (!data) return res.status(500).json({ error: 'Failed to load project data' });
  res.json({
    items: data.budgetItems,
    summary: data.budgetSummary
  });
});

// Risk Register
app.get('/api/risks', (req, res) => {
  const data = readProjectData();
  if (!data) return res.status(500).json({ error: 'Failed to load project data' });
  res.json(data.risks);
});

// Composter Data & C:N Simulator
app.get('/api/compost', (req, res) => {
  const data = readProjectData();
  if (!data) return res.status(500).json({ error: 'Failed to load project data' });
  res.json(data.composterData);
});

// Simulate C:N Ratio
app.post('/api/compost/simulate', (req, res) => {
  const { greenWeightKg, brownWeightKg } = req.body;
  const green = parseFloat(greenWeightKg) || 0;
  const brown = parseFloat(brownWeightKg) || 0;

  // Typical values:
  // Green food waste: C:N ~ 15:1, Moisture ~ 70%
  // Brown leaves/cardboard: C:N ~ 60:1, Moisture ~ 15%
  // Optimal target: 25:1 to 30:1, Moisture 50-60%
  if (green + brown <= 0) {
    return res.status(400).json({ error: 'Please enter valid positive weights.' });
  }

  const estimatedCN = Number(((green * 15 + brown * 60) / (green + brown)).toFixed(1));
  const estimatedMoisture = Number(((green * 70 + brown * 15) / (green + brown)).toFixed(1));

  let status = "Balanced (Optimal Aerobic Decomposition)";
  let badgeColor = "green";
  let recommendation = "Ideal balance! Aerobic bacteria will thrive without odors.";

  if (estimatedCN < 20) {
    status = "Excess Nitrogen (Risk of Ammonia Odor)";
    badgeColor = "amber";
    recommendation = "Add more brown carbon material (crushed dry neem leaves or shredded cardboard) to absorb moisture and odor.";
  } else if (estimatedCN > 35) {
    status = "Excess Carbon (Slow Decomposition Rate)";
    badgeColor = "amber";
    recommendation = "Add more green canteen vegetable scraps or spray diluted buttermilk (chaas) to accelerate microbial activity.";
  }

  res.json({
    greenWeightKg: green,
    brownWeightKg: brown,
    totalWeightKg: Number((green + brown).toFixed(2)),
    estimatedCNRatio: `${estimatedCN}:1`,
    estimatedMoisturePercentage: estimatedMoisture,
    status,
    badgeColor,
    recommendation,
    projectedCO2eAvoidedKg: Number((green * 1.2).toFixed(2))
  });
});

// Waste Item Lookup / Sorter Guide
app.get('/api/classifier', (req, res) => {
  const data = readProjectData();
  if (!data) return res.status(500).json({ error: 'Failed to load project data' });
  const q = (req.query.q || '').toLowerCase().trim();
  if (!q) {
    return res.json(data.wasteItemClassifier);
  }
  const filtered = data.wasteItemClassifier.filter(item =>
    item.name.toLowerCase().includes(q) ||
    item.gujarati.includes(q) ||
    item.stream.toLowerCase().includes(q)
  );
  res.json(filtered);
});

// Corridor Alerts (Fill-level alerts & student reports)
app.get('/api/alerts', (req, res) => {
  res.json(readAlerts());
});

app.post('/api/alerts', (req, res) => {
  const { bin, location, reportedBy, note, type } = req.body;
  if (!bin || !reportedBy) {
    return res.status(400).json({ error: 'Missing required fields' });
  }
  const alerts = readAlerts();
  const nextId = alerts.reduce((max, a) => Math.max(max, a.id || 0), 0) + 1;
  const newAlert = {
    id: nextId,
    type: type || 'bin_report',
    bin,
    location: location || 'IT Department Corridor',
    reportedBy,
    status: 'Pending Verification',
    timestamp: new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }),
    note: note || 'Disposal assistance or bin status reported via student portal.'
  };
  alerts.unshift(newAlert);
  if (writeAlerts(alerts)) {
    res.status(201).json({ success: true, alert: newAlert });
  } else {
    res.status(500).json({ error: 'Failed to save alert' });
  }
});

// Update alert status
app.put('/api/alerts/:id/status', (req, res) => {
  const alertId = parseInt(req.params.id);
  const { status, note } = req.body;
  const alerts = readAlerts();
  const alert = alerts.find(a => a.id === alertId);
  if (!alert) {
    return res.status(404).json({ error: 'Alert not found' });
  }
  alert.status = status || 'Resolved';
  if (note) alert.resolutionNote = note;
  alert.resolvedAt = new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' });

  if (writeAlerts(alerts)) {
    res.json({ success: true, alert });
  } else {
    res.status(500).json({ error: 'Failed to update alert' });
  }
});

// Delete an alert
app.delete('/api/alerts/:id', (req, res) => {
  const alertId = parseInt(req.params.id);
  let alerts = readAlerts();
  const initialLen = alerts.length;
  alerts = alerts.filter(a => a.id !== alertId);
  if (alerts.length === initialLen) {
    return res.status(404).json({ error: 'Alert not found' });
  }
  if (writeAlerts(alerts)) {
    res.json({ success: true, deletedId: alertId });
  } else {
    res.status(500).json({ error: 'Failed to delete alert' });
  }
});

// Admin Authentication
app.post('/api/admin/login', (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ error: 'Username and password are required' });
  }

  // Accepted supervisor & admin credentials
  const validUsers = [
    { username: 'admin', password: 'admin123', name: 'Estate & SWM Supervisor', role: 'Chief Housekeeping Admin' },
    { username: 'admin@ldce.ac.in', password: 'admin123', name: 'Estate & SWM Supervisor', role: 'Chief Housekeeping Admin' },
    { username: 'supervisor', password: 'admin123', name: 'IT Corridor Incharge', role: 'Housekeeping Supervisor' },
    { username: 'admin', password: 'admin', name: 'Estate & SWM Supervisor', role: 'Chief Housekeeping Admin' }
  ];

  const matched = validUsers.find(u => 
    (u.username.toLowerCase() === username.toLowerCase().trim()) && 
    (u.password === password.trim())
  );

  if (matched) {
    const token = 'ldce_auth_' + Buffer.from(`${matched.username}:${Date.now()}`).toString('base64');
    return res.json({
      success: true,
      token,
      user: {
        username: matched.username,
        name: matched.name,
        role: matched.role,
        department: 'Information Technology, L. D. College of Engineering'
      }
    });
  } else {
    return res.status(401).json({ success: false, error: 'Invalid credentials. Please verify your username and password.' });
  }
});

// Fallback to SPA index.html
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Start Server locally
if (process.env.NODE_ENV !== 'test' && !process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`=======================================================`);
    console.log(` LDCE Campus Waste Management Project Portal`);
    console.log(` Running live at: http://localhost:${PORT}`);
    console.log(` Subject: Project Management (Course Code: BE05000481)`);
    console.log(` Department: Information Technology, LDCE Ahmedabad`);
    console.log(`=======================================================`);
  });
}

module.exports = app;
