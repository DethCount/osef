$(() => {
    let $canvas = $('#viewer'),
        canvas = $canvas.get(0),
        ctxt = canvas.getContext('2d'),
        canvasSpace = new CanvasSpace(canvas);

    let minX = -10,
        stepsX = 10,
        maxX = 10;

    let minY = -10,
        stepsY = 10,
        maxY = 10;

    let minTime = 0,
        stepsTime = 10,
        maxTime = 100,
        time = minTime,
        paused = true,
        stopped = false;

    let theta = -Math.PI / 4;

    let workSpace = new Space(
        [
            new Axis('x', new Vector2(1, 0), minX, maxX, stepsX, 'red'),
            new Axis('y', new Vector2(0, -1), minY, maxY, stepsY, 'green'),
            new Axis('time', new Vector2(0, 0), minTime, maxTime, stepsTime),
        ],
        canvasSpace/*,
        undefined,
        new Matrix2(new Vector2(Math.cos(theta), Math.sin(theta)), new Vector2(-Math.sin(theta), Math.cos(theta)))//*/
    );

    let randomColor = (alpha) => {
        return 'rgba('
            + Math.round(Math.random() * 255) + ', '
            + Math.round(Math.random() * 255) + ', '
            + Math.round(Math.random() * 255) + ', '
            + (alpha || 1)
            + ')';
    };

    let objects = [
        new MatrixField(
            'm0',
            [
                new VectorField(
                    'x',
                    [
                        new MathFunction('x', 'cos({x}+{time})'),//new MathFunction('x', 'cos({time})'),
                        new MathFunction('y', 'sin({y}+{time})')//new MathFunction('y', 'sin({time})')
                    ],
                    randomColor()
                ),
                new VectorField(
                    'y',
                    [
                        new MathFunction('x', '-sin({y}+{time})'),
                        new MathFunction('y', 'cos({x}+{time})')
                    ],
                    randomColor()
                )
            ],
            randomColor()
        ),
        new MathFunction('y0', 'cos(({x}/({time}%10))*PI)', 'green'),
        new MathFunction('y0', 'sin(2 * PI * {x} + {time})', 'green'),
        new MathFunction('y1', 'pow({x}, 2) + pow({y}, 2)', 'blue'),
        new MathFunction('y2', 'pow(cos({time} * {y}), 2) - pow(sin({time} * {x}), 2)', 'red'),
        new Serie('s0', 'sin({x}*{y}+{prev})', 'time', workSpace.axes[2], 1, 'orange'),
        new VectorField(
            'v0',
            [
                new MathFunction('x', '{x} * {y}'),
                new MathFunction('y', '{x} - {y}')
            ],
            'darkgreen'
        ),
        new VectorField(
            'v1',
            [
                new MathFunction('x', 'cos({x})*-sin({y})'),
                new MathFunction('y', '-sin({y}) * cos({x})')
            ],
            'darkorange'
        )
    ];

    workSpace.transformationObject = objects[0];

    let $minX = $('.function-x-min');
    let $stepsX = $('.function-x-steps');
    let $maxX = $('.function-x-max');

    let $minY = $('.function-y-min');
    let $stepsY = $('.function-y-steps');
    let $maxY = $('.function-y-max');

    let $time = $('.time');
    let $minTime = $('.function-t-min');
    let $stepsTime = $('.function-t-steps');
    let $maxTime = $('.function-t-max');

    let isVectorField = (obj) => {
        return obj instanceof VectorField
            || (
                (obj.requires('x') || obj.requires('dx'))
                && (
                    obj.requires('y')
                    || obj.requires('dy')
                )
            );
    };

    let createParticles = (space, color) => {
        let particles = [];
        space.axes[0].each((x) => {
            space.axes[1].each((y) => {
                // console.log(x, y);
                let p = new Particle(new Vector2(x, y), 0, 5, color);
                //console.log(p, new Vector2(x, y));
                particles.push(p);
            });
        });

        return particles;
    }

    let refreshUI = () => {
        $minX.val(workSpace.axes[0].min);
        $maxX.val(workSpace.axes[0].max);
        $stepsX.val(workSpace.axes[0].steps);

        $minY.val(workSpace.axes[1].min);
        $maxY.val(workSpace.axes[1].max);
        $stepsY.val(workSpace.axes[1].steps);

        $time.text(time + ' / ' + workSpace.axes[2].max);

        $minTime.val(workSpace.axes[2].min);
        $maxTime.val(workSpace.axes[2].max);
        $stepsTime.val(workSpace.axes[2].steps);
    };

    let clearCanvas = (ctxt) => {
        if (!ctxt) {
            return;
        }
        ctxt.clearRect(canvasSpace.axes[0].min, canvasSpace.axes[1].min, canvasSpace.axes[0].length(), canvasSpace.axes[1].length());
    };

    let getObjectCtxt = (oid) => {
        return $('.canvas-container canvas#oid-' + oid).get(0).getContext('2d');
    };

    let render = (oids) => {
        refreshUI();
        if (oids !== undefined) {
            clearCanvas(ctxt);
        }

        oids = oids instanceof Set ? oids : (oids === undefined ? new Set([...objects.keys()]) : new Set([oids]));

        $('canvas').each(function() {
            clearCanvas(this.getContext('2d'));
        });

        let previousXContext,
            previousYContext,
            generalContext = {
                'dx': 0,
                'time': time,
                'dt': time == workSpace.axes[2].min ? 0 : workSpace.axes[2].getIncrement()
            },
            context = {
                'dx': 0,
                'time': time,
                'dt': time == workSpace.axes[2].min ? 0 : workSpace.axes[2].getIncrement()
            },
            animate = false,
            animated = new Set();

        workSpace.axes[0].each((x) => {
            context.x = x;

            for (var oid of oids) {
                if (isVectorField(objects[oid])) {
                    continue;
                }

                objects[oid].renderSegment(
                    objects[oid].ctxt,
                    workSpace,
                    previousXContext ? previousXContext : context,
                    previousXContext ? context : undefined
                );
            }
            previousXContext = Object.assign({}, context);

            context.dy = 0;
            workSpace.axes[1].each((y) => {
                context.y = y;

                for (var oid of oids) {
                    if (!isVectorField(objects[oid])) {
                        continue;
                    }

                    if (objects[oid] instanceof MatrixField) {
                        objects[oid].render(
                            workSpace,
                            previousYContext ? previousYContext : context,
                            previousYContext ? context : undefined
                        );
                    } else {
                        objects[oid].renderVector(
                            objects[oid].ctxt,
                            workSpace,
                            previousYContext ? previousYContext : context,
                            previousYContext ? context : undefined
                        );
                    }

                    if (objects[oid].requires('time') || objects[oid].requires('dtime')) {
                        animate = true;
                        animated.add(oid);
                    }
                }

                previousYContext = Object.assign({}, context);
                context['dy'] = workSpace.axes[1].getIncrement();
            });

            context['dx'] = workSpace.axes[0].getIncrement();
        });

        for (var idx in workSpace.axes) {
            workSpace.axes[idx].render(ctxt, workSpace, generalContext, 20);
        }

        workSpace.renderBoundaries(ctxt, generalContext, 'black');

        for (let oid in objects) {
            if (objects[oid].requires('time') || objects[oid].requires('dtime') || isVectorField(objects[oid])) {
                animate = true;
                animated.add(oid);
            }

            if (!isVectorField(objects[oid])) {
                continue;
            }

            clearCanvas(objects[oid].particlesCtxt || objects[oid].fun.particlesCtxt);
            if (time == workSpace.axes[2].min) {
                objects[oid].resetParticles(workSpace, generalContext);
            } else {
                objects[oid].renderParticles(workSpace, generalContext);
            }
        }


        let nextTime = workSpace.axes[2].next(time);
        if (animate && !paused && !stopped && nextTime <= workSpace.axes[2].max) {
            time = nextTime;
            redraw(animated);
        }
    };

    let redrawId;
    let redraw = (oids) => {
        if (redrawId) cancelAnimationFrame(redrawId);
        redrawId = requestAnimationFrame(() => render(oids));
    };

    let resize = () => {
        time = workSpace.axes[2].min;
        $container = $('.canvas-container');
        $container.children('canvas')
            .attr('width', $container.innerWidth())
            .attr('height', $container.innerHeight());

        canvasSpace.resize();

        redraw();
    };

    let updateFunction = (event) => {
        let $this = $(event.currentTarget);
        let $parent = $this.parents('.input-group');
        let $input = $parent.find('.function-equation')
        let i = $parent.data('functionI');

        objects[i].equation = $input.val();
        objects[i].outdate();

        time = workSpace.axes[2].min;
        redraw(i);
    };

    let updateSerie = (event) => {
        let $this = $(event.currentTarget);
        let $parent = $this.parents('.input-group');
        let $input = $parent.find('.serie-equation')
        let i = $parent.data('serieI');

        objects[i].equation = $input.val();
        objects[i].outdate();

        time = workSpace.axes[2].min;
        redraw(i);
    };

    let updateVectorField = (event) => {
        let $this = $(event.currentTarget);
        let $parent = $this.parents('.vector-field-xy');
        let $Vx = $parent.find('.vector-field-xy-x');
        let $Vy = $parent.find('.vector-field-xy-y');
        let i = $parent.data('vectorFieldI');

        objects[i].components[0].equation = $Vx.val();
        objects[i].components[1].equation = $Vy.val();
        objects[i].outdate();

        time = workSpace.axes[2].min;
        objects[i].resetParticles(workSpace);
        redraw(i);
    };

    let updateMatrixField = () => {
        let $this = $(event.currentTarget);
        let $parent = $this.parents('.matrix-field-xy');
        let $xx = $parent.find('.form-control.vector-field-xx');
        let $xy = $parent.find('.form-control.vector-field-xy');
        let $yx = $parent.find('.form-control.vector-field-yx');
        let $yy = $parent.find('.form-control.vector-field-yy');
        let i = $parent.data('matrixFieldI');

        objects[i].components[0].components[0].equation = $xx.val();
        objects[i].components[0].components[1].equation = $xy.val();
        objects[i].components[1].components[0].equation = $yx.val();
        objects[i].components[1].components[1].equation = $yy.val();
        objects[i].outdate();

        time = workSpace.axes[2].min;
        objects[i].resetParticles(workSpace);
        redraw(i);
    };

    let updateX = () => {
        clearCanvas(ctxt);

        workSpace.axes[0].min = 1 * $minX.val();
        workSpace.axes[0].max = 1 * $maxX.val();
        workSpace.axes[0].steps = 1 * $stepsX.val();
        time = workSpace.axes[2].min;

        for (let oid in objects) {
            if (!isVectorField(objects[oid])) {
                continue;
            }

            objects[oid].particles = createParticles(workSpace, objects[oid].color);
        }

        redraw();
    };

    let updateY = () => {
        clearCanvas(ctxt);

        workSpace.axes[1].min = 1 * $minY.val();
        workSpace.axes[1].max = 1 * $maxY.val();
        workSpace.axes[1].steps = 1 * $stepsY.val();
        time = workSpace.axes[2].min;

        for (let oid in objects) {
            if (!isVectorField(objects[oid])) {
                continue;
            }

            objects[oid].particles = createParticles(workSpace, objects[oid].color);
        }

        redraw();
    };

    let updateTime = () => {
        clearCanvas(ctxt);

        workSpace.axes[2].min = 1 * $minTime.val();
        workSpace.axes[2].max = 1 * $maxTime.val();
        workSpace.axes[2].steps = 1 * $stepsTime.val();
        time = workSpace.axes[2].min;

        redraw();
    };

    let pause = (event) => {
        paused = true;
        $(event.currentTarget).siblings('.play-btn').children()
            .toggleClass('fa-play', true)
            .toggleClass('fa-pause', false);
    };

    let nextFrame = (event) => {
        time += workSpace.axes[2].getIncrement();

        pause(event);

        redraw();
    };

    let previousFrame = (event) => {
        time -= workSpace.axes[2].getIncrement();

        pause(event);

        redraw();
    }

    let play = (event) => {
        $icon = $(event.currentTarget).children('i');

        paused = !$icon.hasClass('fa-play');
        $icon
            .toggleClass('fa-play', paused)
            .toggleClass('fa-pause', !paused);

        stopped = false;

        redraw();
    };

    let stop = (event) => {
        paused = false;
        stopped = true;
        time = workSpace.axes[2].min;

        pause(event);

        redraw();
    };

    let toMaxTime = (event) => {
        pause(event);

        time = workSpace.axes[2].max;

        redraw();
    };

    $('.sub-time-btn').click(previousFrame);
    $('.add-time-btn').click(nextFrame);
    $('.play-btn').click(play);
    $('.stop-btn').click(stop);
    $('.max-time-btn').click(toMaxTime);
    $('.function-x-btn').click(updateX);
    $('.function-y-btn').click(updateY);
    $('.function-t-btn').click(updateTime);

    let hideObject = (event) => {
        $btn = $(event.currentTarget);
        $parents = $btn.parents('.function-input-group, .vector-field-xy, .matrix-field-xy');
        let oid = $parents.data('functionI');
        if (undefined == oid) {
            oid = $parents.data('vectorFieldI');
        }
        if (undefined == oid) {
            oid = $parents.data('matrixFieldI');
        }

        let $icon = $btn.children().eq(0);

        if (isVectorField(objects[oid])) {
            var nextIcon = 'fa-eye';
            showVectors = true;
            showParticles = true;
            if ($icon.hasClass('fa-eye')) {
                nextIcon = 'fa-arrows';
                showVectors = true;
                showParticles = false;
            } else if ($icon.hasClass('fa-arrows')) {
                nextIcon = 'fa-bullseye';
                showVectors = false;
                showParticles = true;
            } else if ($icon.hasClass('fa-bullseye')) {
                nextIcon = 'fa-eye-slash';
                showVectors = false;
                showParticles = false;
            }

            objects[oid].toggleCanvas(showVectors);
            objects[oid].toggleParticules(showParticles);

            $icon
                .toggleClass('fa-eye', nextIcon == 'fa-eye')
                .toggleClass('fa-arrows', nextIcon == 'fa-arrows')
                .toggleClass('fa-bullseye', nextIcon == 'fa-bullseye')
                .toggleClass('fa-eye-slash', nextIcon == 'fa-eye-slash');
        } else {
            objects[oid].toggleCanvas();
            $icon
                .toggleClass('fa-eye')
                .toggleClass('fa-eye-slash');
        }
    };

    let pulseObject = (event) => {
        $btn = $(event.currentTarget);
        $parents = $btn.parents('.function-input-group, .vector-field-xy, .matrix-field-xy');
        let oid = $parents.data('functionI');
        if (undefined == oid) {
            oid = $parents.data('vectorFieldI');
        }
        if (undefined == oid) {
            oid = $parents.data('matrixFieldI');
        }

        var ctxt = objects[oid].ctxt;
        if (objects[oid] instanceof Pulse) {
            objects[oid] = objects[oid].fun;
        } else {
            objects[oid] = new Pulse(objects[oid]);
        }

        objects[oid].ctxt = ctxt;

        $btn.children()
            .toggleClass('fa-signal')
            .toggleClass('fa-list');

        redraw(oid);
    };

    let addCanvas = (oid) => {
        let $viewer = $('#viewer');
        let $canvas = $('<canvas></canvas>');
        $viewer.before($canvas);

        return $canvas
            .attr('id', 'oid-' + oid)
            .attr('width', $viewer.attr('width'))
            .attr('height', $viewer.attr('width'))
            .data('oid', oid)
            .css('z-index', oid);
    };

    let addFunction = (event, data, oid) => {
        event && event.preventDefault();
        let i = oid || objects.length;

        let html = $('.function-template').html()
            .replace(/\{\{i\}\}/ig, i);

        if (data) {
            for (var varName in data) {
                html = html.replace(new RegExp('\\{\\{' + varName + '\\}\\}', 'ig'), data[varName]);
            }

            addCanvas(i);
            data.ctxt = getObjectCtxt(i);
        } else {
            objects.push(new MathFunction('y' + i, '', randomColor()));

            addCanvas(i);
            objects[i].ctxt = getObjectCtxt(i);
            html = html
                .replace(/\{\{name\}\}/ig, '')
                .replace(/\{\{equation\}\}/ig, '');
        }

        if (isVectorField(objects[i])) {
            addCanvas(i+1);
            data.particlesCtxt = getObjectCtxt(i+1);
            data.particles = data.particles || createParticles(workSpace, objects[oid].color);
        }

        $elt = $(html);

        $elt.find('.update-function-btn').click(updateFunction);
        $elt.find('.hide-btn').click(hideObject);
        $elt.find('.pulse-btn').click(pulseObject);

        $('.objects-container').append($elt);
    };

    let addSerie = (event, data, oid) => {
        event && event.preventDefault();
        let i = oid || objects.length;

        let html = $('.serie-template').html()
            .replace(/\{\{i\}\}/ig, i);

        if (data) {
            for (var varName in data) {
                html = html.replace(new RegExp('\\{\\{' + varName + '\\}\\}', 'ig'), data[varName]);
            }

            addCanvas(i);
            data.ctxt = getObjectCtxt(i);
        } else {
            objects.push(new Serie('s' + i, '', 'time', workSpace.axes[2], 0, randomColor()));
            // @todo initialValue field

            addCanvas(i);
            objects[i].ctxt = getObjectCtxt(i);
            html = html
                .replace(/\{\{name\}\}/ig, '')
                .replace(/\{\{equation\}\}/ig, '');
        }

        $elt = $(html);

        $elt.find('.update-serie-btn').click(updateSerie);
        $elt.find('.hide-btn').click(hideObject);
        $elt.find('.pulse-btn').click(pulseObject);

        $('.objects-container').append($elt);
    };

    let addVectorField = (event, data, idx) => {
        event && event.preventDefault();
        let i = idx || objects.length;

        let html = $('.vector-field-xy-template').html()
            .replace(/\{\{i\}\}/ig, i);

        let color = data && data.color ? data.color : randomColor();
        let particles = createParticles(workSpace, color);

        // console.log(particles);

        if (data) {
            for (var varName in data) {
                html = html.replace(new RegExp('\\{\\{' + varName + '\\}\\}', 'ig'), data[varName]);
            }
            for (var component of data.components) {
                html = html.replace(new RegExp('\\{\\{V' + component.name + '\\}\\}', 'ig'), component.equation);
            }

            addCanvas(i);
            data.ctxt = getObjectCtxt(i);

            addCanvas(i+1);
            data.particlesCtxt = getObjectCtxt(i+1);
            data.particles = data.particles || particles;
        } else {
            objects.push(
                new VectorField(
                    'v' + i,
                    [new MathFunction('x', ''), new MathFunction('y', '')],
                    color,
                    particles
                )
            );

            addCanvas(i);
            objects[i].ctxt = getObjectCtxt(i);

            html = html
                .replace(/\{\{name\}\}/ig, '')
                .replace(/\{\{Vx\}\}/ig, '')
                .replace(/\{\{Vy\}\}/ig, '');
        }

        $elt = $(html);

        $elt.find('.update-vector-field-xy-btn').click(updateVectorField);
        $elt.find('.hide-btn').click(hideObject);
        $elt.find('.pulse-btn').click(pulseObject);

        $('.objects-container').append($elt);
    };

    let addMatrixField = (event, data, idx) => {
        event && event.preventDefault();
        let i = idx || objects.length;

        let html = $('.matrix-field-xy-template').html()
            .replace(/\{\{i\}\}/ig, i);

        let color = data && data.color ? data.color : randomColor();
        let particles = createParticles(workSpace, color);

        // console.log(particles);

        let j = 0;
        if (data) {
            for (var varName in data) {
                html = html.replace(new RegExp('\\{\\{' + varName + '\\}\\}', 'ig'), data[varName]);
            }

            for (var mc in data.components) {
                for (var vc in data.components[mc].components) {
                    html = html.replace(
                        new RegExp(
                            '\\{\\{M'
                                + data.components[mc].name
                                + 'V' + data.components[mc].components[vc].name
                                + '\\}\\}',
                            'ig'
                        ),
                        data.components[mc].components[vc].equation
                    );
                }
                addCanvas(''+i+j);
                data.components[mc].ctxt = getObjectCtxt(''+i+j);
                j++;
            }

            addCanvas(''+i+j);
            data.particlesCtxt = getObjectCtxt(''+i+j);
            data.particles = data.particles || particles;
        } else {
            objects.push(
                new MatrixField(
                    'm' + i,
                    [
                        new VectorField('x', [new MathFunction('x', ''), new MathFunction('y', '')], color),
                        new VectorField('y', [new MathFunction('x', ''), new MathFunction('y', '')], color)
                    ],
                    color,
                    particles
                )
            );

            for (var mc of objects[i].components) {
                addCanvas(''+i+j);
                mc.ctxt = getObjectCtxt(''+i+j);
                j++;
            }

            addCanvas(''+i+j);
            objects[i].particlesCtxt = getObjectCtxt(''+i+j);
            objects[i].particles = particles;

            html = html
                .replace(/\{\{name\}\}/ig, '')
                .replace(/\{\{MxVx\}\}/ig, '')
                .replace(/\{\{MxVy\}\}/ig, '')
                .replace(/\{\{MyVx\}\}/ig, '')
                .replace(/\{\{MyVy\}\}/ig, '');
        }

        $elt = $(html);

        $elt.find('.update-matrix-field-xy-btn').click(updateMatrixField);
        $elt.find('.hide-btn').click(hideObject);
        $elt.find('.pulse-btn').click(pulseObject);

        $('.objects-container').append($elt);
    };

    $('.add-function-btn').click(addFunction);
    $('.add-serie-btn').click(addSerie);
    $('.add-vector-field-xy-btn').click(addVectorField);
    $('.add-matrix-field-xy-btn').click(addMatrixField);

    for (let oid in objects) {
        if (objects[oid] instanceof MathFunction) {
            addFunction(undefined, objects[oid], oid);
        } else if (objects[oid] instanceof Serie) {
            addSerie(undefined, objects[oid], oid);
        } else if (objects[oid] instanceof MatrixField) {
            addMatrixField(undefined, objects[oid], oid);
        } else if (objects[oid] instanceof VectorField) {
            addVectorField(undefined, objects[oid], oid);
        }
    }

    let positionCapture = (event) => {
        let canvasPos = $canvas.offset();
        let pos = new Vector2(
            event.pageX - canvasPos.left,
            event.pageY - canvasPos.top
        );

        let spacePos = workSpace.toLocal(workSpace.mergeContextAndVector({'time': time}, pos));

        let $cap = $('.capture');
        let $table = $cap.find('.data tbody');
        $table.children('.pos-varying').remove();

        $table
            .append(
                $('<tr class="pos-varying"></tr>')
                    .append($('<td></td>').text('x'))
                    .append($('<td></td>').text(spacePos.x))
            )
            .append(
                $('<tr class="pos-varying"></tr>')
                    .addClass('pos-varying')
                    .append($('<td></td>').text('y'))
                    .append($('<td></td>').text(spacePos.y))
            );

        for (let oid in objects) {
            let args = {'x': spacePos.x, 'y': spacePos.y, 'time': time};
            let val = objects[oid] instanceof Pulse ? objects[oid].evaluate(workSpace, args) : objects[oid].evaluate(args);

            let $elt = $('<tr class="pos-varying"></tr>');
            $table.append($elt);

            $elt.append($('<td class="object-legend" style="background-color: ' + objects[oid].color + ';"></td>').text(objects[oid].name));
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

    $canvas
        .mouseenter((event) => {
            $('body').on('mousemove', positionCapture);
        })
        .mouseleave((event) => {
            $('body').off('mousemove', positionCapture);
        });

    let doit;
    $(window).on('resize', () => {
        if (doit) cancelAnimationFrame(doit);
        doit = requestAnimationFrame(resize);
    });

    resize();
});
