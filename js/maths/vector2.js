class Vector2 {
    constructor(x, y) {
        this.x = undefined === x ? 0 : (isNaN(x) ? Number.NaN : x);
        this.y = undefined === y ? 0 : (isNaN(y) ? Number.NaN : y);
    }

    isNaV() {
        return isNaN(this.x) || isNaN(this.y);
    }

    add(vector) {
        if (!(vector instanceof Object)) {
            return new (this.constructor)(
                this.x + vector,
                this.y + vector
            );
        }

        return new (this.constructor)(
            this.x + vector.x,
            this.y + vector.y
        );
    }

    sub(vector) {
        if (!(vector instanceof Object)) {
            return new (this.constructor)(
                this.x - vector,
                this.y - vector
            );
        }

        return new (this.constructor)(
            this.x - vector.x,
            this.y - vector.y
        );
    }

    multiply(vector) {
        if (vector instanceof Vector2) {
            return new (this.constructor)(
                this.x * vector.x,
                this.y * vector.y
            );
        }

        if (!(vector instanceof Object)) {
            return new (this.constructor)(
                this.x * vector,
                this.y * vector
            );
        }

        return new (this.constructor)(
            this.x * vector[0].x + this.y * vector[1].x,
            this.x * vector[0].y + this.y * vector[1].y
        );
    }

    divide(vector) {
        if (vector instanceof Vector2) {
            return new (this.constructor)(
                this.x / vector.x,
                this.y / vector.y
            );
        }

        if (!(vector instanceof Object)) {
            return new (this.constructor)(
                this.x / vector,
                this.y / vector
            );
        }

        return new (this.constructor)(
            this.x / vector[0].x + this.y / vector[0].y,
            this.x / vector[1].x + this.y / vector[1].y
        );
    }

    equals(tensor) {
        if (!isNaN(tensor)) {
            return this.x == tensor && this.y == tensor;
        }

        return this.x == tensor.x && this.y == tensor.y;
    }

    lengthSquared() {
        return this.x * this.x + this.y * this.y;
    }

    length() {
        return Math.sqrt(this.lengthSquared());
    }

    normalize() {
        return this.divide(this.length());
    }

    clone() {
        return new (this.constructor)(this.x, this.y);
    }

    round() {
        return new (this.constructor)(Math.round(this.x), Math.round(this.y));
    }
}
