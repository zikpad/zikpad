/**
 * An abstract command in the software, that can be done and undone
 */
export abstract class Command {
    public abstract do();
    public abstract undo();
}