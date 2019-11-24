let MathFunctions = Object.getOwnPropertyNames(Math);

class MathFunction {
    constructor(name, equation, color, lineWidth, showPoints, pointWidth, pointColor, normalize, arrowAngle, arrowHeight) {
        this.name = name;
        this.equation = equation;
        this.color = color;
        this.lineWidth = lineWidth || 1;
        this.showPoints = showPoints !== false;
        this.pointWidth = pointWidth === undefined ? 5 : 0;
        this.pointColor = pointColor || this.color;
        this.normalize = normalize !== false;
        this.arrowAngle = arrowAngle === undefined ? Math.PI / 8 : arrowAngle;
        this.arrowHeight = arrowHeight === undefined ? 0.25 : arrowHeight;

        this.parameters = undefined;
        this.jsEquation = undefined;
        this.prepared = false;
        this.outdated = false;
    }

    requires(parameter) {
        this.prepare();

        return this.parameters.has(parameter);
    }

    prepare() {
        if (this.prepared && !this.outdated) {
            return this;
        }

        var eq = this.equation;

        for (var idx in MathFunctions) {
            eq = eq.replace(new RegExp(MathFunctions[idx], 'g'), 'Math.' + MathFunctions[idx]);
        }

        this.parameters = new Set();
        let match, regex = /\{(\w+?)\}/g;
        while ((match = regex.exec(this.equation)) !== null) {
            this.parameters.add(match[1]);
        }

        for (let parameter of this.parameters.values()) {
            eq = eq.replace(
                new RegExp('\{' + parameter + '\}', 'g'),
                'this.' + parameter
            );
        }

        //eq = eq.replace('integral', 'this.integral');
        //eq = eq.replace(/(\d+)\:(\d+)\:(\d+)/g, '(new MathRange($1, $3, $2))');


        this.jsEquation = function(){return eval(eq)};
        console.log(eq);

        this.prepared = true;
        this.outdated = false;

        return this;
    }

    outdate() {
        this.outdated = true;

        return this;
    }

    evaluate(args) {
        this.prepare();
        //args.integral = this.integralInterpreter.bind(this);

        return this.jsEquation.apply(args);
    }
/*
    integralInterpreter(overAxis, eq, range) {
        console.log(overAxis, eq, range);
    }
*/

    evaluateVector(args) {
        let vx = this.evaluate(Object.assign({}, args, {'x': args.x - args.dx})),
            vy = this.evaluate(Object.assign({}, args, {'y': args.y - args.dy})),
            val = this.evaluate(args);

        return new Vector2(
            (vx - val) / args.dx,
            (vy - val) / args.dy
        );
    }

    integrate(overAxis, range, args) {
        let sum = 0;
        let context = $.extend({}, args);

        overAxis.for(
            (current) => {
                context[overAxis.name] = current;
                var val = this.evaluate(context);
                if (isNaN(val)) {
                    return;
                }
                sum += val;
            },
            range
        );

        return sum;
    }

    isAnimated() {
        return this.requires('time') || this.requires('dtime');
    }

    renderSegment(ctxt, space, args1, args2) {
        let val1, val2,
            p1, p2;

        if (args1) {
            val1 = this.evaluate(args1);
            if (!isNaN(val1)) {
                p1 = space.applyTransformation(
                    space.mergeContextAndVector(args1, new Vector2(args1.x, val1))
                );
            }
        }

        if (args2) {
            val2 = this.evaluate(args2);
            if (!isNaN(val2)) {
                p2 = space.applyTransformation(
                    space.mergeContextAndVector(args2, new Vector2(args2.x, val2))
                );
            }
        }

        if (!p1 || !p2 || p1.isNaV() || p2.isNaV()) {
            return this;
        }

        ctxt.save();
        ctxt.strokeStyle = this.color;
        if (this.lineWidth !== undefined) {
            ctxt.lineWidth = this.lineWidth;
        }

        ctxt.beginPath();
        ctxt.moveTo(p1.x, p1.y);
        ctxt.lineTo(p2.x, p2.y);
        ctxt.stroke();
        ctxt.restore();

        if (this.showPoints) {
            if (p2) {
                this.renderPoint(ctxt, p2.x, p2.y);
            } else if (p1) {
                this.renderPoint(ctxt, p1.x, p1.y);
            }
        }

        return this;
    }

    renderPoint(ctxt, x, y) {
        let margin = Math.round(this.pointWidth / 2);

        ctxt.fillStyle = this.pointColor;
        ctxt.fillRect(x - margin, y - margin, this.pointWidth, this.pointWidth);

        return this;
    }

    renderVector(ctxt, space, args) {
        if (!args || args.dx == 0 || args.dy == 0) {
            return this;
        }

        let vector = this.evaluateVector(args);

        if (vector instanceof Vector2 && (vector.isNaV() || (vector.x == 0 && vector.y == 0))) {
            return this;
        }

        // console.log(previousArgs, previousVal, args, val, vector);

        if (this.normalize) {
            vector = vector.normalize();
        }

        let point = new Vector2(args.x - args.dx / 2, args.y - args.dy / 2);
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
