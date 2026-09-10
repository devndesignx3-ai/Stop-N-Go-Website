import express from "express";
import path from "path";
import fs from "fs";
import { createServer as createViteServer } from "vite";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json({ limit: "20mb" }));
app.use(express.urlencoded({ extended: true, limit: "20mb" }));

// Ensure data directory exists
const DATA_DIR = path.join(process.cwd(), "data");
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

const APPLICATIONS_FILE = path.join(DATA_DIR, "applications.json");
const PRICES_FILE = path.join(DATA_DIR, "prices.json");

// Define initial gas prices (different per location based on local parameters)
const initialPrices = {
  "West Chester": { regular: 3.29, midgrade: 3.69, premium: 3.99, diesel: 3.89, lastUpdated: new Date().toISOString() },
  "Mason": { regular: 3.32, midgrade: 3.72, premium: 4.02, diesel: 3.92, lastUpdated: new Date().toISOString() },
  "Oxford": { regular: 3.35, midgrade: 3.75, premium: 4.05, diesel: 3.95, lastUpdated: new Date().toISOString() },
  "Clifton": { regular: 3.42, midgrade: 3.82, premium: 4.12, diesel: 3.99, lastUpdated: new Date().toISOString() },
  "Loveland": { regular: 3.30, midgrade: 3.70, premium: 4.00, diesel: 3.85, lastUpdated: new Date().toISOString() },
  "Cincinnati": { regular: 3.39, midgrade: 3.79, premium: 4.09, diesel: 3.94, lastUpdated: new Date().toISOString() },
  "Deer Park": { regular: 3.31, midgrade: 3.71, premium: 4.01, diesel: 3.87, lastUpdated: new Date().toISOString() }
};

// Load or initialize prices
function getPrices() {
  try {
    if (fs.existsSync(PRICES_FILE)) {
      return JSON.parse(fs.readFileSync(PRICES_FILE, "utf-8"));
    }
  } catch (error) {
    console.error("Error reading prices, falling back to initials:", error);
  }
  // If not exists or error, save and return initials
  savePrices(initialPrices);
  return initialPrices;
}

function savePrices(prices: any) {
  try {
    fs.writeFileSync(PRICES_FILE, JSON.stringify(prices, null, 2), "utf-8");
  } catch (error) {
    console.error("Error writing prices:", error);
  }
}

// Load or initialize applications
function getApplications() {
  try {
    if (fs.existsSync(APPLICATIONS_FILE)) {
      return JSON.parse(fs.readFileSync(APPLICATIONS_FILE, "utf-8"));
    }
  } catch (error) {
    console.error("Error reading applications:", error);
  }
  return [];
}

function saveApplications(applications: any[]) {
  try {
    fs.writeFileSync(APPLICATIONS_FILE, JSON.stringify(applications, null, 2), "utf-8");
  } catch (error) {
    console.error("Error writing applications:", error);
  }
}

// Simulating fluctuating prices every hour for realistic dynamic feel
setInterval(() => {
  const currentPrices = getPrices();
  let modified = false;
  for (const station in currentPrices) {
    // 30% chance to fluctuate +/- 1 to 3 cents
    if (Math.random() < 0.3) {
      const diff = (Math.random() * 0.04 - 0.02); // -2c to +2c
      currentPrices[station].regular = parseFloat(Math.max(2.80, currentPrices[station].regular + diff).toFixed(2));
      currentPrices[station].midgrade = parseFloat((currentPrices[station].regular + 0.40).toFixed(2));
      currentPrices[station].premium = parseFloat((currentPrices[station].regular + 0.70).toFixed(2));
      currentPrices[station].diesel = parseFloat((currentPrices[station].diesel + (Math.random() * 0.02 - 0.01)).toFixed(2));
      currentPrices[station].lastUpdated = new Date().toISOString();
      modified = true;
    }
  }
  if (modified) {
    savePrices(currentPrices);
  }
}, 600000); // Check and fluctuate slightly every 10 min

// API ROUTES

// (1) Get gas prices
app.get("/api/gas-prices", (req, res) => {
  res.json({ success: true, prices: getPrices() });
});

// (2) Update gas prices manually (Admin Mode)
app.post("/api/gas-prices/update", (req, res) => {
  const authCode = req.headers["x-admin-passcode"];
  const expectedAuthCode = process.env.ADMIN_PASSCODE || "admin123";
  
  if (authCode !== expectedAuthCode) {
    return res.status(401).json({ success: false, error: "Unauthorized passcode" });
  }

  const { station, regular, midgrade, premium, diesel } = req.body;
  if (!station || regular === undefined || midgrade === undefined || premium === undefined || diesel === undefined) {
    return res.status(400).json({ success: false, error: "Missing fields" });
  }

  const currentPrices = getPrices();
  if (!currentPrices[station]) {
    return res.status(404).json({ success: false, error: "Station not found" });
  }

  currentPrices[station] = {
    regular: parseFloat(Number(regular).toFixed(2)),
    midgrade: parseFloat(Number(midgrade).toFixed(2)),
    premium: parseFloat(Number(premium).toFixed(2)),
    diesel: parseFloat(Number(diesel).toFixed(2)),
    lastUpdated: new Date().toISOString()
  };

  savePrices(currentPrices);
  res.json({ success: true, prices: currentPrices });
});

// (3) Create employment application
app.post("/api/applications", (req, res) => {
  try {
    const {
      firstName,
      lastName,
      email,
      phone,
      streetAddress,
      city,
      state,
      zipCode,
      dateAvailable,
      desiredPosition,
      previousExperience,
      resume, // { name: string, data: base64Text, type: string }
      additionalNotes,
      selectedLocation
    } = req.body;

    // Validate fields
    if (!firstName || !lastName || !email || !phone || !desiredPosition || !selectedLocation) {
      return res.status(400).json({ success: false, error: "Missing required application metrics." });
    }

    const applications = getApplications();
    const newApplication = {
      id: "app_" + Date.now() + "_" + Math.floor(Math.random() * 1000),
      firstName,
      lastName,
      email,
      phone,
      streetAddress: streetAddress || "",
      city: city || "",
      state: state || "",
      zipCode: zipCode || "",
      dateAvailable: dateAvailable || "",
      desiredPosition,
      previousExperience: previousExperience || "",
      resume: resume || null,
      additionalNotes: additionalNotes || "",
      selectedLocation,
      status: "Pending", // Pending, Reviewed, Interview, Hired, Rejected
      adminNotes: "",
      createdAt: new Date().toISOString()
    };

    applications.push(newApplication);
    saveApplications(applications);

    // Simulated email delivery log / placeholder email: careers@stopngoshell.com
    console.log("=================================================");
    console.log(`[EMAIL SEND] To: careers@stopngoshell.com`);
    console.log(`[EMAIL SEND] Subject: New Application - ${newApplication.desiredPosition} - ${newApplication.selectedLocation}`);
    console.log(`[EMAIL SEND] From: ${newApplication.firstName} ${newApplication.lastName} <${newApplication.email}>`);
    console.log(`------------------------------`);
    console.log(`A new employment application has been received for the ${newApplication.selectedLocation} store.`);
    console.log(`Applicant Name: ${newApplication.firstName} ${newApplication.lastName}`);
    console.log(`Phone: ${newApplication.phone}`);
    console.log(`Desired Position: ${newApplication.desiredPosition}`);
    console.log(`Available Date: ${newApplication.dateAvailable}`);
    console.log(`Experience Summary: ${newApplication.previousExperience ? newApplication.previousExperience.substring(0, 100) + "..." : "None"}`);
    if (newApplication.resume) {
      console.log(`Attached Resume: ${newApplication.resume.name} (${newApplication.resume.type || "file"})`);
    } else {
      console.log(`No Resume attached.`);
    }
    console.log("=================================================");

    res.json({
      success: true,
      message: "Application submitted successfully!",
      id: newApplication.id
    });
  } catch (error: any) {
    console.error("Critical error saving application:", error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// (4) Fetch all job applications (Admin dashboard, protected by passcode)
app.get("/api/applications", (req, res) => {
  const authCode = req.headers["x-admin-passcode"];
  const expectedAuthCode = process.env.ADMIN_PASSCODE || "admin123";

  if (authCode !== expectedAuthCode) {
    return res.status(401).json({ success: false, error: "Unauthorized access. Invalid admin passcode." });
  }

  res.json({ success: true, applications: getApplications() });
});

// (5) Update application status/comment
app.post("/api/applications/:id/status", (req, res) => {
  const authCode = req.headers["x-admin-passcode"];
  const expectedAuthCode = process.env.ADMIN_PASSCODE || "admin123";

  if (authCode !== expectedAuthCode) {
    return res.status(401).json({ success: false, error: "Unauthorized access." });
  }

  const { id } = req.params;
  const { status, adminNotes } = req.body;

  const applications = getApplications();
  const index = applications.findIndex((app: any) => app.id === id);

  if (index === -1) {
    return res.status(404).json({ success: false, error: "Application not found" });
  }

  if (status !== undefined) applications[index].status = status;
  if (adminNotes !== undefined) applications[index].adminNotes = adminNotes;

  saveApplications(applications);
  res.json({ success: true, application: applications[index] });
});

// (6) Delete application
app.delete("/api/applications/:id", (req, res) => {
  const authCode = req.headers["x-admin-passcode"];
  const expectedAuthCode = process.env.ADMIN_PASSCODE || "admin123";

  if (authCode !== expectedAuthCode) {
    return res.status(401).json({ success: false, error: "Unauthorized access." });
  }

  const { id } = req.params;
  const applications = getApplications();
  const updated = applications.filter((app: any) => app.id !== id);

  if (applications.length === updated.length) {
    return res.status(404).json({ success: false, error: "Application not found" });
  }

  saveApplications(updated);
  res.json({ success: true });
});

// (7) Handle customer contacts
app.post("/api/contact", (req, res) => {
  const { name, email, phone, message, storeLocation } = req.body;
  if (!name || !email || !message) {
    return res.status(400).json({ success: false, error: "Missing required message fields" });
  }

  console.log("=================================================");
  console.log(`[CUSTOMER FEEDBACK] To: management@stopngoshell.com`);
  console.log(`[CUSTOMER FEEDBACK] From: ${name} <${email}> (${phone || "No phone"})`);
  console.log(`[CUSTOMER FEEDBACK] Store: ${storeLocation || "General Inquiry"}`);
  console.log(`[CUSTOMER FEEDBACK] Message: ${message}`);
  console.log("=================================================");

  res.json({ success: true, message: "Feedback submitted successfully! Our regional manager will be in touch within 24-48 hours." });
});

// VITE MIDDLEWARE SETUP
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[SERVER] Full-stack Stop N Go server running at http://0.0.0.0:${PORT}`);
  });
}

startServer();
