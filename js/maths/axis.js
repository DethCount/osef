class Axis extends MathRange {
    constructor(name, basis, min, max, steps, color, precision) {
        super(min, max, steps);

        this.name = name;
        this.basis = basis ? basis.normalize() : undefined;
        this.min = undefined === min ? -100 : min;
        this.max = undefined === max ? 100 : max;
        this.steps = undefined === steps ? 200 : steps;
        this.color = color || 'black';
        this.precision = precision === undefined ? 6 : 1*precision;
    }

    length() {
        return this.max - this.min;
    }

    isOutside(val) {
        return val < this.min || val > this.max;
    }

    stepLength() {
        return this.length() / this.steps;
    }
}
