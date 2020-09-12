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
        // console.log('Particle3dRenderer:render', particle, space, context);

        //let margin = particle.size.divide(2).round();
        let m = Math.max(space.getAxisByName('x').stepLength(), space.getAxisByName('y').stepLength());
        m /= 25;
        let margin = new Vector2(m, m);

        // console.log(margin);

        let bl = space.applyTransformation(
            space.mergeContextAndVector(
                context,
                particle.pos.sub(margin)
            )
        );

        let tr = space.applyTransformation(
            space.mergeContextAndVector(
                context,
                particle.pos.add(margin)
            )
        );

        if (bl.isNaV() || tr.isNaV()) {
            particle.reset();
            return this;
        }

        if (!this.program) {
            this.program = new Math3dProgramTriangles(this.ctxt);
        }

        // console.log('Particle3dRenderer:render', margin, bl, tr);

        let triangles = [
            tr.x, tr.y,
            tr.x, bl.y,
            bl.x, bl.y,

            bl.x, bl.y,
            bl.x, tr.y,
            tr.x, tr.y
        ];

        // console.log(triangles);

        this.program.draw(
            particle.color,
            new Float32Array(triangles),
            undefined
        );

        if (space.isOutside(particle.pos)) {
            particle.reset();
        }

        return this;
    }
}
