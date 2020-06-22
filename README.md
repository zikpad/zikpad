# Musicwriterpad

Musicwriterpad is an idea of a software to help to write music in Lilypond. See 
https://www.youtube.com/watch?v=uuk4u1xzcrg


# install electron

https://zestedesavoir.com/tutoriels/996/vos-applications-avec-electron/
Electron uses main.js in the main. The rest of the application is in Typescript.

At some point, I want to use robotjs. You need to install that:
sudo dnf install libXtst-devel

But npm install robotjs failed. :(. The NPM package system is very cryptic. Here are the commands I run:
npm install --save Robot/robot-js#dev
sudo dnf install libXinerama-devel
Problem of NODE_MODULE_VERSION 80 that should be 64 for an obscure reason.
sudo dnf install node-gyp



# Webpack

npx webpack


# Compile

The command tsc compiles all *.ts (for instance main.ts).




# Vexflow

At the beginning, I wanted to use Vexflow to display musical elements but I had difficulties to give custom positions to the different object. However, Vexflow is very nice. You may find some help here:
https://www.javascripting.com/view/vexflow



# Generate the packages
 npm run create-installer-win
 npm run create-debian-installer
