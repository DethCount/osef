class Function2dRenderer {
    constructor(funUI) {
        this.funUI = funUI;
        this.ctxt = this.funUI.$canvas.get(0).getContext('2d');

        if (this.funUI.$particlesCanvas && this.funUI.$particlesCanvas.length) {
            this.particleRenderer = new Particle2dRenderer(
                this.funUI.$particlesCanvas.get(0).getContext('2d')
            );
        }
    }

    clear(context) {
        this.ctxt.clearRect(
            0,
            0,
            this.ctxt.canvas.width,
            this.ctxt.canvas.height
        );

        if (this.particleRenderer) {
            this.particleRenderer.clear();
        }
    }

    render(context, prevContext) {
        if (undefined === context) {
            this.funUI.space.each((context) => {
                this.render(context, prevContext);
                prevContext = $.extend({}, context);
            });

            return this;
        }

        if (undefined === prevContext) {
            this.clear(context);
        }

        let val = this.funUI.fun.evaluate(context);
        if (isNaN(val)) {
            return this;
        }

        if (this.funUI.isVectorField()) {
            this.renderVector(context);

            return this;
        }

        if (prevContext) {
            let val1, val2,
                p1, p2;

            val1 = this.funUI.fun.evaluate(prevContext);
            if (!isNaN(val1)) {
                p1 = this.funUI.space.applyTransformation(
                    this.funUI.space.mergeContextAndVector(prevContext, new Vector2(prevContext.x, val1))
                );
            }


            val2 = this.funUI.fun.evaluate(context);
            if (!isNaN(val2)) {
                p2 = this.funUI.space.applyTransformation(
                    this.funUI.space.mergeContextAndVector(context, new Vector2(context.x, val2))
                );
            }

            this.renderSegment(p1, p2);
        }

        var p = this.funUI.space.applyTransformation(
            this.funUI.space.mergeContextAndVector(context, new Vector2(context.x, val))
        );

        if (!p.isNaV()) {
            this.renderPoint(p.x, p.y);
        }

        return this;
    }

    renderSegment(p1, p2) {
        if (!p1 || !p2 || p1.isNaV() || p2.isNaV() || p1.equals(p2)) {
            return this;
        }

        this.ctxt.save();
        this.ctxt.strokeStyle = this.funUI.color;
        if (this.funUI.lineWidth !== undefined) {
            this.ctxt.lineWidth = this.funUI.lineWidth;
        }

        this.ctxt.beginPath();
        this.ctxt.moveTo(p1.x, p1.y);
        this.ctxt.lineTo(p2.x, p2.y);
        this.ctxt.stroke();
        this.ctxt.restore();

        if (this.funUI.showPoints) {
            if (p2) {
                this.renderPoint(p2.x, p2.y);
            } else if (p1) {
                this.renderPoint(p1.x, p1.y);
            }
        }

        return this;
    }

    renderPoint(x, y) {
        let margin = Math.round(this.funUI.pointWidth / 2);

        this.ctxt.fillStyle = this.funUI.pointColor;
        this.ctxt.fillRect(x - margin, y - margin, this.funUI.pointWidth, this.funUI.pointWidth);

        return this;
    }

    renderVector(args) {
        if (!args || args.dx == 0 || args.dy == 0) {
            return this;
        }

        let vector = this.funUI.fun.evaluateVector(args);

        if (vector instanceof Vector2 && (vector.isNaV() || (vector.x == 0 && vector.y == 0))) {
            return this;
        }

        // console.log(previousArgs, previousVal, args, val, vector);

        if (this.funUI.normalize) {
            vector = vector.normalize();
        }

        let point = new Vector2(args.x - args.dx / 2, args.y - args.dy / 2);
        let point1 = this.funUI.space.applyTransformation(this.funUI.space.mergeContextAndVector(args, point));
        let point2 = this.funUI.space.applyTransformation(this.funUI.space.mergeContextAndVector(args, point.add(vector)));
        let vector2 = this.funUI.space.applyTransformation(this.funUI.space.mergeContextAndVector(args, vector));

        this.ctxt.save();
        this.ctxt.strokeStyle = this.funUI.color;

        if (this.funUI.lineWidth) {
            this.ctxt.lineWidth = this.funUI.lineWidth;
        }

        this.ctxt.beginPath();
        this.ctxt.moveTo(point1.x, point1.y);
        this.ctxt.lineTo(point2.x, point2.y);
        this.ctxt.stroke();

        let l = vector.length();

        let cosTheta = Math.cos(this.funUI.arrowAngle),
            sinTheta = Math.sin(this.funUI.arrowAngle);

        let vector3 = this.funUI.space.applyTransformation(
            this.funUI.space.mergeContextAndVector(
                args,
                point
                    .add(vector)
                    .sub(
                        (new Matrix2(new Vector2(cosTheta, sinTheta), new Vector2(-sinTheta, cosTheta)))
                            .multiply(vector)
                            .multiply(this.funUI.arrowHeight)
                    )
            )
        );

        this.ctxt.beginPath();
        this.ctxt.moveTo(point2.x, point2.y);
        this.ctxt.lineTo(vector3.x, vector3.y);
        this.ctxt.stroke();

        let vector4 = this.funUI.space.applyTransformation(
            this.funUI.space.mergeContextAndVector(
                args,
                point
                    .add(vector)
                    .sub(
                        (new Matrix2(new Vector2(cosTheta, -sinTheta), new Vector2(sinTheta, cosTheta)))
                            .multiply(vector)
                            .multiply(this.funUI.arrowHeight)
                    )
            )
        );

        this.ctxt.beginPath();
        this.ctxt.moveTo(point2.x, point2.y);
        this.ctxt.lineTo(vector4.x, vector4.y);
        this.ctxt.stroke();
        this.ctxt.restore();

        return this;
    }

    renderParticles(context) {
        if (!this.funUI.particles || !this.particleRenderer) {
            return this;
        }

        for (let particle of this.funUI.particles) {
            particle.update(context.time, this.funUI.space, this.funUI);
            this.renderParticle(particle, context);
        }

        return this;
    }

    renderParticle(particle, context) {
        this.particleRenderer
            .render(particle, this.funUI.space, context);
    }
}
