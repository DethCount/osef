class Axis3dRenderer {
    constructor(axisUI, ctxt) {
        this.axisUI = axisUI;
        this.ctxt = ctxt;

        this.program = new WebGLProgramLine(this.ctxt, this.axisUI.axis.color);
    }

    render(context) {
        if (undefined === this.axisUI.axis.basis || this.axisUI.axis.basis.isNaV()) {
            console.warn('axis has no basis', this.axisUI.axis.name);
            return;
        }

        let vertices = [];
        let markers = [];
        this.axisUI.axis.each((i) => {
            if (i == 0) {
                return;
            }

            let vector = this.axisUI.space.applyTransformation(
                this.axisUI.space.mergeContextAndVector(
                    context,
                    new Vector2(i * this.axisUI.axis.basis.x, i * this.axisUI.axis.basis.y)
                )
            );

            if (vector.isNaV()) {
                return;
            }

            vertices.push(
                (vector.x / (0.5 * this.ctxt.canvas.width)) - 1, 
                (vector.y / (0.5 * this.ctxt.canvas.height)) - 1
            );

            let vector2 = this.axisUI.space.applyTransformation(
                this.axisUI.space.mergeContextAndVector(
                    context,
                    new Vector2(
                        i * this.axisUI.axis.basis.x + this.axisUI.markerLength * this.axisUI.axis.basis.y, 
                        i * this.axisUI.axis.basis.y + this.axisUI.markerLength * this.axisUI.axis.basis.x
                    )
                )
            );

            markers.push(
                (vector.x / (0.5 * this.ctxt.canvas.width)) - 1, 
                (vector.y / (0.5 * this.ctxt.canvas.height)) - 1,
                (vector2.x / (0.5 * this.ctxt.canvas.width)) - 1, 
                (vector2.y / (0.5 * this.ctxt.canvas.height)) - 1
            );
        });

        if (vertices.length > 2) {
            this.program.draw(new Float32Array(vertices));
            this.program.draw(new Float32Array(markers), this.ctxt.LINES);
        }
    }
}