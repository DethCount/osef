class MatrixField extends VectorField {
    evaluate(args) {
        let matrix = new Matrix2();
        for (var idx in this.components) {
            matrix[this.components[idx].name] = this.components[idx].evaluate(args);
        }

        return matrix;
    }

    integrate(overAxis, range, args) {
        let sum = new Matrix2();

        overAxis.for(
            (current) => {
                args[overAxis.name] = current;
                var val = this.evaluate(args);
                if (!(val instanceof Matrix2)) {
                    return;
                }

                sum = sum.add(val);
            },
            range
        );

        return sum;
    }

    isAnimated(checkSpace) {
        for (var idx in this.components) {
            if(this.components[idx].isAnimated(checkSpace)) {
                return true;
            }
        }

        return false;
    }
}
