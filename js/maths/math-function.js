let MathFunctions = Object.getOwnPropertyNames(Math);

class MathFunction {
    constructor(name, equation, color, lineWidth, showPoints, pointWidth, pointColor, normalize, arrowAngle, arrowHeight) {
        this.name = name;
        this.equation = equation;
        this.color = color;
        this.lineWidth = lineWidth || 1;
        this.showPoints = showPoints !== false;
        this.pointWidth = pointWidth === undefined ? 5 : 0;
        this.pointColor = pointColor || this.color;
        this.normalize = normalize !== false;
        this.arrowAngle = arrowAngle === undefined ? Math.PI / 8 : arrowAngle;
        this.arrowHeight = arrowHeight === undefined ? 0.25 : arrowHeight;

        this.parameters = undefined;
        this.jsEquation = undefined;
        this.prepared = false;
        this.outdated = false;
    }

    requires(parameter) {
        this.prepare();

        return this.parameters.has(parameter);
    }

    prepare() {
        if (this.prepared && !this.outdated) {
            return this;
        }

        var eq = this.equation;

        for (var idx in MathFunctions) {
            eq = eq.replace(new RegExp(MathFunctions[idx], 'g'), 'Math.' + MathFunctions[idx]);
        }

        this.parameters = new Set();
        let match, regex = /\{(\w+?)\}/g;
        while ((match = regex.exec(this.equation)) !== null) {
            this.parameters.add(match[1]);
        }

        for (let parameter of this.parameters.values()) {
            eq = eq.replace(
                new RegExp('\{' + parameter + '\}', 'g'),
                'this.' + parameter
            );
        }

        //eq = eq.replace('integral', 'this.integral');
        //eq = eq.replace(/(\d+)\:(\d+)\:(\d+)/g, '(new MathRange($1, $3, $2))');


        this.jsEquation = function(){return eval(eq)};
        console.log(eq);

        this.prepared = true;
        this.outdated = false;

        return this;
    }

    outdate() {
        this.outdated = true;

        return this;
    }

    evaluate(args) {
        this.prepare();
        //args.integral = this.integralInterpreter.bind(this);

        return this.jsEquation.apply(args);
    }
/*
    integralInterpreter(overAxis, eq, range) {
        console.log(overAxis, eq, range);
    }
*/

    evaluateVector(args) {
        let vx = this.evaluate(Object.assign({}, args, {'x': args.x - args.dx})),
            vy = this.evaluate(Object.assign({}, args, {'y': args.y - args.dy})),
            val = this.evaluate(args);

        return new Vector2(
            (vx - val) / args.dx,
            (vy - val) / args.dy
        );
    }

    integrate(overAxis, range, args) {
        let sum = 0;
        let context = $.extend({}, args);

        overAxis.for(
            (current) => {
                context[overAxis.name] = current;
                var val = this.evaluate(context);
                if (isNaN(val)) {
                    return;
                }
                sum += val;
            },
            range
        );

        return sum;
    }

    isAnimated() {
        return this.requires('time') || this.requires('dtime');
    }
}
