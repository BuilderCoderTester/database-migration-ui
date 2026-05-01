const { app, BrowserWindow } = require('electron');
const path = require('path');
const { spawn } = require('child_process');

let backendProcess;

function startBackend() {
  const jarPath = path.join(__dirname, 'C:\Users\Sigilotech-User\IdeaProjects\database-migration-cli-tool\demo\target\demo-0.0.1-SNAPSHOT.jar');

  backendProcess = spawn('java', ['-jar', jarPath], {
    shell: true
  });

  backendProcess.stdout.on('data', data => {
    console.log(`Spring Boot: ${data}`);
  });

  backendProcess.stderr.on('data', data => {
    console.error(`Error: ${data}`);
  });
}

function createWindow() {
  const win = new BrowserWindow({
    width: 1400,
    height: 900,
    backgroundColor: "#0d0f12"
  });

  const indexPath = path.join(__dirname, '../dist/index.html');
  win.loadFile(indexPath);
}

app.whenReady().then(() => {
  startBackend();

  // wait for backend startup
  setTimeout(createWindow, 4000);
});

app.on('window-all-closed', () => {
  if (backendProcess) backendProcess.kill();
  app.quit();
});