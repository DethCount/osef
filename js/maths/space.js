class Space {
    constructor(axes, parent, position, transformation, transformationObject) {
        this.axes = axes || [];
        this.axesByName = {};
        this.parent = parent;
        this.position = position;
        this.transformation = transformation;
        this.transformationObject = transformationObject;

        for (let axis of this.axes) {
            this.axesByName[axis.name] = axis;
        }
    }

    getAxisByName(name) {
        return this.axesByName.hasOwnProperty(name) ? this.axesByName[name] : null;
    }

    each (callback, context) {
        context = $.extend({time: 0, dx: 0, dy: 0, dtime: 0}, context || {});
        this.getAxisByName('x').each((x) => {
            this.getAxisByName('y').each((y) => {
                callback($.extend({}, context, {'x': x, 'y': y}));

                context.dx = this.getAxisByName('x').getIncrement();
                context.dy = this.getAxisByName('y').getIncrement();
            }, context['y']);
        }, context['x']);
    }

    getTransformation(context) {
        if (!this.transformationObject) {
            return this.transformation;
        }

        return this.transformationObject instanceof Pulse
            ? this.transformationObject.fun.integrate(
                this.getAxisByName('time'),
                new MathRange(0, Math.floor(context.time), Math.ceil(context.time)),
                context
            )
            : this.transformationObject.evaluate(context);
    }

    transformContext(context, ignoreOutside, debug) {
        let vector = new Vector2(context.x, context.y);
        debug && console.log(context, vector);
        if (false !== ignoreOutside && this.isOutside(vector)) {
            return new Vector2(Number.NaN, Number.NaN);
        }

        let transformation = this.getTransformation(context);
        debug && console.log(transformation);
        if (undefined !== transformation) {
            vector = transformation.multiply(vector);
        }
        debug && console.log(vector);

        return vector;
    }

    mergeContextAndVector(context, vector) {
        return $.extend({}, context || {}, {'x': vector.x, 'y': vector.y});
    }

    applyTransformation(context, recursive, ignoreOutside, debug) {
        let basis = this.axes[0].basis
            .add(this.axes[1].basis);

        let vector = this.transformContext(context, ignoreOutside, debug);

        vector = vector
            .sub(
                new Vector2(
                    basis.x > 0 ? this.axesByName['x'].min : this.axesByName['x'].max,
                    basis.y > 0 ? this.axesByName['y'].min : this.axesByName['y'].max
                )
            )
            .multiply(basis);


        if (this.parent) {
            vector = vector
                .multiply(
                    new Vector2(
                        this.parent.axes[0].length() / this.axes[0].length(),
                        this.parent.axes[1].length() / this.axes[1].length()
                    )
                );
        }

        if (this.position) {
            vector = vector.add(this.position);
        }

        if (this.parent && recursive !== false) {
            vector = this.parent.transformContext(this.mergeContextAndVector(context, vector));
        }

        return vector;
    }

    toLocal(context) {
        let ctxt = {};
        for (let idx in context) {
            ctxt[idx] = context[idx];
        }

        if (this.parent) {
            ctxt = this.parent.toLocal(ctxt);
        }

        let vector = new Vector2(ctxt.x, ctxt.y);

        if (this.position) {
            vector = vector.sub(this.position);
        }

        if (this.parent) {
            vector = vector
                .divide(
                    new Vector2(
                        this.parent.axes[0].length() / this.axes[0].length(),
                        this.parent.axes[1].length() / this.axes[1].length()
                    )
                );
        }

        let basis = this.axes[0].basis
            .add(this.axes[1].basis);

        vector = vector
            .divide(basis)
            .add(
                new Vector2(
                    basis.x > 0 ? this.axes[0].min : this.axes[0].max,
                    basis.y > 0 ? this.axes[1].min : this.axes[1].max
                )
            );

        var transformation = this.getTransformation(context);

        if (undefined == transformation) {
            return vector;
        }

        return transformation
            .transpose()
            .multiply(vector);
    }

    isOutside(vector) {
        for (let component in this.axesByName) {
            //console.log(component, vector, vector.hasOwnProperty(component), this.getAxisByName(component), this.getAxisByName(component).isOutside(vector[component]));
            if (this.axesByName[component].isOutside(vector[component])) {
                return true;
            }
        }

        return false;
    }

    renderBoundaries(ctxt, context, color) {
        var first = true;

        if (color) {
            ctxt.fillStyle = color;
        }

        ctxt.beginPath();
        context.x = this.axesByName['x'].min;
        for (context.y = this.axesByName['y'].min; context.y <= this.axesByName['y'].max; context.y += this.axesByName['y'].getIncrement()/10) {
            var pos = this.applyTransformation(context, true, false);
            if (pos.isNaV()) {
                continue;
            }

            if (first) {
                ctxt.moveTo(pos.x, pos.y);
                first = false;
                continue;
            }
            ctxt.lineTo(pos.x, pos.y);
        }
        ctxt.stroke();

        ctxt.beginPath();
        context.x = this.axesByName['x'].max;
        for (context.y = this.axesByName['y'].min; context.y <= this.axesByName['y'].max; context.y += this.axesByName['y'].getIncrement()/10) {
            var pos = this.applyTransformation(context, true, false);
            if (pos.isNaV()) {
                continue;
            }

            if (first) {
                ctxt.moveTo(pos.x, pos.y);
                first = false;
                continue;
            }

            ctxt.lineTo(pos.x, pos.y);
        }
        ctxt.stroke();

        ctxt.beginPath();
        context.y = this.axesByName['y'].min;
        for (context.x = this.axesByName['x'].min; context.x <= this.axesByName['x'].max; context.x += this.axesByName['x'].getIncrement()/10) {
            var pos = this.applyTransformation(context, true, false);
            if (pos.isNaV()) {
                continue;
            }

            if (first) {
                ctxt.moveTo(pos.x, pos.y);
                first = false;
                continue;
            }

            ctxt.lineTo(pos.x, pos.y);
        }
        ctxt.stroke();

        ctxt.beginPath();
        context.y = this.axesByName['y'].max;
        for (context.x = this.axesByName['x'].min; context.x <= this.axesByName['x'].max; context.x += this.axesByName['x'].getIncrement()/10) {
            var pos = this.applyTransformation(context, true, false);
            if (pos.isNaV()) {
                continue;
            }

            if (first) {
                ctxt.moveTo(pos.x, pos.y);
                first = false;
                continue;
            }

            ctxt.lineTo(pos.x, pos.y);
        }
        ctxt.stroke();
    }
}
