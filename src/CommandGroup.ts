import { Command } from "./Command.js";

export class CommandGroup implements Command {
    readonly commands: Array<Command> = [];


    do() {
        for (let i = 0; i < this.commands.length; i++)
            this.commands[i].do();
    }



    undo() {
        for (let i = this.commands.length - 1; i >= 0; i--)
            this.commands[i].undo();
    }
}