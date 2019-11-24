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

    render(space, previousArgs, args) {
        for (let component of this.components) {
            component.renderVector(component.ctxt, space, previousArgs, args);
        }
    }

    renderIntegralVectors(space, previousArgs, args) {
        for (let component of this.components) {
            component.renderIntegralVector(component.ctxt, space, previousArgs, args);
        }
    }

    renderParticles(space, args) {
        if (!this.particles || !this.particlesCtxt) {
            return this;
        }

        for (let particle of this.particles) {
            particle.update(args.time, space, this);
            particle.render(this.particlesCtxt, this.space, args);
        }

        return this;
    }

    toggleCanvas(toggle) {
        for (let idx in this.components) {
            this.components[idx].toggleCanvas(toggle);
        }

        return this;
    }
}
