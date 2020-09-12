class MatrixFieldUI {
    constructor(
        oid,
        space,
        mf,
        particles,
        $parent,
        template,
        componentTemplate,
        functionTemplate,
        $elt,
        $componentCanvases,
        $particlesCanvas,
        color,
        withUpdateBtn,
        withHideBtn,
        withPulseBtn,
        withComponentUpdateBtn,
        withComponentHideBtn,
        withComponentPulseBtn,
        withFunctionUpdateBtn,
        withFunctionHideBtn,
        withFunctionPulseBtn,
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
        this.mf = mf;
        this.particles = particles || [];
        this.$parent = $parent;
        this.template = template;
        this.componentTemplate = componentTemplate;
        this.functionTemplate = functionTemplate;
        this.$elt = $elt;
        this.$componentCanvases = $componentCanvases;
        this.color = color || randomColor();
        this.withUpdateBtn = withUpdateBtn !== false;
        this.withHideBtn = withHideBtn !== false;
        this.withPulseBtn = withPulseBtn !== false;
        this.withComponentUpdateBtn = withComponentUpdateBtn === true;
        this.withComponentHideBtn = withComponentHideBtn === true;
        this.withComponentPulseBtn = withComponentPulseBtn === true;
        this.withFunctionUpdateBtn = withFunctionUpdateBtn === true;
        this.withFunctionHideBtn = withFunctionHideBtn === true;
        this.withFunctionPulseBtn = withFunctionPulseBtn === true;
        this.$particlesCanvas = $particlesCanvas;
        this.particlesColor = particlesColor || this.color;
        this.selectors = $.extend(
            {
                vectorFieldsContainer: '.vector-fields-container',
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
        this.renderingContextName = renderingContextName || DEFAULT_RENDERING_CONTEXT;

        this.init();
    }

    init() {
        this.$elt = this.$elt
            ? this.$elt
                    .html(
                        this.$elt.html()
                            .replace(/\{\{oid\}\}/ig, this.oid)
                            .replace(/\{\{name\}\}/ig, this.mf.name)
                    )
            : $(
                    this.template
                        .replace(/\{\{oid\}\}/ig, this.oid)
                        .replace(/\{\{name\}\}/ig, this.mf.name)
                )
                    .appendTo(this.$parent);

        this.components = {};
        for (let idx in this.mf.components) {
            this.addVectorFieldUI(idx);
        }

        if (this.$particlesCanvas && this.$particlesCanvas.length > 0) {
            this.particleRenderer = new Particle2dRenderer(this.$particlesCanvas.get(0).getContext('2d'));
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
    }

    on(eventName, callback) {
        this.$elt.on(eventName, callback);

        return this;
    }

    addVectorFieldUI(idx) {
        var component = this.mf.components[idx].name;
        var color = randomColor();

        this.components[idx] = new VectorFieldUI(
            idx,
            this.space,
            this.mf.components[idx],
            undefined,
            this.$elt.find(this.selectors.vectorFieldsContainer),
            this.componentTemplate,
            this.functionTemplate,
            undefined,
            this.$componentCanvases[idx],
            color,
            this.withComponentUpdateBtn,
            this.withComponentHideBtn,
            this.withComponentPulseBtn,
            this.withFunctionUpdateBtn,
            this.withFunctionHideBtn,
            this.withFunctionPulseBtn,
            undefined,
            color,
            this.selectors,
            undefined,
            this.lineWidth,
            this.showPoints,
            this.pointWidth,
            this.pointColor,
            this.normalize,
            this.arrowAngle,
            this.arrowHeight
        );
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

    onUpdateBtnClick(event) {
        this.update(false);

        this.$elt.trigger('update');
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

        this.render();
    }

    onPulseBtnClick(event) {
        let isPulse = this.mf instanceof Pulse;
        console.log('pulse mf', isPulse);

        if (isPulse) {
            this.mf = this.mf.fun;
        } else {
            this.mf = new Pulse(this.mf, this.space.getAxisByName('time'));
        }

        isPulse = !isPulse;

        $(event.currentTarget).children()
            .toggleClass('fa-signal', !isPulse)
            .toggleClass('fa-list', isPulse);

        this.update();
    }

    render(context, prevContext, withParticles) {
        // console.log(this.constructor.name, 'render', context, prevContext, withParticles);
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
            this.clear();
            if (this.viewState == 'visible' || this.viewState == 'points') {
                this.renderParticles(context);
            }
        }

        for (let idx in this.components) {
            this.components[idx].render(context, prevContext, false);
        }
    }

    renderParticles(context) {
        if (!this.particles || !this.particleRenderer) {
            return this;
        }

        for (let particle of this.particles) {
            if (this.space.getAxisByName('time').min == context.time) {
                particle.reset();
            } else {
                particle.update(context.time, this.space, this.mf);
            }

            this.particleRenderer.render(particle, this.space, context);
        }

        return this;
    }

    resetParticles(context) {
        if (!this.particles || !this.particlesCtxt) {
            return this;
        }

        for (let particle of this.particles) {
            particle.reset();
            this.particleRenderer.render(particle, this.space, context);
        }

        return this;
    }
}
