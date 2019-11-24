class Axis extends MathRange {
    constructor(name, basis, min, max, steps, color, precision) {
        super(min, max, steps);

        this.name = name;
        this.basis = basis.normalize();
        this.color = color || 'black';
        this.precision = precision === undefined ? 6 : 1*precision;
    }

    length() {
        return this.max - this.min;
    }

    render(ctxt, space, context, steps, markerLength, axisPadding, otherAxisPadding, fontSize, fontFamily) {
        let x = Math.abs(this.basis.x),
            y = Math.abs(this.basis.y),
            oldSteps = this.steps;

        this.steps = steps || this.steps;

        markerLength = markerLength || (this.max - this.min) / (10*steps);
        axisPadding = axisPadding || 0;
        otherAxisPadding = otherAxisPadding || 10;
        fontSize = fontSize || 12;
        fontFamily = fontFamily || 'Arial';

        ctxt.font = fontSize + 'px ' + fontFamily;
        ctxt.strokeStyle = this.color;
        ctxt.lineWidth = 1;
/*
        ctxt.beginPath();
        let vector = space.applyTransformation(space.mergeContextAndVector(context, new Vector2(x * this.min, y * this.min)));
        ctxt.moveTo(vector.x, vector.y);
        vector = space.applyTransformation(space.mergeContextAndVector(context, new Vector2(x * this.max, y * this.max)));
        ctxt.lineTo(vector.x, vector.y);
        ctxt.stroke();
*/
        let previousPos, textWidth;

        this.each((i) => {
            if (i == 0) {
                return;
            }

            let vector = space.applyTransformation(space.mergeContextAndVector(context, new Vector2(i * x, i * y)));

            if (previousPos) {
                ctxt.beginPath();
                ctxt.moveTo(previousPos.x, previousPos.y);
                ctxt.lineTo(vector.x, vector.y);
                ctxt.stroke();
            }

            ctxt.beginPath();
            ctxt.moveTo(vector.x, vector.y);
            let vector2 = space.applyTransformation(space.mergeContextAndVector(context, new Vector2(i * x + markerLength * y, i * y + markerLength * x)));
            ctxt.lineTo(vector2.x, vector2.y);
            ctxt.stroke();

            let prec = Math.pow(10, this.precision);
            ctxt.fillText(
                Math.round(i*prec)/prec,
                vector.x - x * axisPadding - otherAxisPadding * y - Math.round(ctxt.measureText(i == 1).width / 2),
                vector.y + y * axisPadding + otherAxisPadding * x + Math.round(fontSize / 2)
            );

            previousPos = vector.clone();
        });

        this.steps = oldSteps;
    }

    isOutside(val) {
        return val < this.min || val > this.max;
    }
}
