class VectorField3dRenderer {
    constructor(vfUI) {
        this.vfUI = vfUI;
        this.ctxt = this.vfUI.$canvas.get(0).getContext('webgl2');

        if (this.vfUI.$particlesCanvas && this.vfUI.$particlesCanvas.length) {
            this.particleRenderer = new Particle3dRenderer(this.vfUI.$particlesCanvas.get(0).getContext('webgl2'));
        }

        this.program = undefined;
    }

    clearParticles() {
        this.ctxt.clearColor(0, 0, 0, 0);
        this.ctxt.clear(this.ctxt.COLOR_BUFFER_BIT);

        if (this.particleRenderer) {
            this.particleRenderer.clear();
        }

        return this;
    }

    render(context, prevContext, withParticles) {
        let vector = this.vfUI.vf.evaluate(context);
        // console.log('render', context, vector);

        if (vector instanceof Vector2 && (vector.isNaV() || (vector.x == 0 && vector.y == 0))) {
            return this;
        }

        if (undefined == this.program) {
            this.program = new Math3dProgramLine(this.ctxt, this.vfUI.color);
        }

        if (this.vfUI.normalize) {
            vector = vector.normalize();
        }

        let point = new Vector2(context.x, context.y);
        let point1 = this.vfUI.space.applyTransformation(this.vfUI.space.mergeContextAndVector(context, point));
        let point2 = this.vfUI.space.applyTransformation(this.vfUI.space.mergeContextAndVector(context, point.add(vector)));
        let vector2 = this.vfUI.space.applyTransformation(this.vfUI.space.mergeContextAndVector(context, vector));
        let vertices = [];

        if (!(
            point.isNaV()
            || point1.isNaV()
            || point2.isNaV()
            || vector2.isNaV()
        )) {
            vertices.push(
                point1.x, point1.y,
                point2.x, point2.y
            );

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

            vertices.push(
                point2.x, point2.y,
                vector3.x, vector3.y
            );

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

            vertices.push(
                point2.x, point2.y,
                vector4.x, vector4.y
            );

            // console.log('draw vectors', vertices);
            this.program.draw(undefined, new Float32Array(vertices), undefined, this.ctxt.LINES);
        }

        if (withParticles !== false && (this.vfUI.viewState == 'visible' || this.vfUI.viewState == 'points') && this.particleRenderer != undefined) {
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
        console.log('renderParticle', particle, context);
        this.particleRenderer.render(particle, this.vfUI.space, context);
    }
}
