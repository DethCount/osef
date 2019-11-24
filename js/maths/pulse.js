class Pulse {
    constructor(fun, integrationAxis) {
        this.fun = fun;
        this.integrationAxis = integrationAxis;

        Object.defineProperty(this, 'particles', {
            'set': (val) => {
                this.fun.particles = val;
            },
            'get': () => {
                return this.fun.particles;
            }
        });

        Object.defineProperty(this, 'particlesCtxt', {
            'set': (val) => {
                this.fun.particlesCtxt = val;
            },
            'get': () => {
                return this.fun.particlesCtxt;
            }
        });

        Object.defineProperty(this, 'name', {
            'set': (val) => {
                this.fun.name = val;
            },
            'get': () => {
                return this.fun.name;
            }
        });

        Object.defineProperty(this, 'color', {
            'set': (val) => {
                this.fun.color = val;
            },
            'get': () => {
                return this.fun.color;
            }
        });
    }

    requires(varName) {
        return this.fun.requires(varName);
    }

    evaluate(args) {
        console.log('evaluate pulse', args);
        var it = Math.floor(args[this.integrationAxis.name]);

        return this.fun.integrate(
            this.integrationAxis,
            this.integrationAxis.partial(0, it),
            args
        );
    }

    outdate() {
        this.fun.outdate();

        return this;
    }

    renderSegment(ctxt, space, args1, args2) {
        let val1, val2,
            p1, p2;

        if (args1) {
            val1 = this.evaluate(args1);
            if (val1) {
                p1 = space.applyTransformation(space.mergeContextAndVector(args1, new Vector2(args1.x, val1)));
            }
        }

        if (args2) {
            val2 = this.evaluate(args2);
            if (val2) {
                p2 = space.applyTransformation(space.mergeContextAndVector(args2, new Vector2(args2.x, val2)));
            }
        }

        if (!p1 || !p2 || p1.isNaV() || p2.isNaV()) {
            return this;
        }

        ctxt.save();
        ctxt.strokeStyle = this.fun.color;
        if (this.lineWidth !== undefined) {
            ctxt.lineWidth = this.fun.lineWidth;
        }

        ctxt.beginPath();
        ctxt.moveTo(p1.x, p1.y);
        ctxt.lineTo(p2.x, p2.y);
        ctxt.stroke();
        ctxt.restore();

        if (this.fun.showPoints) {
            if (p2) {
                this.renderPoint(ctxt, p2.x, p2.y);
            } else if (p1) {
                this.renderPoint(ctxt, p1.x, p1.y);
            }
        }

        return this;
    }

    renderPoint(ctxt, x, y) {
        let margin = Math.round(this.fun.pointWidth / 2);

        ctxt.fillStyle = this.fun.pointColor;
        ctxt.fillRect(x - margin, y - margin, this.fun.pointWidth, this.fun.pointWidth);
    }

    renderVector(ctxt, space, previousArgs, args) {
        let vector;

        if (this.fun instanceof MatrixField) {
            this.fun.renderIntegralVectors(space, previousArgs, args);

            return this;
        } else if (this.fun instanceof VectorField) {
            args = args || previousArgs;
            vector = this.evaluate(args);
        } else {
            if (!args || args.dx == 0 || args.dy == 0) {
                return this;
            }

            let vx = this.evaluate(Object.assign({}, args, {'x': args.x - args.dx})),
                vy = this.evaluate(Object.assign({}, args, {'y': args.y - args.dy})),
                val = this.evaluate(args);

            vector = new Vector2(
                (vx - val) / args.dx,
                (vy - val) / args.dy
            );
        }

        if (vector instanceof Vector2 && (vector.isNaV() || (vector.x == 0 && vector.y == 0))) {
            return this;
        }

        // console.log(previousArgs, previousVal, args, val, vector);

        if (this.fun.normalize) {
            vector = vector.normalize();
        }

        let point = new Vector2(args.x - args.dx / 2, args.y - args.dy / 2);
        let point1 = space.applyTransformation(space.mergeContextAndVector(args, point));
        let point2 = space.applyTransformation(space.mergeContextAndVector(args, point.add(vector)));
        let vector2 = space.applyTransformation(space.mergeContextAndVector(args, vector));

        ctxt.save();
        ctxt.strokeStyle = this.fun.color;

        if (this.lineWidth) {
            ctxt.lineWidth = this.fun.lineWidth;
        }

        ctxt.beginPath();
        ctxt.moveTo(point1.x, point1.y);
        ctxt.lineTo(point2.x, point2.y);
        ctxt.stroke();

        let l = vector.length();

        let cosTheta = Math.cos(this.fun.arrowAngle),
            sinTheta = Math.sin(this.fun.arrowAngle);

        let vector3 = space.applyTransformation(
            space.mergeContextAndVector(
                args,
                point
                    .add(vector)
                    .sub(
                        (new Matrix2(new Vector2(cosTheta, sinTheta), new Vector2(-sinTheta, cosTheta)))
                            .multiply(vector)
                            .multiply(this.fun.arrowHeight)
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
                            .multiply(this.fun.arrowHeight)
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

    renderParticles(space, time) {
        this.fun.renderParticles(space, time);

        return this;
    }

    resetParticles(space) {
        this.fun.resetParticles(space);

        return this;
    }

    toggleParticules(toggle) {
        this.fun.toggleParticules(toggle);

        return this;
    }

    toggleCanvas(toggle) {
        if (!this.ctxt) {
            return this;
        }

        $(this.ctxt.canvas).toggle(toggle);

        return this;
    }
}
