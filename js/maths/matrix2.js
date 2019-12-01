class Matrix2 {
    constructor(vector0, vector1) {
        this.x = vector0 || new Vector2(); // row vector
        this.y = vector1 || new Vector2();
    }

    transpose() {
        return new Matrix2(
            new Vector2(this.x.x, this.y.x),
            new Vector2(this.x.y, this.y.y)
        );
    }

    isNaM() {
        return this.x.isNaV() || this.y.isNaV();
    }

    add(tensor) {
        if (!isNaN(tensor)) {
            return new Matrix2(
                this.x.add(tensor),
                this.x.add(tensor)
            );
        }

        return new Matrix2(
            this.x.add(tensor.x),
            this.y.add(tensor.y)
        );
    }

    multiply(tensor) {
        return new Vector2(
            tensor.x * this.x.x + tensor.y * this.x.y,
            tensor.x * this.y.x + tensor.y * this.y.y
        );
    }

    equals(tensor) {
        if (!isNaN(tensor)) {
            return this.x.equals(tensor) && this.y.equals(tensor);
        }

        return this.x.equals(tensor.x) && this.y.equals(tensor.y);
    }

    normalize() {
        var len = this.length();

        return new Matrix2(
            new Vector2(this.x.x/len, this.x.y/len),
            new Vector2(this.y.x/len, this.y.y/len),
        );
    }

    lengthSquared() {
        return this.x.x * this.x.x + this.x.y * this.x.y
            + this.y.x * this.y.x + this.y.y * this.y.y;
    }

    length() {
        return Math.sqrt(this.lengthSquared());
    }

    clone() {
        return new Matrix2(
            this.x.clone(),
            this.y.clone()
        );
    }

    sumRows() {
        return this.x.add(this.y);
    }
}
