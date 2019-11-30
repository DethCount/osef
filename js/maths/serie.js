class Serie extends MathFunction {
    constructor(name, equation, rangeName, range, initialValue, color, lineWidth, showPoints, pointWidth, pointColor, normalize, arrowAngle, arrowHeight) {
        super(name, equation, color, lineWidth, showPoints, pointWidth, pointColor, normalize, arrowAngle, arrowHeight);
        this.rangeName = rangeName;
        this.range = range;
        this.initialValue = initialValue || 0;
        if (!(this.range instanceof MathRange)) {
            throw new Error('Missing range');
        }
    }

    prepare() {
        super.prepare();

        this.parameters.add(this.rangeName);
    }

    evaluate(context) {
        let prevTime = this.range.previous(context[this.rangeName]);
        if (prevTime === undefined) {
            return this.initialValue;
        }

        context.first = this.initialValue;
        let prevContext = Object.assign({}, context);
        prevContext[this.rangeName] = prevTime;
        context.prev = this.evaluate(prevContext);

        let val = super.evaluate(context);

        return val;
    }
}
