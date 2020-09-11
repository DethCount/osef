class Axis3dRenderer {
    constructor(axisUI, ctxt) {
        this.axisUI = axisUI;
        this.ctxt = ctxt;

        this.program = new Math3dProgramLine(this.ctxt, this.axisUI.axis.color);
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

            vertices.push(vector.x, vector.y);

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
                vector.x, vector.y,
                vector2.x, vector2.y
            );
        });

        if (vertices.length > 2) {
            this.program.draw(undefined, new Float32Array(vertices), undefined);
            this.program.draw(undefined, new Float32Array(markers), undefined, this.ctxt.LINES);
        }
    }
}
