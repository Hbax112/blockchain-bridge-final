import express from "express";
import { exec } from "child_process";
import util from "util";
import cors from "cors";
import fs from "fs";

const execAsync = util.promisify(exec);
const app = express();

const bridgeScriptPath = "./bridge.sh"; 

// CORS configuration
app.use(
  cors({
    origin: ["http://localhost:5173"], 
    methods: ["GET", "POST", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// Handle preflight (OPTIONS) requests
app.options("*", cors());

app.use(express.json()); // Parse JSON request bodies

// Debugging Middleware: Log incoming requests
app.use((req, res, next) => {
  console.log(`Incoming request: ${req.method} ${req.url}`);
  console.log("Headers:", req.headers);
  console.log("Body:", req.body);
  next();
});

// Error logging middleware
const logger = fs.createWriteStream('server.log', { flags: 'a' });
app.use((err, req, res, next) => {
  logger.write(`Error: ${err.message}\n${err.stack}\n`);
  res.status(500).send('Something broke!');
});

/**
 * Mint tokens via bridge.sh
 */
app.post("/api/mint", async (req, res) => {
  const { recvAddress, amount, destinationChain } = req.body;

  if (!recvAddress || !amount || !destinationChain) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  let command;

  if (destinationChain === "Sui") {
    command = `bash ${bridgeScriptPath} mint ${amount} ${recvAddress} sui`;
  } else if (destinationChain === "Ethereum") {
    command = `bash ${bridgeScriptPath} eth ${amount} ${recvAddress}`;
  } else {
    return res.status(400).json({ error: "Invalid destination chain" });
  }

  try {
    console.log("Executing command:", command);
    const { stdout, stderr } = await execAsync(command);
    if (stderr) {
      console.error("Mint command error:", stderr);
      return res.status(500).json({ error: stderr });
    }
    console.log("Mint command output:", stdout);
    res.json({ message: "Mint operation successful", output: stdout });
  } catch (error) {
    console.error("Error executing mint command:", error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * Burn tokens via bridge.sh
 */
app.post("/api/burn", async (req, res) => {
  const { amount, userAddress, coinObjectId } = req.body;

  if (!amount || !userAddress || !coinObjectId) {
    console.log("Missing fields:", { amount, userAddress, coinObjectId });
    return res.status(400).json({ error: "Missing required fields" });
  }

  let command = `bash ${bridgeScriptPath} burn ${amount} ${userAddress} ${coinObjectId}`;

  try {
    console.log("Executing command:", command);
    const { stdout, stderr } = await execAsync(command);
    if (stderr) {
      console.error("Burn command stderr:", stderr);
      return res.status(500).json({ error: `stderr: ${stderr}` });
    }
    console.log("Burn command stdout:", stdout);
    res.json({ message: "Burn operation successful", output: stdout });
  } catch (error) {
    console.error("Error executing burn command:", error);
    res.status(500).json({ error: `message: ${error.message}, stderr: ${error.stderr}` });
  }
  
});

// Route to check if 'sui' is in PATH
app.get("/api/check-sui", async (req, res) => {
  try {
    const { stdout } = await execAsync("which sui");
    res.json({ path: stdout.trim() || "sui not found in PATH" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Start the server
app.listen(3000, () => {
  console.log("Server is running on port 3000");
});