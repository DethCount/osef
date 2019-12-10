class Particle {
    constructor(position, velocity, size, color) {
        this.initPos = this.pos = position instanceof Vector2 ? position : new Vector2();
        // console.log('new particle', position, this.pos, velocity, size, color);
        this.initV = this.v = velocity || 0;
        this.size = size instanceof Vector2 ? size : (size === undefined ? new Vector2(1, 1) : new Vector2(size, size));
        this.color = color || randomColor();
    }

    clone() {
        let c = new (this.constructor)(
            this.pos.clone(),
            this.v,
            this.size.clone(),
            this.color
        );

        c.initPos = this.initPos.clone();
        c.initV = this.initV;

        return c;
    }

    reset() {
        this.pos = this.initPos.clone();
        this.v = this.initV instanceof Vector2 ? this.initV.clone() : this.initV;
    }

    update(t, space, vectorField) {
        let vf = vectorField instanceof Pulse ? vectorField.fun : vectorField;

        let dpos = vf instanceof MathFunction
            ? vf.evaluateVector({
                'time': t,
                'x': this.pos.x,
                'y' : this.pos.y,
                'dx' : space.getAxisByName('x').getIncrement(),
                'dy' : space.getAxisByName('y').getIncrement()
            })
            : (
                vf instanceof MatrixField
                    ? vf.evaluate({'time': t, 'x': this.pos.x, 'y' : this.pos.y}).sumRows()
                    : vf.evaluate({'time': t, 'x': this.pos.x, 'y' : this.pos.y})
            );
        //console.log('dpos', dpos);

        this.pos = this.pos
            .add(dpos)
            .add(this.v);

        // console.log(this.pos.clone());

        this.v = dpos.clone();

        return this;
    }
}
