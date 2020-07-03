# Zikpad

Zikpad is an open-source project to write music. The tool automatically detects the rhythm. It saves Lilypond files. You may try the tool here: https://zikpad.github.io/


![Screenshot](./screenshot.png)


# Local installation and Compile

https://zestedesavoir.com/tutoriels/996/vos-applications-avec-electron/
Electron uses main.js in the main. The rest of the application is in Typescript.

At some point, I want to use robotjs. You need to install that:
sudo dnf install libXtst-devel

But npm install robotjs failed. :(. The NPM package system is very cryptic. Here are the commands I run:
npm install --save Robot/robot-js#dev
sudo dnf install libXinerama-devel
Problem of NODE_MODULE_VERSION 80 that should be 64 for an obscure reason.
sudo dnf install node-gyp

The command tsc compiles all *.ts (for instance main.ts).






# Generate the packages
 npm run create-installer-win
 npm run create-debian-installer
