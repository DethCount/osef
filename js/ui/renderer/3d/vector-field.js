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
        let vector = this.vfUI.vf.evaluate(context, true);
        // console.log(this.constructor.name, 'render', this.vfUI.vf, context, vector);

        if (vector instanceof Vector2 && (vector.isNaV() || (vector.x == 0 && vector.y == 0))) {
            return this;
        }

        if (undefined == this.program) {
            this.program = new Math3dProgramLine(this.ctxt, this.vfUI.color);
        }

        if (this.vfUI.normalize) {
            vector = vector.normalize();
        }

        let tail = new Vector2(context.x, context.y);
        let head = tail.add(vector);

        let finalTail = this.vfUI.space.applyTransformation(
            this.vfUI.space.mergeContextAndVector(context, tail)
        );
        let finalHead = this.vfUI.space.applyTransformation(
            this.vfUI.space.mergeContextAndVector(context, head)
        );

        if (!(
            tail.isNaV()
            || head.isNaV()
            || finalTail.isNaV()
            || finalHead.isNaV()
        )) {
            let vertices = [
                finalTail.x, finalTail.y,
                finalHead.x, finalHead.y
            ];

            let l = vector.length();

            let cosTheta = Math.cos(this.vfUI.arrowAngle),
                sinTheta = Math.sin(this.vfUI.arrowAngle);

            let finalWing1 = this.vfUI.space.applyTransformation(
                this.vfUI.space.mergeContextAndVector(
                    context,
                    head.sub(
                        (new Matrix2(
                            new Vector2(cosTheta, sinTheta),
                            new Vector2(-sinTheta, cosTheta)
                        ))
                            .multiply(vector)
                            .multiply(this.vfUI.arrowHeight)
                    )
                )
            );

            if (!finalWing1.isNaV()) {
                vertices.push(
                    finalHead.x, finalHead.y,
                    finalWing1.x, finalWing1.y
                );
            }

            let finalWing2 = this.vfUI.space.applyTransformation(
                this.vfUI.space.mergeContextAndVector(
                    context,
                    head.sub(
                        (new Matrix2(
                            new Vector2(cosTheta, -sinTheta),
                            new Vector2(sinTheta, cosTheta)
                        ))
                            .multiply(vector)
                            .multiply(this.vfUI.arrowHeight)
                    )
                )
            );

            if (!finalWing2.isNaV()) {
                vertices.push(
                    finalHead.x, finalHead.y,
                    finalWing2.x, finalWing2.y
                );
            }

            // console.log('draw vectors', vertices);
            this.program.draw(
                undefined,
                new Float32Array(vertices),
                undefined,
                this.ctxt.LINES
            );
        }

        if (withParticles !== false
            && (this.vfUI.viewState == 'visible'
                || this.vfUI.viewState == 'points'
            )
            && this.particleRenderer != undefined
        ) {
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
        // console.log('renderParticle', particle, context);
        this.particleRenderer.render(particle, this.vfUI.space, context);
    }
}
