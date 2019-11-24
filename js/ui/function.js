class FunctionUI {
    constructor(
        oid,
        space,
        fun,
        $parent,
        template,
        $elt,
        $canvas,
        color,
        withUpdateBtn,
        withHideBtn,
        withIntegrateBtn,
        selectors,
        viewState,
        lineWidth,
        showPoints,
        pointWidth,
        pointColor,
        normalize,
        arrowAngle,
        arrowHeight
    ) {
        this.oid = oid;
        this.space = space;
        this.fun = fun;
        this.$parent = $parent;
        this.template = template;
        this.$elt = $elt;
        this.$canvas = $canvas;
        this.color = color || randomColor();
        this.withUpdateBtn = withUpdateBtn !== false;
        this.withHideBtn = withHideBtn !== false;
        this.withIntegrateBtn = withIntegrateBtn !== false;

        this.selectors = $.extend(
            {
                equationInput: '.equation-input',
                hideIcon: '.hide-icon',
                updateBtn: '.update-btn',
                hideBtn: '.hide-btn',
                integrateBtn: '.pulse-btn'
            },
            selectors || {}
        );

        this.viewState = viewState || 'visible';

        this.lineWidth = lineWidth || 1;
        this.showPoints = showPoints !== false;
        this.pointWidth = pointWidth === undefined ? 5 : 1*pointWidth;
        this.pointColor = pointColor || this.color;
        this.normalize = normalize !== false;
        this.arrowAngle = arrowAngle === undefined ? Math.PI / 8 : 1*arrowAngle;
        this.arrowHeight = arrowHeight === undefined ? 0.25 : 1*arrowHeight;

        this.init();
    }

    init() {
        this.fun.prepare();

        this.$elt = this.$elt
            ? this.$elt
                    .html(
                        this.$elt.html()
                            .replace(/\{\{oid\}\}/ig, this.oid)
                            .replace(/\{\{name\}\}/ig, this.fun.name)
                            .replace(/\{\{equation\}\}/ig, this.fun.equation)
                    )
            : $(
                    this.template
                        .replace(/\{\{oid\}\}/ig, this.oid)
                        .replace(/\{\{name\}\}/ig, this.fun.name)
                        .replace(/\{\{equation\}\}/ig, this.fun.equation)
                )
                    .appendTo(this.$parent);

        if (false === this.withUpdateBtn) {
            this.$elt.find(this.selectors.updateBtn).remove();
        } else {
            this.$elt.on('click', this.selectors.updateBtn, this.onUpdateBtnClick.bind(this));
        }

        if (false === this.withHideBtn) {
            this.$elt.find(this.selectors.hideBtn).remove();
        } else {
            this.$elt.find(this.selectors.hideBtn).css('background-color', this.color);
            this.$elt.on('click', this.selectors.hideBtn, this.onHideBtnClick.bind(this))
        }

        if (false === this.withIntegrateBtn) {
            this.$elt.find(this.selectors.integrateBtn).remove();
        } else {
            this.$elt.on('click', this.selectors.integrateBtn, this.onIntegrateBtnClick.bind(this));
        }

        this.ctxt = this.$canvas.get(0).getContext('2d');
    }

    onUpdateBtnClick(event) {
        this.update();
    }

    update(render) {
        if (this.fun instanceof Pulse) {
            this.fun.fun.equation = this.$elt.find(this.selectors.equationInput).val();
            this.fun.fun.outdate();
            this.fun.fun.prepare();
        } else {
            this.fun.equation = this.$elt.find(this.selectors.equationInput).val();
            this.fun.outdate();
            this.fun.prepare();
        }

        if (render !== false) {
            this.render();
        }
    }

    onHideBtnClick(event) {
        let $icon = $(event.currentTarget).find(this.selectors.hideIcon);
        this.viewState = this.viewState == 'visible' ? 'hidden' : 'visible';

        $icon
            .toggleClass('fa-eye', this.viewState == 'visible')
            .toggleClass('fa-eye-slash', this.viewState == 'hidden');

        this.render();
    }

    onIntegrateBtnClick(event) {
        let isPulse = this.fun instanceof Pulse;
        if (isPulse) {
            this.fun = this.fun.fun;
        } else {
            this.fun = new Pulse(this.fun, this.space.getAxisByName('time'));
        }

        isPulse = !isPulse;

        $(event.currentTarget).children()
            .toggleClass('fa-signal', !isPulse)
            .toggleClass('fa-list', isPulse);

        this.update();
    }

    isAnimated(checkSpace) {
        return (this.fun instanceof Pulse ? this.fun.fun : this.fun).isAnimated()
            || this.space.transformationObject.isAnimated(false);
    }

    clear(context) {
        this.ctxt.clearRect(
            0,
            0,
            this.ctxt.canvas.width,
            this.ctxt.canvas.height
        );
    }

    isVectorField () {
        if (this.fun instanceof VectorField) {
            return true;
        }

        return (this.fun.requires('x') || this.fun.requires('dx'))
            && (this.fun.requires('y') || this.fun.requires('dy'));
    }

    preRender(context) {
    }

    render(context, prevContext) {
        if (this.viewState == 'hidden') {
            this.clear();
            return this;
        }

        if (undefined === context) {
            this.space.each((context) => {
                this.render(context, prevContext);
                prevContext = $.extend({}, context);
            });

            return this;
        }

        if (undefined === prevContext) {
            this.clear(context);
        }
        let val = this.fun.evaluate(context);
        if (!isNaN(val)) {
            var p = this.space.applyTransformation(
                this.space.mergeContextAndVector(context, new Vector2(context.x, val))
            );

            if (this.isVectorField()) {
                this.renderVector(context);
            } else {
                if (prevContext) {
                    this.renderSegment(prevContext, context);
                }

                this.renderPoint(this.ctxt, p.x, p.y);
            }
        }

        return this;
    }

    renderSegment(args1, args2) {
        let val1, val2,
            p1, p2;

        if (args1) {
            val1 = this.fun.evaluate(args1);
            if (!isNaN(val1)) {
                p1 = this.space.applyTransformation(
                    this.space.mergeContextAndVector(args1, new Vector2(args1.x, val1))
                );
            }
        }

        if (args2) {
            val2 = this.fun.evaluate(args2);
            if (!isNaN(val2)) {
                p2 = this.space.applyTransformation(
                    this.space.mergeContextAndVector(args2, new Vector2(args2.x, val2))
                );
            }
        }

        if (!p1 || !p2 || p1.isNaV() || p2.isNaV()) {
            return this;
        }

        this.ctxt.save();
        this.ctxt.strokeStyle = this.color;
        if (this.lineWidth !== undefined) {
            this.ctxt.lineWidth = this.lineWidth;
        }

        this.ctxt.beginPath();
        this.ctxt.moveTo(p1.x, p1.y);
        this.ctxt.lineTo(p2.x, p2.y);
        this.ctxt.stroke();
        this.ctxt.restore();

        if (this.showPoints) {
            if (p2) {
                this.renderPoint(this.ctxt, p2.x, p2.y);
            } else if (p1) {
                this.renderPoint(this.ctxt, p1.x, p1.y);
            }
        }

        return this;
    }

    renderPoint(ctxt, x, y) {
        let margin = Math.round(this.pointWidth / 2);

        ctxt.fillStyle = this.pointColor;
        ctxt.fillRect(x - margin, y - margin, this.pointWidth, this.pointWidth);

        return this;
    }

    renderVector(args) {
        if (!args || args.dx == 0 || args.dy == 0) {
            return this;
        }

        let vector = this.fun.evaluateVector(args);

        if (vector instanceof Vector2 && (vector.isNaV() || (vector.x == 0 && vector.y == 0))) {
            return this;
        }

        // console.log(previousArgs, previousVal, args, val, vector);

        if (this.normalize) {
            vector = vector.normalize();
        }

        let point = new Vector2(args.x - args.dx / 2, args.y - args.dy / 2);
        let point1 = this.space.applyTransformation(this.space.mergeContextAndVector(args, point));
        let point2 = this.space.applyTransformation(this.space.mergeContextAndVector(args, point.add(vector)));
        let vector2 = this.space.applyTransformation(this.space.mergeContextAndVector(args, vector));

        this.ctxt.save();
        this.ctxt.strokeStyle = this.color;

        if (this.lineWidth) {
            this.ctxt.lineWidth = this.lineWidth;
        }

        this.ctxt.beginPath();
        this.ctxt.moveTo(point1.x, point1.y);
        this.ctxt.lineTo(point2.x, point2.y);
        this.ctxt.stroke();

        let l = vector.length();

        let cosTheta = Math.cos(this.arrowAngle),
            sinTheta = Math.sin(this.arrowAngle);

        let vector3 = this.space.applyTransformation(
            this.space.mergeContextAndVector(
                args,
                point
                    .add(vector)
                    .sub(
                        (new Matrix2(new Vector2(cosTheta, sinTheta), new Vector2(-sinTheta, cosTheta)))
                            .multiply(vector)
                            .multiply(this.arrowHeight)
                    )
            )
        );

        this.ctxt.beginPath();
        this.ctxt.moveTo(point2.x, point2.y);
        this.ctxt.lineTo(vector3.x, vector3.y);
        this.ctxt.stroke();

        let vector4 = this.space.applyTransformation(
            this.space.mergeContextAndVector(
                args,
                point
                    .add(vector)
                    .sub(
                        (new Matrix2(new Vector2(cosTheta, -sinTheta), new Vector2(sinTheta, cosTheta)))
                            .multiply(vector)
                            .multiply(this.arrowHeight)
                    )
            )
        );

        this.ctxt.beginPath();
        this.ctxt.moveTo(point2.x, point2.y);
        this.ctxt.lineTo(vector4.x, vector4.y);
        this.ctxt.stroke();
        this.ctxt.restore();

        return this;
    }

    renderParticles(space, args) {
        if (!this.particles || !this.particlesCtxt) {
            return this;
        }

        for (let particle of this.particles) {
            particle.update(args.time, space, this);
            particle.render(this.particlesCtxt, space, args);
        }

        return this;
    }

    resetParticles(space, args) {
        if (!this.particles || !this.particlesCtxt) {
            return this;
        }

        for (let particle of this.particles) {
            particle.reset();
            particle.render(this.particlesCtxt, space, args);
        }

        return this;
    }

    toggleParticules(toggle) {
        if (!this.particles || !this.particlesCtxt) {
            return this;
        }

        $(this.particlesCtxt.canvas).toggle(toggle);
    }

    toggleCanvas(toggle) {
        if (!this.ctxt) {
            return this;
        }

        $(this.ctxt.canvas).toggle(toggle);

        return this;
    }
}
