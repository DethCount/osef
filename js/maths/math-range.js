class MathRange {
    constructor(min, max, steps) {
        this.min = min;
        this.max = max;
        this.steps = steps;
    }

    getIncrement() {
        return (this.max - this.min) / this.steps;
    }

    each(callback, current) {
        current = current === undefined ? this.min : current;
        do {
            callback(current);
        } while ((current = this.next(current)) != undefined);
    }

    for(callback, range) {
        range = range || this;

        var inc = range.getIncrement();

        for (var i = range.min; i <= range.max; i += inc) {
            callback(i);
            if (inc <= 0) {
                break;
            }
        }

        return this;
    }

    partial(min, max) {
        var steps = 2;
        if (min >= this.min && max <= this.max) {
            steps = ((max - min) / (this.max - this.min)) * this.steps;
        }

        return new MathRange(min, max, steps);
    }

    previous(current) {
        if (current === undefined || current <= this.min) {
            return undefined;
        }

        return current - this.getIncrement();
    }

    next(current) {
        if (current >= this.max) {
            return undefined;
        }

        return current + this.getIncrement();
    }

    length() {
        return this.max - this.min;
    }

    isOutside(val) {
        return val <= this.min || val >= this.max;
    }
}
