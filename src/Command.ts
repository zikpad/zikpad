/**
 * An abstract command in the software, that can be done and undone
 */
export abstract class Command {
    abstract do();
    abstract undo();
}