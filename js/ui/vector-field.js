class VectorFieldUI {
    constructor(
        oid,
        space,
        vf,
        particles,
        $parent,
        template,
        componentTemplate,
        $elt,
        $canvas,
        color,
        withUpdateBtn,
        withHideBtn,
        withPulseBtn,
        withComponentUpdateBtn,
        withComponentHideBtn,
        withComponentPulseBtn,
        $particlesCanvas,
        particlesColor,
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
        this.vf = vf;
        this.particles = particles || [];
        this.$parent = $parent;
        this.template = template;
        this.componentTemplate = componentTemplate;
        this.$elt = $elt;
        this.$canvas = $canvas;
        this.color = color || randomColor();
        this.withUpdateBtn = withUpdateBtn !== false;
        this.withHideBtn = withHideBtn !== false;
        this.withPulseBtn = withPulseBtn !== false;
        this.withComponentUpdateBtn = withComponentUpdateBtn === true;
        this.withComponentHideBtn = withComponentHideBtn === true;
        this.withComponentPulseBtn = withComponentPulseBtn === true;
        this.$particlesCanvas = $particlesCanvas;
        this.particlesColor = particlesColor || this.color;
        this.selectors = $.extend(
            {
                componentsContainer: '.components-container',
                hideIcon: '.hide-icon',
                updateBtn: '.update-btn',
                hideBtn: '.hide-btn',
                pulseBtn: '.pulse-btn'
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
        this.$elt = this.$elt
            ? this.$elt
                    .html(
                        this.$elt.html()
                            .replace(/\{\{oid\}\}/ig, this.oid)
                            .replace(/\{\{name\}\}/ig, this.vf.name)
                    )
            : $(
                    this.template
                        .replace(/\{\{oid\}\}/ig, this.oid)
                        .replace(/\{\{name\}\}/ig, this.vf.name)
                )
                    .appendTo(this.$parent);

        this.components = {};
        for (let idx in this.vf.components) {
            this.addFunctionUI(idx);
        }

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

        if (false === this.withPulseBtn) {
            this.$elt.find(this.selectors.pulseBtn).remove();
        } else {
            this.$elt.on('click', this.selectors.pulseBtn, this.onPulseBtnClick.bind(this));
        }

        if (this.renderingContextName == '2d') {
            this.renderer = new VectorField2dRenderer(this);
            if (this.$particlesCanvas) {
                this.particleRenderer = new Particle2dRenderer(this.$particlesCanvas.get(0).getContext('2d'));
            }
        }
    }

    onUpdateBtnClick(event) {
        this.update();
    }

    update(render) {
        for (let component in this.components) {
            this.components[component].update(false);
        }

        if (false !== render) {
            this.render();
        }

        return this;
    }

    onHideBtnClick(event) {
        let $icon = $(event.currentTarget).find(this.selectors.hideIcon);

        switch (this.viewState) {
            case 'visible':
                this.viewState = 'vectors';
                break;
            case 'vectors':
                this.viewState = 'points';
                break;
            case 'points':
                this.viewState = 'hidden';
                break;
            case 'hidden':
            default:
                this.viewState = 'visible';
                break;
        }

        for (let idx in this.components) {
            this.components[idx].$canvas.toggle(this.viewState == 'visible' || this.viewState == 'vectors');
        }

        this.$particlesCanvas.toggle(this.viewState == 'visible' || this.viewState == 'points');

        $icon
            .toggleClass('fa-eye', this.viewState == 'visible')
            .toggleClass('fa-arrows', this.viewState == 'vectors')
            .toggleClass('fa-bullseye', this.viewState == 'points')
            .toggleClass('fa-eye-slash', this.viewState == 'hidden');

        this.$particlesCanvas.toggle(this.viewState == 'visible' || this.viewState == 'points');

        this.render();
    }

    onPulseBtnClick(event) {
        let isPulse = this.vf instanceof Pulse;

        if (isPulse) {
            this.vf = this.vf.fun;
        } else {
            this.vf = new Pulse(this.vf, this.space.getAxisByName('time'));
        }

        isPulse = !isPulse;

        $(event.currentTarget).children()
            .toggleClass('fa-signal', !isPulse)
            .toggleClass('fa-list', isPulse);

        this.update();
    }

    addFunctionUI(idx) {
        var component = this.vf.components[idx].name;

        this.components[component] = new FunctionUI(
            this.oid + '-' + component,
            this.space,
            this.vf.components[idx],
            this.$elt.find(this.selectors.componentsContainer),
            this.componentTemplate,
            undefined,
            this.$canvas,
            this.color,
            this.withComponentUpdateBtn,
            this.withComponentHideBtn,
            this.withComponentPulseBtn,
            undefined,
            undefined,
            this.lineWidth,
            this.showPoints,
            this.pointWidth,
            this.pointColor,
            this.normalize,
            this.arrowAngle,
            this.arrowHeight
        );

        return this;
    }

    clear() {
        for (let component in this.components) {
            this.components[component].clear();
        }

        this.clearParticles();

        return this;
    }

    clearParticles() {
        if (this.particleRenderer) {
            this.particleRenderer.clear();
        }

        return this;
    }

    isAnimated(checkSpace) {
        if (this.particleRenderer && (this.viewState == 'visible' || this.viewState == 'points')) {
            return true;
        }

        for (var component in this.components) {
            if (this.components[component].isAnimated(checkSpace)) {
                return true;
            }
        }

        return false;
    }

    render(context, prevContext, withParticles) {
        if (this.viewState == 'hidden') {
            this.clear();
            return this;
        }

        if (undefined === context) {
            let first = true;
            this.space.each((context) => {
                this.render(context, prevContext, first);
                first = false;
                prevContext = $.extend({}, context);
            });

            return this;
        }

        if (undefined === prevContext) {
            this.clear();
        }

        this.renderer.render(context, prevContext, withParticles);

        return this;
    }

    resetParticles(context) {
        this.renderer.resetParticles(context);

        return this;
    }
}
