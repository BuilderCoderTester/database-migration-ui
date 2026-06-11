const { app, BrowserWindow } = require('electron');
const path = require('path');
const { spawn } = require('child_process');
const http = require("http");

let backendProcess;

function startBackend() {
const jarPath = app.isPackaged
  ? path.join(process.resourcesPath, "backend", "Migration-0.0.2.jar")
  : path.join(__dirname, "backend", "Migration-0.0.2.jar");
console.log("__dirname:", __dirname);
  backendProcess = spawn('java', ['-jar', jarPath]);

  backendProcess.stdout.on('data', data => {
    console.log(`Spring Boot: ${data}`);
  });

  backendProcess.stderr.on('data', data => {
    console.error(`Error: ${data}`);
  });
}

function waitForBackend(callback) {
  const check = () => {
    http.get("http://localhost:8081", () => {
      console.log("Backend ready ✅");
      callback();
    }).on("error", () => {
      setTimeout(check, 1000);
    });
  };

  check();
}

function createWindow() {
  const win = new BrowserWindow({
    width: 1400,
    height: 900,
    backgroundColor: "#0d0f12"
  });

 const indexPath = path.join(__dirname, "dist", "index.html");
  console.log("the fronetnd : ",__dirname);
  win.loadFile(indexPath);
}

app.whenReady().then(() => {
  startBackend();
  waitForBackend(createWindow);
});

app.on('window-all-closed', () => {
  if (backendProcess) backendProcess.kill();
  app.quit();
});