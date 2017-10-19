"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const path = require("path");
const sudoPrompt = require('sudo-prompt');
const spawn = require('child_process').spawn;
// start the process
function startSettingProcess(port, args) {
    installProxyConfHelperIfNeeded().then(() => {
        spawnChildProcessWithTrace('proxy_conf_helper', ['-m', 'global', '--port', port.toString()]);
    });
}
exports.startSettingProcess = startSettingProcess;
function stopProxy() {
    let proxyConfHelperPath = getBinaryPath('proxy_conf_helper');
    const proxyConfHelperProcess = spawn(proxyConfHelperPath, ['--mode', 'off']);
}
exports.stopProxy = stopProxy;
function spawnChildProcessWithTrace(fileName, args) {
    // TODO: it's confusing where file is the short filename vs full path
    let fullPath = getBinaryPath(fileName);
    const process = spawn(getBinaryPath(fileName), args);
    process.stdout.on('data', (data) => {
        console.log(`${fileName}: stdout: ${data}`);
    });
    process.stderr.on('data', (data) => {
        console.error(`${fileName}: stderr: ${data}`);
    });
    process.on('close', (code) => {
        console.log(`${fileName}: exited with code ${code}`);
    });
}
function getBinaryPath(file) {
    return path.join(__dirname, 'binaries/' + file);
}
function runUnixCommand(command, args, env) {
    // TODO: use exec or execFile instead of spawn, since exec waits for it to finish...
    // TODO: this should rely on exit code, not trace!!!!!  otherwise if there is a lot of trace this will break
    return new Promise((fulfill, reject) => {
        const process = spawn(command, args, { env: env });
        process.stdout.on('data', (data) => {
            // Remove trailing \n
            fulfill(data.toString().replace(/\n$/, ''));
        });
        process.stderr.on('data', (data) => {
            reject(data);
        });
    });
}
function installProxyConfHelperIfNeeded() {
    const proxyConfHelperPath = getBinaryPath('proxy_conf_helper');
    return new Promise((fulfill, reject) => {
        runUnixCommand(getBinaryPath('is_proxy_conf_helper_installed.sh'), [], { PROXY_CONF_HELPER_PATH: proxyConfHelperPath })
            .then((response) => {
            if (response == 'true') {
                // already installed
                fulfill();
                return;
            }
            // Need to install using sudo.
            let options = { name: 'uProxy Server Manager' };
            let proxyConfHelperInstallerPath = getBinaryPath('proxy_conf_helper_install.sh');
            let proxyConfHelperInstallerCommand = `PROXY_CONF_HELPER_PATH="${proxyConfHelperPath}" "${proxyConfHelperInstallerPath}"`;
            sudoPrompt.exec(proxyConfHelperInstallerCommand, options, (err, stdout, stderr) => {
                if (err) {
                    reject(err);
                }
                else {
                    fulfill();
                }
            });
        }).catch((e) => {
            // TODO: handle error
        });
    });
}
