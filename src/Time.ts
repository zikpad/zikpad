export class Time {
    static getMeasureDuration() {
        const v = (<HTMLSelectElement> document.getElementById("time")).value.split("/");
        return parseInt(v[0]) / parseInt(v[1]);
    }

    static getMeasureNumber(t: number) {
        return Math.floor(t / Time.getMeasureDuration());
    }
}