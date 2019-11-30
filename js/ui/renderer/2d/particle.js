class Particle2dRenderer {
	constructor(ctxt) {
		this.ctxt = ctxt;
	}

	clear() {
        this.ctxt.clearRect(
            0,
            0,
            this.ctxt.canvas.width,
            this.ctxt.canvas.height
        );
	}

    render(particle, space, context) {
        let margin = particle.size.divide(2).round();
        let pos = space.applyTransformation(space.mergeContextAndVector(context, particle.pos));
        if (pos.isNaV()) {
            particle.reset();
            return this;
        }

        if (particle.color) {
            this.ctxt.fillStyle = particle.color;
        }

        this.ctxt.fillRect(pos.x - margin.x, pos.y - margin.y, particle.size.x, particle.size.y);

        if (space.isOutside(particle.pos)) {
            particle.reset();
        }

        return this;
    }
}
