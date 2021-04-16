# Zikpad

Zikpad is an open-source project to write music. The tool automatically detects the rhythm. It saves Lilypond files. 


![Screenshot](./screenshot.png)

# Videos

  <iframe width="420" height="315" src="https://www.youtube.com/embed/IHud0x0stS4"></iframe>
  <iframe width="420" height="315" src="https://www.youtube.com/embed/82VYIJCKCSk"></iframe>


  
# Features

- You add notes by clicking (very simple!)
- Drag and drop notes for cut/copy/paste
- Cancel/redo
- You can insert notes by singing in the microphone
- You can listen to your music
-You add a rest by clicking on a note
- You can move notes by drag and drop
- You can copy notes (Ctrl + drag and drop of notes)
- Durations of notes are computed from the context
- Multiple voices corresponding to the color palettes
- Open and save in the Zikpad/Lilypond format (drag and drop a file to open it!)
- Any produced files can be compiled with Lilypond
- Loading Lilypond files generated by Zikpad only
- Insert time (Shift + mouse)



# Online version

You may try the tool here: https://zikpad.github.io/

# Local installation and Compile

https://zestedesavoir.com/tutoriels/996/vos-applications-avec-electron/
Electron uses main.js in the main. The rest of the application is in Typescript.
The command tsc compiles all *.ts (for instance main.ts).



# Generate the packages
 npm run create-installer-win
 npm run create-debian-installer
