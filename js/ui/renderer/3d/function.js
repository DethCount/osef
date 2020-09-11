class Function3dRenderer {
    constructor(funUI) {
        this.funUI = funUI;
        this.ctxt = this.funUI.$canvas.get(0).getContext('webgl2');

        console.warn('todo function particle renderer');
        /*
        if (this.funUI.$particlesCanvas && this.funUI.$particlesCanvas.length) {
            this.particleRenderer = new Particle3dRenderer(
                this.funUI.$particlesCanvas.get(0).getContext('webgl2')
            );
        }
        */

        console.log(this.funUI.space)
    }

    clear(context) {
        this.ctxt.clearColor(0, 0, 0, 0);
        this.ctxt.clear(this.ctxt.COLOR_BUFFER_BIT);

        if (this.particleRenderer) {
            this.particleRenderer.clear();
        }
    }

    render(context, prevContext) {
        console.log('function render', this.funUI.fun.equation, context, prevContext);
        this.clear(context);

        if (!this.lineProgram) {
            this.lineProgram = new Math3dProgramLine(this.ctxt, this.funUI.color);
        }

        let vertices = [];

        context = context || {};
        this.funUI.space.getAxisByName('x').each((x) => {
            context.x = x;

            let val = this.funUI.fun.evaluate(context);

            if (isNaN(val)) {
                return;
            }

            let vector = this.funUI.space.applyTransformation(
                this.funUI.space.mergeContextAndVector(
                    context,
                    new Vector2(x, val)
                )
            );
            //console.log('fun v', x, val, vector.clone());

            if (vector.isNaV()) {
                return;
            }

            vertices.push(vector.x, vector.y);
        });

        if (vertices.length > 0) {
            this.lineProgram.draw(new Float32Array(vertices));
        }
    }

    renderSegment(p1, p2) {
        if (!p1 || !p2 || p1.isNaV() || p2.isNaV() || p1.equals(p2)) {
            return this;
        }
        console.log('renderSegment', p1, p2);

        if (!this.lineProgram) {
            this.lineProgram = new Math3dProgramLine(this.ctxt, this.funUI.color);
        }

        this.lineProgram.draw(new Float32Array([p1.x, p1.y, p2.x, p2.y]));

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
        console.log('renderPoint', x, y);
        if (!this.lineProgram) {
            this.lineProgram = new Math3dProgramLine(this.ctxt, this.funUI.color);
        }

        let margin = Math.round(this.funUI.pointWidth / 2);
        let xml = x - margin, xmt = x + margin;
        let yml = y - margin, ymt = y + margin;

        let triangles = [
            xmt, ymt,
            xmt, yml,
            xml, yml,

            xml, yml,
            xml, ymt,
            xmt, ymt
        ];

        this.lineProgram.draw(new Float32Array(triangles), this.ctxt.TRIANGLES);

        return this;
    }

    renderVector(args) {
        console.warn('todo renderVector', args);
        /*
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
        */

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
