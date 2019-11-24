class VectorField {
    constructor(name, components, color, particles, normalize, arrowAngle, arrowHeight, lineWidth) {
        this.name = name;
        this.components = components;
        this.color = color;
        this.particles = particles;
        this.normalize = normalize !== false;
        this.arrowAngle = arrowAngle === undefined ? Math.PI / 8 : arrowAngle;
        this.arrowHeight = arrowHeight === undefined ? 0.25 : arrowHeight;
        this.lineWidth = lineWidth || 1;
    }

    outdate() {
        for (var idx in this.components) {
            this.components[idx].outdate();
        }

        return this;
    }

    requires(parameter) {
        let required = false,
            i = 0;

        while(!required && i < this.components.length) {
            required = this.components[i].requires(parameter);
            i++;
        }

        return required;
    }

    evaluate(args) {
        let vector = new Vector2();
        for (var idx in this.components) {
            vector[this.components[idx].name] = this.components[idx].evaluate(args);
        }

        return vector;
    }

    integrate(overAxis, range, args) {
        let sum = new Vector2();

        overAxis.for(
            (current) => {
                args[overAxis.name] = current;
                var val = this.evaluate(args);
                if (!(val instanceof Vector2)) {
                    return;
                }

                sum = sum.add(val);
            },
            range
        );

        return sum;
    }

    isAnimated(checkSpace) {
        for(var component in this.components) {
            if (this.components[component].isAnimated(checkSpace)) {
                return true;
            }
        }

        return false;
    }

    renderVector(ctxt, space, previousArgs, args) {
        args = args || previousArgs;
        let vector = this.evaluate(args);

        if (vector instanceof Vector2 && (vector.isNaV() || (vector.x == 0 && vector.y == 0))) {
            return this;
        }

        if (this.normalize) {
            vector = vector.normalize();
        }

        let point = new Vector2(args.x, args.y);
        let point1 = space.applyTransformation(space.mergeContextAndVector(args, point));
        let point2 = space.applyTransformation(space.mergeContextAndVector(args, point.add(vector)));
        let vector2 = space.applyTransformation(space.mergeContextAndVector(args, vector));


        ctxt.save();
        ctxt.strokeStyle = this.color;

        if (this.lineWidth) {
            ctxt.lineWidth = this.lineWidth;
        }

        ctxt.beginPath();
        ctxt.moveTo(point1.x, point1.y);
        ctxt.lineTo(point2.x, point2.y);
        ctxt.stroke();

        let l = vector.length();

        let cosTheta = Math.cos(this.arrowAngle),
            sinTheta = Math.sin(this.arrowAngle);

        let vector3 = space.applyTransformation(
            space.mergeContextAndVector(
                args,
                point
                    .add(vector)
                    .sub(
                        (new Matrix2(new Vector2(cosTheta, sinTheta), new Vector2(-sinTheta, cosTheta)))
                            .multiply(vector)
                            .multiply(this.arrowHeight)
                    )
            )
        );

        ctxt.beginPath();
        ctxt.moveTo(point2.x, point2.y);
        ctxt.lineTo(vector3.x, vector3.y);
        ctxt.stroke();

        let vector4 = space.applyTransformation(
            space.mergeContextAndVector(
                args,
                point
                    .add(vector)
                    .sub(
                        (new Matrix2(new Vector2(cosTheta, -sinTheta), new Vector2(sinTheta, cosTheta)))
                            .multiply(vector)
                            .multiply(this.arrowHeight)
                    )
            )
        );

        ctxt.beginPath();
        ctxt.moveTo(point2.x, point2.y);
        ctxt.lineTo(vector4.x, vector4.y);
        ctxt.stroke();
        ctxt.restore();

        return this;
    }


    renderIntegralVector(ctxt, space, previousArgs, args) {
        args = args || previousArgs;
        var it = Math.floor(args.time);

        let vector = this.integrate(
            space.getAxisByName('time'),
            new MathRange(0, it, it + 1),
            args
        );

        if (vector instanceof Vector2 && (vector.isNaV() || (vector.x == 0 && vector.y == 0))) {
            return this;
        }

        if (this.normalize) {
            vector = vector.normalize();
        }

        let point = new Vector2(args.x, args.y);
        let point1 = space.applyTransformation(space.mergeContextAndVector(args, point));
        let point2 = space.applyTransformation(space.mergeContextAndVector(args, point.add(vector)));
        let vector2 = space.applyTransformation(space.mergeContextAndVector(args, vector));


        ctxt.save();
        ctxt.strokeStyle = this.color;

        if (this.lineWidth) {
            ctxt.lineWidth = this.lineWidth;
        }

        ctxt.beginPath();
        ctxt.moveTo(point1.x, point1.y);
        ctxt.lineTo(point2.x, point2.y);
        ctxt.stroke();

        let l = vector.length();

        let cosTheta = Math.cos(this.arrowAngle),
            sinTheta = Math.sin(this.arrowAngle);

        let vector3 = space.applyTransformation(
            space.mergeContextAndVector(
                args,
                point
                    .add(vector)
                    .sub(
                        (new Matrix2(new Vector2(cosTheta, sinTheta), new Vector2(-sinTheta, cosTheta)))
                            .multiply(vector)
                            .multiply(this.arrowHeight)
                    )
            )
        );

        ctxt.beginPath();
        ctxt.moveTo(point2.x, point2.y);
        ctxt.lineTo(vector3.x, vector3.y);
        ctxt.stroke();

        let vector4 = space.applyTransformation(
            space.mergeContextAndVector(
                args,
                point
                    .add(vector)
                    .sub(
                        (new Matrix2(new Vector2(cosTheta, -sinTheta), new Vector2(sinTheta, cosTheta)))
                            .multiply(vector)
                            .multiply(this.arrowHeight)
                    )
            )
        );

        ctxt.beginPath();
        ctxt.moveTo(point2.x, point2.y);
        ctxt.lineTo(vector4.x, vector4.y);
        ctxt.stroke();
        ctxt.restore();

        return this;
    }

    renderParticles(space, args) {
        if (!this.particles || !this.particlesCtxt) {
            return this;
        }

        for (let particle of this.particles) {
            particle.update(args.time, space, this);
            particle.render(this.particlesCtxt, space, args);
        }

        return this;
    }

    resetParticles(space, args) {
        if (!this.particles || !this.particlesCtxt) {
            return this;
        }

        for (let particle of this.particles) {
            particle.reset();
            particle.render(this.particlesCtxt, space, args);
        }

        return this;
    }

    toggleParticules(toggle) {
        if (!this.particles || !this.particlesCtxt) {
            return this;
        }
        $(this.particlesCtxt.canvas).toggle(toggle);
    }

    toggleCanvas(toggle) {
        if (!this.ctxt) {
            return this;
        }

        $(this.ctxt.canvas).toggle(toggle);

        return this;
    }
}
