class Axis extends MathRange {
    constructor(name, basis, min, max, steps, color, precision) {
        super(min, max, steps);

        this.name = name;
        this.basis = basis.normalize();
        this.color = color || 'black';
        this.precision = precision === undefined ? 6 : 1*precision;
    }

    length() {
        return this.max - this.min;
    }

    isOutside(val) {
        return val < this.min || val > this.max;
    }
}
