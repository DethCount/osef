class Particle3dRenderer {
    constructor(ctxt) {
        this.ctxt = ctxt;

        this.program = undefined;
    }

    clear() {
        this.ctxt.clearColor(0, 0, 0, 0);
        this.ctxt.clear(this.ctxt.COLOR_BUFFER_BIT);
    }

    render(particle, space, context) {
        let margin = particle.size.divide(2).round();
        let pos = space.applyTransformation(space.mergeContextAndVector(context, particle.pos));
        if (pos.isNaV()) {
            particle.reset();
            return this;
        }

        if (!this.program) {
            this.program = new Math3dProgramTriangles(this.ctxt);
        }

        let xml = pos.x - margin, xmt = pos.x + margin;
        let yml = pos.y - margin, ymt = pos.y + margin;

        let triangles = [
            xmt, ymt,
            xmt, yml,
            xml, yml,

            xml, yml,
            xml, ymt,
            xmt, ymt
        ];

        console.log(particle);

        this.program.draw(
            particle.color,
            triangles,
            undefined
        );

        if (space.isOutside(particle.pos)) {
            particle.reset();
        }

        return this;
    }
}
