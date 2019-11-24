class SpaceUI {
    constructor(
        oid,
        space,
        $elt,
        $canvasContainer,
        $canvas,
        color,
        objects,
        selectors,
        axisTemplate,
        axesUI,
        objectsUI,
        functionTemplate,
        serieTemplate,
        vectorFieldTemplate,
        matrixFieldTemplate,
        matrixFieldVectorFieldTemplate
    ) {
        this.oid = oid;
        this.space = space;
        this.$elt = $elt;
        this.$canvasContainer = $canvasContainer;
        this.$canvas = $canvas;
        this.canvasIncrement = this.$canvasContainer.children().length;
        this.objects = objects || [];
        this.axisTemplate = axisTemplate || $('.axis-template').html();
        this.axesUI = axesUI || {};
        this.objectsUI = objectsUI || {};
        this.functionTemplate = functionTemplate || $('.function-template').html();
        this.serieTemplate = serieTemplate || $('.serie-template').html();
        this.vectorFieldTemplate = vectorFieldTemplate || $('.vector-field-template').html();
        this.matrixFieldTemplate = matrixFieldTemplate || $('.matrix-field-template').html();
        this.matrixFieldVectorFieldTemplate = matrixFieldVectorFieldTemplate || $('.matrix-vector-field-template').html();

        this.selectors = $.extend(
            {
                axesContainer: '.axes-container',
                objectsContainer: '.objects-container',
                addFunctionBtn: '.add-function-btn',
                addSerieBtn: '.add-serie-btn',
                addVectorFieldBtn: '.add-vector-field-btn',
                addMatrixFieldBtn: '.add-matrix-field-btn',
                capture: '.capture'
            },
            selectors || {}
        );

        this.init();
    }

    init() {
        this.paused = true;

        for (var component in this.space.axesByName) {
            this.addAxisUI(component);
        }

        this.objects.unshift(this.space.transformationObject);

        for (var idx in this.objects) {
            this.addObjectUI(idx);
        }

        this.$elt
            .find(this.selectors.addFunctionBtn)
                .click(this.onAddFunctionClick.bind(this))
            .end()
            .find(this.selectors.addSerieBtn)
                .click(this.onAddSerieClick.bind(this))
            .end()
            .find(this.selectors.addVectorFieldBtn)
                .click(this.onAddVectorFieldClick.bind(this))
            .end()
            .find(this.selectors.addMatrixFieldBtn)
                .click(this.onAddMatrixFieldClick.bind(this))
            .end()

        if (undefined === this.$canvas) {
            this.$canvas = $('<canvas></canvas>')
                .attr('id', this.oid + '-' + this.canvasIncrement++)
                .appendTo(this.$canvasContainer);
        }

        this.ctxt = this.$canvas.get(0).getContext('2d');

        this.currentAnimationFrame = undefined;
        this.resize(true, false);

        this.$canvas
            .mouseenter((event) => {
                $('body').on('mousemove', this.onPositionCapture.bind(this));
            })
            .mouseleave((event) => {
                $('body').off('mousemove', this.onPositionCapture.bind(this));
            });
    }

    onAddFunctionClick(event) {
        this.addFunctionUI();
    }

    onAddSerieClick(event) {
        this.addSerieUI();
    }

    onAddVectorFieldClick(event) {
        this.addVectorFieldUI();
    }

    onAddMatrixFieldClick(event) {
        this.addMatrixFieldUI();
    }

    onAxisUpdate(event) {
        for (var oid in this.objectsUI) {
            if (this.objectsUI[oid] instanceof MatrixFieldUI || this.objectsUI[oid] instanceof VectorFieldUI) {
                this.objectsUI[oid].particles = this.createParticles(this.objectsUI[oid].particlesColor);
            }

            this.objectsUI[oid].preRender(this.currentContext || this.getStartContext());
        }

        this.render();
    }

    addAxisUI(component) {
        var html = this.axisTemplate
            .replace(/\{\{oid\}\}/ig, this.oid)
            .replace(/\{\{name\}\}/ig, component)
            .replace(/\{\{min\}\}/ig, this.space.getAxisByName(component).min)
            .replace(/\{\{max\}\}/ig, this.space.getAxisByName(component).max)
            .replace(/\{\{steps\}\}/ig, this.space.getAxisByName(component).steps);

        var $elt = $(html);

        this.$elt
            .find(this.selectors.axesContainer)
                .append($elt);

        this.axesUI[component] = (new AxisUI(this.space, component, $elt, randomColor()))
            .on('update', this.onAxisUpdate.bind(this))
            .on('play', this.play.bind(this, component))
            .on('stop', this.stop.bind(this, component))
            .on('prev', this.prev.bind(this, component))
            .on('next', this.next.bind(this, component))
            .on('last', this.last.bind(this, component))
            ;
    }

    addObjectUI(oid) {
        if (this.objects[oid] instanceof MatrixField) {
            this.addMatrixFieldUI(oid);
        } else if (this.objects[oid] instanceof VectorField) {
            this.addVectorFieldUI(oid);
        } else if (this.objects[oid] instanceof Serie) {
            this.addSerieUI(oid);
        } else if (this.objects[oid] instanceof MathFunction) {
            this.addFunctionUI(oid);
        }
    }

    addFunctionUI(oid) {
        if (undefined === oid) {
            oid = this.canvasIncrement++;
            this.objects[oid] = new MathFunction('y' + oid, '{x}');
        }

        var $canvas = $('<canvas></canvas>')
            .attr('id', this.oid + '-' + oid)
            .attr('width', this.$canvasContainer.innerWidth())
            .attr('height', this.$canvasContainer.innerHeight())
            .appendTo(this.$canvasContainer);

        this.objectsUI[oid] = new FunctionUI(
            oid,
            this.space,
            this.objects[oid],
            this.$elt.find(this.selectors.objectsContainer),
            this.functionTemplate,
            undefined,
            $canvas,
            randomColor()
        );
    }

    addSerieUI(oid) {
        if (undefined === oid) {
            oid = this.canvasIncrement++;
            this.objects[oid] = new Serie(
                's' + oid,
                '{prev} + 1',
                'time',
                this.space.getAxisByName('time'),
                0
            );
        }

        var $canvas = $('<canvas></canvas>')
            .attr('id', this.oid + '-' + oid)
            .attr('width', this.$canvasContainer.innerWidth())
            .attr('height', this.$canvasContainer.innerHeight())
            .appendTo(this.$canvasContainer);

        this.objectsUI[oid] = new SerieUI(
            oid,
            this.space,
            this.objects[oid],
            this.$elt.find(this.selectors.objectsContainer),
            this.serieTemplate,
            undefined,
            $canvas,
            randomColor()
        );
    }

    createParticles(color) {
        let particles = [];
        this.space.each((context) => {
            let p = new Particle(new Vector2(context.x, context.y), 0, 5, color);
            particles.push(p);
        });

        return particles;
    }

    addVectorFieldUI(oid) {
        var color = randomColor();
        if (undefined === oid) {
            oid = this.canvasIncrement++;
            this.objects[oid] = new VectorField(
                'v' + oid,
                [
                    new MathFunction('x', '{x} + {y}'),
                    new MathFunction('x', '{x} * {y}')
                ]
            );
        }

        var $canvas = $('<canvas></canvas>')
            .attr('id', this.oid + '-' + oid)
            .attr('width', this.$canvasContainer.innerWidth())
            .attr('height', this.$canvasContainer.innerHeight())
            .appendTo(this.$canvasContainer);

        var $particlesCanvas = $('<canvas></canvas>')
            .attr('id', this.oid + '-' + oid + '-particles')
            .attr('width', this.$canvasContainer.innerWidth())
            .attr('height', this.$canvasContainer.innerHeight())
            .appendTo(this.$canvasContainer);

        this.objectsUI[oid] = new VectorFieldUI(
            oid,
            this.space,
            this.objects[oid],
            this.createParticles(color),
            this.$elt.find(this.selectors.objectsContainer),
            this.vectorFieldTemplate,
            this.functionTemplate,
            undefined,
            $canvas,
            color,
            undefined,
            undefined,
            undefined,
            undefined,
            undefined,
            undefined,
            $particlesCanvas,
            color
        );
    }

    addMatrixFieldUI(oid) {
        var color = randomColor();
        if (undefined === oid) {
            oid = this.canvasIncrement++;
            this.objects[oid] = new MatrixField(
                'm' + oid,
                [
                    new VectorField(
                        'x',
                        [
                            new MathFunction('xx', '1'),
                            new MathFunction('xy', '0')
                        ]
                    ),
                    new VectorField(
                        'y',
                        [
                            new MathFunction('yx', '0'),
                            new MathFunction('yy', '1')
                        ]
                    )
                ],
                color,
                this.createParticles(color)
            );
        }

        var $componentCanvases = {};
        for (var component in this.objects[oid].components) {
            $componentCanvases[component] = $('<canvas></canvas>')
                .attr('id', this.oid + '-' + oid + '-' + component)
                .attr('width', this.$canvasContainer.innerWidth())
                .attr('height', this.$canvasContainer.innerHeight())
                .appendTo(this.$canvasContainer);
        }

        var $particlesCanvas = $('<canvas></canvas>')
            .attr('id', this.oid + '-' + oid + '-particles')
            .attr('width', this.$canvasContainer.innerWidth())
            .attr('height', this.$canvasContainer.innerHeight())
            .appendTo(this.$canvasContainer);

        this.objectsUI[oid] = new MatrixFieldUI(
            oid,
            this.space,
            this.objects[oid],
            this.createParticles(color),
            this.$elt.find(this.selectors.objectsContainer),
            this.matrixFieldTemplate,
            this.matrixFieldVectorFieldTemplate,
            this.functionTemplate,
            undefined,
            $componentCanvases,
            $particlesCanvas,
            color
        );
    }

    clear(recursive) {
        this.ctxt.clearRect(0, 0, this.ctxt.canvas.width, this.ctxt.canvas.height);

        if (recursive !== false) {
            this.$canvasContainer.children().each((idx, elt) => {
                var canvas = $(elt).get(0);
                var ctxt = canvas.getContext('2d').clearRect(0, 0, canvas.width, canvas.height);
            });
        }
    }

    resize(recursive, render) {
        this.$canvasContainer
            .removeClass('fill-height')
            .css('width', this.$canvasContainer.parent().innerWidth())
            .css('height', $('body').innerHeight());

        this.$canvas
            .attr('width', this.$canvasContainer.innerWidth())
            .attr('height', this.$canvasContainer.innerHeight());

        if (recursive !== false) {
            this.$canvasContainer.children().each((idx, elt) => {
                $(elt)
                    .attr('width', this.$canvasContainer.innerWidth())
                    .attr('height', this.$canvasContainer.innerHeight());
            });
        }

        if (render !== false) {
            this.currentAnimationFrame = window.requestAnimationFrame(this.render.bind(this));
        }
    }

    getStartContext() {
        let context = {};
        for (let component in this.space.axesByName) {
            context[component] = this.space.axesByName[component].min;
        }

        return context;
    }

    render(context, animate, animationComponent) {
        if (this.currentAnimationFrame) {
            window.cancelAnimationFrame(this.currentAnimationFrame);
        }
        this.currentAnimationFrame = undefined;

        this.clear();
        this.resize(true, false);

        context = $.extend(this.getStartContext(), this.currentContext || {}, context || {});


        var animated = false;

        let prevContext;

        for (var oid in this.objectsUI) {
            this.objectsUI[oid].preRender(context);
            if (!animated && this.objectsUI[oid].isAnimated()) {
                animated = true;
            }
        }

        this.space.each(
            (context) => {
                for (var oid in this.objectsUI) {
                    this.objectsUI[oid].render(context, prevContext);
                }
                prevContext = $.extend({}, context);
            },
            context
        );

        this.renderBoundaries(context, this.color);
        for (var component in this.axesUI) {
            if (component == 'time') continue;
            this.axesUI[component].render(this.ctxt, context);
        }

        if (animate !== false && animated && !this.paused) {
            this.currentAnimationFrame = window.requestAnimationFrame(this.next.bind(this, animationComponent || 'time', !this.paused));
        }
    }

    renderBoundaries(context, color) {
        var first = true;

        if (color) {
            this.ctxt.strokeStyle = color;
        }

        var factor = 100;

        this.ctxt.beginPath();
        context.x = this.space.getAxisByName('x').min;
        for (context.y = this.space.getAxisByName('y').min; context.y <= this.space.getAxisByName('y').max; context.y += this.space.getAxisByName('y').getIncrement()/factor) {
            var pos = this.space.applyTransformation(context, true, false);
            if (pos.isNaV()) {
                continue;
            }

            if (first) {
                this.ctxt.moveTo(pos.x, pos.y);
                first = false;
                continue;
            }
            this.ctxt.lineTo(pos.x, pos.y);
        }
        this.ctxt.stroke();

        this.ctxt.beginPath();
        context.x = this.space.getAxisByName('x').max;
        for (context.y = this.space.getAxisByName('y').min; context.y <= this.space.getAxisByName('y').max; context.y += this.space.getAxisByName('y').getIncrement()/factor) {
            var pos = this.space.applyTransformation(context, true, false);
            if (pos.isNaV()) {
                continue;
            }

            if (first) {
                this.ctxt.moveTo(pos.x, pos.y);
                first = false;
                continue;
            }

            this.ctxt.lineTo(pos.x, pos.y);
        }
        this.ctxt.stroke();

        this.ctxt.beginPath();
        context.y = this.space.getAxisByName('y').min;
        for (context.x = this.space.getAxisByName('x').min; context.x <= this.space.getAxisByName('x').max; context.x += this.space.getAxisByName('x').getIncrement()/factor) {
            var pos = this.space.applyTransformation(context, true, false);
            if (pos.isNaV()) {
                continue;
            }

            if (first) {
                this.ctxt.moveTo(pos.x, pos.y);
                first = false;
                continue;
            }

            this.ctxt.lineTo(pos.x, pos.y);
        }
        this.ctxt.stroke();

        this.ctxt.beginPath();
        context.y = this.space.getAxisByName('y').max;
        for (context.x = this.space.getAxisByName('x').min; context.x <= this.space.getAxisByName('x').max; context.x += this.space.getAxisByName('x').getIncrement()/factor) {
            var pos = this.space.applyTransformation(context, true, false);
            if (pos.isNaV()) {
                continue;
            }

            if (first) {
                this.ctxt.moveTo(pos.x, pos.y);
                first = false;
                continue;
            }

            this.ctxt.lineTo(pos.x, pos.y);
        }
        this.ctxt.stroke();
    }

    play(component) {
        this.paused = false;

        this.next(component, true);
    }

    stop(component) {
        this.paused = true;
        if (undefined === this.currentContext) {
            this.currentContext = this.getStartContext();
        }

        this.currentContext[component] = this.space.getAxisByName(component).min;

        for (let idx in this.objectsUI) {
            this.objectsUI[idx].preRender(this.currentContext);
            if (!(this.objectsUI[idx] instanceof VectorFieldUI)
                && !(this.objectsUI[idx] instanceof MatrixFieldUI)
            ) {
                continue;
            }

            this.objectsUI[idx].resetParticles(this.currentContext);
        }

        this.render(this.currentContext, false);
    }

    prev(component) {
        this.paused = true;
        if (undefined === this.currentContext) {
            this.currentContext = this.getStartContext();
        } else {
            var prev = this.space.getAxisByName(component).previous(this.currentContext[component]);
            if (undefined === prev) {
                return;
            }

            this.currentContext[component] = prev;
        }

        for (let idx in this.objectsUI) {
            this.objectsUI[idx].preRender(this.currentContext);
        }

        this.render(this.currentContext);
    }

    next(component, doNotPause) {
        this.paused = doNotPause == true ? false : true;
        if (undefined === this.currentContext) {
            this.currentContext = this.getStartContext();
        }

        var next = this.space.getAxisByName(component).next(this.currentContext[component]);
        if (undefined === next) {
            return;
        }

        this.currentContext[component] = next;

        for (let idx in this.objectsUI) {
            this.objectsUI[idx].preRender(this.currentContext);
        }

        this.render(this.currentContext, undefined, component);
    }

    last(component) {

        this.paused = true;
        if (undefined === this.currentContext) {
            this.currentContext = this.getStartContext();
        }

        this.currentContext[component] = this.space.getAxisByName(component).max;

        for (let idx in this.objectsUI) {
            this.objectsUI[idx].preRender(this.currentContext);
        }

        this.render(this.currentContext);
    }

    onPositionCapture(event) {
        let canvasPos = this.$canvas.offset();
        let pos = new Vector2(
            event.pageX - canvasPos.left,
            event.pageY - canvasPos.top
        );

        let spacePos = this.space.toLocal(this.space.mergeContextAndVector(this.currentContext, pos));
        let context = $.extend({}, this.getStartContext(), this.currentContext, {'x': spacePos.x, 'y': spacePos.y});

        let $cap = this.$elt.find(this.selectors.capture);
        let $table = $cap.find('.data tbody');
        $table.children('.pos-varying').remove();

        for (let component in context) {
            $table
                .append(
                    $('<tr class="pos-varying"></tr>')
                        .append($('<td></td>').text(component))
                        .append($('<td></td>').text(context[component] + ' / ' + this.space.getAxisByName(component).max))
                );
        }

        for (let oid in this.objects) {
            let val = this.objects[oid] instanceof Pulse
                ? this.objects[oid].evaluate(this.space, context)
                : this.objects[oid].evaluate(context);

            let $elt = $('<tr class="pos-varying"></tr>');
            $table.append($elt);

            $elt.append($(
                '<td class="object-legend" style="background-color: '
                + (this.objectsUI.hasOwnProperty(oid) ? this.objectsUI[oid].color : randomColor())
                + ';"></td>'
            )
                .text(this.objects[oid].name));
            let text = '';
            text = val instanceof Matrix2
                ? '(' + val.x.x + ', ' + val.x.y + ')' + "\n"
                    + '(' + val.y.x + ', ' + val.y.y + ')' + "\n"
                : (val instanceof Vector2
                    ? '(' + val.x + ', ' + val.y + ')'
                    : '' + val
                );

            $elt.append(
                $('<td></td>')
                    .text(text)
            );
        }
    }
}
