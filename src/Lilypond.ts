import { Score } from "./Score";

export class Lilypond {
    static getLilypond(score: Score) {
        score.notes.sort((n1,n2) => n1.x - n2.x);

        let s = "";
        for(let note of score.notes) {
            s += note.getPitchName() + " ";
        }
        return s;
    }
}