class Axis2dRenderer {
    constructor(axisUI, ctxt) {
        this.axisUI = axisUI;
        this.ctxt = ctxt;
    }

    render(context) {
        let x = Math.abs(this.axisUI.axis.basis.x),
            y = Math.abs(this.axisUI.axis.basis.y);

        this.ctxt.font = this.axisUI.fontSize + 'px ' + this.axisUI.fontFamily;
        this.ctxt.strokeStyle = this.axisUI.color;
        this.ctxt.lineWidth = this.axisUI.lineWidth;

        let previousPos, textWidth;

        this.axisUI.axis.each((i) => {
            if (i == 0) {
                return;
            }

            let vector = this.axisUI.space.applyTransformation(
                this.axisUI.space.mergeContextAndVector(
                    context,
                    new Vector2(i * x, i * y)
                )
            );

            if (previousPos) {
                this.ctxt.beginPath();
                this.ctxt.moveTo(previousPos.x, previousPos.y);
                this.ctxt.lineTo(vector.x, vector.y);
                this.ctxt.stroke();
            }
            //console.log(this.axisUI.axis.name, previousPos, vector);

            this.ctxt.beginPath();
            this.ctxt.moveTo(vector.x, vector.y);
            let vector2 = this.axisUI.space.applyTransformation(
                this.axisUI.space.mergeContextAndVector(
                    context,
                    new Vector2(i * x + this.axisUI.markerLength * y, i * y + this.axisUI.markerLength * x)
                )
            );

            this.ctxt.lineTo(vector2.x, vector2.y);
            this.ctxt.stroke();

            let prec = Math.pow(10, this.axisUI.precision);
            this.ctxt.fillText(
                Math.round(i*prec)/prec,
                vector.x
                    - x * this.axisUI.axisPadding
                    - this.axisUI.otherAxisPadding * y
                    - Math.round(this.ctxt.measureText(i == 1).width / 2),
                vector.y
                    + y * this.axisUI.axisPadding
                    + this.axisUI.otherAxisPadding * x
                    + Math.round(this.axisUI.fontSize / 2)
            );

            previousPos = vector.clone();
        });
    }
}
