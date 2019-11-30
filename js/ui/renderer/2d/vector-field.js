class VectorField2dRenderer {
    constructor(vfUI) {
        this.vfUI = vfUI;
        this.ctxt = this.vfUI.$canvas.get(0).getContext('2d');

        if (this.vfUI.$particlesCanvas && this.vfUI.$particlesCanvas.length) {
            this.particleRenderer = new Particle2dRenderer(this.vfUI.$particlesCanvas.get(0).getContext('2d'));
        }
    }

    clearParticles() {
        if (this.particlesCtxt) {
            this.particlesCtxt.clearRect(
                0,
                0,
                this.particlesCtxt.canvas.width,
                this.particlesCtxt.canvas.height
            );
        }

        return this;
    }

    render(context, prevContext, withParticles) {
        let vector = this.vfUI.vf.evaluate(context);

        if (vector instanceof Vector2 && (vector.isNaV() || (vector.x == 0 && vector.y == 0))) {
            return this;
        }

        if (this.vfUI.normalize) {
            vector = vector.normalize();
        }

        let point = new Vector2(context.x, context.y);
        let point1 = this.vfUI.space.applyTransformation(this.vfUI.space.mergeContextAndVector(context, point));
        let point2 = this.vfUI.space.applyTransformation(this.vfUI.space.mergeContextAndVector(context, point.add(vector)));
        let vector2 = this.vfUI.space.applyTransformation(this.vfUI.space.mergeContextAndVector(context, vector));

        this.ctxt.save();
        this.ctxt.strokeStyle = this.vfUI.color;

        if (this.vfUI.lineWidth) {
            this.ctxt.lineWidth = this.vfUI.lineWidth;
        }

        this.ctxt.beginPath();
        this.ctxt.moveTo(point1.x, point1.y);
        this.ctxt.lineTo(point2.x, point2.y);
        this.ctxt.stroke();

        let l = vector.length();

        let cosTheta = Math.cos(this.vfUI.arrowAngle),
            sinTheta = Math.sin(this.vfUI.arrowAngle);

        let vector3 = this.vfUI.space.applyTransformation(
            this.vfUI.space.mergeContextAndVector(
                context,
                point
                    .add(vector)
                    .sub(
                        (new Matrix2(new Vector2(cosTheta, sinTheta), new Vector2(-sinTheta, cosTheta)))
                            .multiply(vector)
                            .multiply(this.vfUI.arrowHeight)
                    )
            )
        );

        this.ctxt.beginPath();
        this.ctxt.moveTo(point2.x, point2.y);
        this.ctxt.lineTo(vector3.x, vector3.y);
        this.ctxt.stroke();

        let vector4 = this.vfUI.space.applyTransformation(
            this.vfUI.space.mergeContextAndVector(
                context,
                point
                    .add(vector)
                    .sub(
                        (new Matrix2(new Vector2(cosTheta, -sinTheta), new Vector2(sinTheta, cosTheta)))
                            .multiply(vector)
                            .multiply(this.vfUI.arrowHeight)
                    )
            )
        );

        this.ctxt.beginPath();
        this.ctxt.moveTo(point2.x, point2.y);
        this.ctxt.lineTo(vector4.x, vector4.y);
        this.ctxt.stroke();
        this.ctxt.restore();

        if (withParticles !== false && (this.vfUI.viewState == 'visible' || this.vfUI.viewState == 'points')) {
            this.clearParticles();
            this.renderParticles(context);
        }

        return this;
    }

    resetParticles(context) {
        if (!this.vfUI.particles || !this.particleRenderer) {
            return this;
        }

        for (let particle of this.vfUI.particles) {
            particle.reset();

            this.renderParticle(particle, context);
        }

        return this;
    }

    renderParticles(context) {
        if (!this.vfUI.particles || !this.particleRenderer) {
            return this;
        }

        for (let particle of this.vfUI.particles) {
            if (undefined === context || !context.hasOwnProperty('time') || this.vfUI.space.getAxisByName('time').min == context.time) {
                particle.reset();
            } else {
                particle.update(context.time, this.space, this.vf);
            }

            this.renderParticle(particle, context);
        }

        return this;
    }

    renderParticle(particle, context) {
        this.particleRenderer.render(particle, this.vfUI.space, context);
    }
}
