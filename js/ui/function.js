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
        arrowHeight,
        renderingContextName
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
        this.renderingContextName = renderingContextName || '2d';

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

        this.renderer = new Function2dRenderer(this);
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

    isVectorField () {
        if (this.fun instanceof VectorField) {
            return true;
        }

        return (this.fun.requires('x') || this.fun.requires('dx'))
            && (this.fun.requires('y') || this.fun.requires('dy'));
    }

    clear() {
        this.renderer.clear();
    }

    render(context, prevContext) {
        this.renderer.render(context, prevContext);
    }

    resetParticles(space, context) {
        if (!this.particles) {
            return this;
        }

        for (let particle of this.particles) {
            particle.reset();
            this.renderer.renderParticle(particle, context);
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
