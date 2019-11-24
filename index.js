$(() => {
    let $canvas = $('#viewer'),
        canvas = $canvas.get(0);

    let ctxt = canvas.getContext('2d');

    let minX = -10,
        stepsX = 100,
        maxX = 10;

    let minY = -10,
        stepsY = 100,
        maxY = 10;

    let minTime = 0,
        time = minTime,
        paused = true,
        stopped = false,
        stepsTime = 100;
        maxTime = 100;

    let drawPoints = true;
    let pointSize = 5;
    let width, height, ratioX, ratioY;

    let randomColor = (alpha) => {
        return 'rgba('
            + Math.round(Math.random() * 255) + ', '
            + Math.round(Math.random() * 255) + ', '
            + Math.round(Math.random() * 255) + ', '
            + (alpha || 1)
            + ')';
    };

    let functions = [/*
        {
            name: 'y00',
            equation: 'pow(cos({time} * {x}), 2) + pow(sin({time} * {y}), 2)',
            color: 'red'
        },
        {
            name: 'y01',
            equation: 'pow(cos({time} * {x}), 2) - pow(sin({time} * {y}), 2)',
            color: 'orange'
        },
        {
            name: 'y02',
            equation: '- pow(-cos({time} * {x}), 2) + pow(sin({time} * {y}), 2)',
            color: 'yellow'
        },
        {
            name: 'y03',
            equation: '- pow(cos({time} * {x}), 2) - pow(sin({time} * {y}), 2)',
            color: 'maroon'
        },*//*
        {
            name: 'y10',
            equation: 'pow(cos({time} * {y}), 2) + pow(sin({time} * {x}), 2)',
            color: 'blue'
        },
        {
            name: 'y11',
            equation: 'pow(cos({time} * {y}), 2) - pow(sin({time} * {x}), 2)',
            color: 'teal'
        },
        {
            name: 'y12',
            equation: '- pow(cos({time} * {y}), 2) + pow(sin({time} * {x}), 2)',
            color: 'navy'
        },
        {
            name: 'y13',
            equation: '- pow(cos({time} * {y}), 2) - pow(sin({time} * {x}), 2)',
            color: 'aqua'
        },*/
        {
            name: 'y14',
            equation: 'pow(cos({time} * {y}), 2) - pow(sin({time} * {x}), 2)',
            color: 'red'
        }//*/
    ];
/*
    let functions = [
        {
            name: 'y0',
            equation: '{x}',
            color: randomColor()
        },
        {
            name: 'y1',
            equation: 'pow({x}, 2)-pow({y}, 2)',
            color: randomColor()
        },
        {
            name: 'y2',
            equation: 'pow(cos({time} * {y}), 2) - pow(sin({time} * {x}), 2)',
            color: randomColor()
        },
        {
            name: 'y3',
            equation: 'pow(cos({x}), 3)',
            color: randomColor()
        },
        {
            name: 'y4',
            equation: 'cos({x})',
            color: randomColor()
        },
        {
            name: 'y5',
            equation: 'sin({x})',
            color: randomColor()
        },
        {
            name: 'y6',
            equation: '-cos({x})',
            color: randomColor()
        },
        {
            name: 'y7',
            equation: '-sin({x})',
            color: randomColor()
        },
        {
            name: 'y8',
            equation: '{x} * sin(exp({time} * {x}))',
            color: randomColor()
        },
        {
            name: 'y9',
            equation: '{x} * sin(exp(-{x}))',
            color: randomColor()
        }
    ];
*/
    let vectorFields = [
        {
            'name': 'v0',
            'Vx': '{x} * {y}',
            'Vy': '{x} - {y}',
            'color': randomColor(),
            'normalize': true
        }
    ];

    let vecToPoint = (x, y) => {
        return [
            Math.round(x * ratioX),
            -1 * Math.round(y * ratioY)
        ];
    };

    let normalizeVector = (x, y) => {
        let length = vectorLength(x, y);
        return [x / length, y / length];
    };

    let vectorLength = (x, y) => {
        return Math.sqrt(x * x + y * y);
    };

    let drawAxis = (x, y, color, markerLengthX, markerLengthY, axisPadding, otherAxisPadding, fontSize, fontFamily) => {
        markerLengthX = markerLengthX || (maxX - minX) / 100;
        markerLengthY = markerLengthY || (maxY - minY) / 100;
        axisPadding = axisPadding || 0;
        otherAxisPadding = otherAxisPadding || 10;
        fontSize = fontSize || 12;
        fontFamily = fontFamily || 'Arial';
        ctxt.font = fontSize + 'px ' + fontFamily;
        ctxt.strokeStyle = color || 'black';
        ctxt.lineWidth = 1;
        ctxt.beginPath();
        ctxt.moveTo.apply(ctxt, vecToPoint(x * minX, y * minY));
        ctxt.lineTo.apply(ctxt, vecToPoint(x * maxX, y * maxY));
        ctxt.stroke();

        let pos, textWidth;
        let min = Math.ceil(minX * x + minY * y);
        let max = Math.floor(maxX * x + maxY * y);
        let inc = Math.ceil((max - min) / 10);
        for (var i = min; i < max; i += inc) {
            if (i == 0) {
                continue;
            }

            ctxt.beginPath();
            ctxt.moveTo.apply(ctxt, vecToPoint(i * x, i * y));
            ctxt.lineTo.apply(ctxt, vecToPoint(i * x + markerLengthX * y, i * y + markerLengthY * x));
            ctxt.stroke();

            pos = vecToPoint(i * x, i * y);
            ctxt.fillText(
                i,
                pos[0] - x * axisPadding - otherAxisPadding * y - Math.round(ctxt.measureText(i).width / 2),
                pos[1] + y * axisPadding + otherAxisPadding * x + Math.round(fontSize / 2)
            );
        }
    };

    let drawLine = (ctxt, points, color, pointRenderer, pointSize, pointColor) => {
        pointColor = pointColor || color;
        ctxt.strokeStyle = color;
        ctxt.beginPath();

        for (var i = 0; i < points.length; i++) {
            if (i === 0) {
                ctxt.moveTo(points[i][0], points[i][1]);
            } else {
                ctxt.lineTo(points[i][0], points[i][1]);
            }

            if (typeof pointRenderer  == 'function') {
                pointRenderer(points[i][0], points[i][1], pointSize, pointColor);
            }
        }

        ctxt.stroke();
    };

    let makePoint = (x, y, size, color)  => {
        size = size || 3;
        ctxt.fillStyle = color;
        ctxt.fillRect(x - Math.floor(size/2), y - Math.floor(size/2), size, size);
    };

    let drawVector = (ctxt, x, y, dfx, dfy, color) => {
        if (dfx == 0 && dfy == 0) {
            return;
        }

        ctxt.strokeStyle = color;
        ctxt.beginPath();
        ctxt.moveTo(x, y);
        ctxt.lineTo(x + dfx, y + dfy);
        ctxt.stroke();

        let l = vectorLength(dfx, dfy);

        ctxt.beginPath();
        ctxt.lineWidth = 1;
        ctxt.moveTo(x + dfx, y + dfy);
        let theta = Math.PI / 8,
            cosTheta = Math.cos(theta),
            sinTheta = Math.sin(theta);

        ctxt.lineTo(
            x + dfx - 0.25 * (dfx * cosTheta + dfy * sinTheta),
            y + dfy - 0.25 * (dfy * cosTheta - dfx * sinTheta)
        );
        ctxt.stroke();

        ctxt.beginPath();
        ctxt.moveTo(x + dfx, y + dfy);
        ctxt.lineTo(
            x + dfx - 0.25 * (dfx * cosTheta - dfy * sinTheta),
            y + dfy - 0.25 * (dfy * cosTheta + dfx * sinTheta)
        );
        ctxt.stroke();
    };

    let legend = (ctxt, functions, withEquation) => {
        withEquation = withEquation || false;
        ctxt.fillStyle = '#ff0000';
        posX = -ctxt.canvas.width/2 + 10;
        posY = ctxt.canvas.height/2 - functions.length * 25;

        for (var f = 0; f < functions.length; f++) {
            ctxt.strokeStyle = functions[f].color;
            ctxt.beginPath();
            ctxt.moveTo(posX, posY + 10);
            ctxt.lineTo(posX + 10, posY + 10);
            ctxt.lineWidth = 4;
            ctxt.stroke();

            ctxt.fillStyle = 'black';
            ctxt.font = '20px Arial';
            ctxt.fillText(
                functions[f].name + (withEquation ? ' = ' + functions[f].equation : ''),
                posX + 20,
                posY + 15
            );

            posY += 25;
        }
    };

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

    let refreshUI = () => {
        $minX.val(minX);
        $stepsX.val(stepsX);
        $maxX.val(maxX);

        $minY.val(minY);
        $stepsY.val(stepsY);
        $maxY.val(maxY);

        $time.text(time + (typeof maxTime == typeof undefined ? '' : ' / ' + maxTime));

        $minTime.val(minTime);
        $stepsTime.val(stepsTime);
        $maxTime.val(maxTime);
    };

    let clean = true;
    let draw = () => {
        refreshUI();
        if (clean) {
            clean = false;
        } else {
            ctxt.clearRect(minX * ratioX, -maxY * ratioY, width, height);
        }

        // console.log(minX, maxX, minY, maxY);
        let lines = {}, fieldValues = {};
        let x = minX, dx = (maxX - minX) / stepsX;
        let context, MathFunctions = Object.getOwnPropertyNames(Math);
        let animate = false;

        let varNames = ['x', 'dx', 'y', 'dy', 'time', 'dtime'];
        for (var f = 0; f < functions.length; f++) {
            functions[f].lines = [];
            var eq = functions[f].equation;

            for (var idx in MathFunctions) {
                eq = eq.replace(new RegExp(MathFunctions[idx], 'g'), 'Math.' + MathFunctions[idx]);
            }
            for (var varName in varNames) {
                eq = eq.replace(
                    new RegExp('\{' + varNames[varName] + '\}', 'g'),
                    'this.' + varNames[varName]
                );
            }

            functions[f].jsEquation = '(function(){return '
                + eq
                + ';}).apply(context);';

            varNames.push(functions[f].name);

            if (!animate && functions[f].equation.match(/\{time\}/)) {
                animate = true;
            }
        }

        for (var v in vectorFields) {
            let components = ['Vx', 'Vy'];
            for (let c in components) {
                let eq = vectorFields[v][components[c]];

                if (!animate && eq.match(/\{time\}/)) {
                    animate = true;
                }

                for (var idx in MathFunctions) {
                    eq = eq.replace(new RegExp(MathFunctions[idx], 'g'), 'Math.' + MathFunctions[idx]);
                }
                for (var varName in varNames) {
                    eq = eq.replace(
                        new RegExp('\{' + varNames[varName] + '\}', 'g'),
                        'this.' + varNames[varName]
                    );
                }

                vectorFields[v]['js' + components[c]] = '(function(){return '
                    + eq
                    + ';}).apply(context);';
            }
        }

        while (x <= maxX) {
            context = {'x' : x, 'dx' : dx, 'time': time, 'dtime': (maxTime-minTime)/stepsTime};
            partialFields = [];
            for (var f = 0; f < functions.length; f++) {
                // vector field
                if (functions[f].equation.match(/\{y\}/i)) {
                    partialFields.push(f);
                    continue;
                }

                if (!lines[f]) {
                    lines[f] = [];
                }

                context[functions[f].name] = eval(functions[f].jsEquation);
                lines[f].push(vecToPoint(x, context[functions[f].name]));
            }

            if (partialFields.length > 0 || vectorFields.length > 0) {
                let y = minY, dy = (maxY - minY) / stepsY;
                while (y <= maxY) {
                    context.y = y;
                    context.dy = dy;

                    let point = vecToPoint(x, y);

                    for (var f = 0; f < partialFields.length; f++) {
                        if (!fieldValues[partialFields[f]]) {
                            fieldValues[partialFields[f]] = {};
                        }
                        if (!fieldValues[partialFields[f]][x]) {
                            fieldValues[partialFields[f]][x] = {};
                        }

                        fieldValues[partialFields[f]][x][y]
                            = eval(functions[partialFields[f]].jsEquation);
                    }

                    for (var v in vectorFields) {
                        let vector = [eval(vectorFields[v].jsVx), eval(vectorFields[v].jsVy)];

                        if (vectorFields[v].hasOwnProperty('normalize') && vectorFields[v].normalize) {
                            vector = normalizeVector(vector[0], vector[1]);
                        }

                        vector = vecToPoint(vector[0], vector[1]);

                        // console.log(vectorFields[v].jsVx, vx, vectorFields[v].jsVy, vy, vector);
                        drawVector(
                            ctxt,
                            point[0],
                            point[1],
                            vector[0],
                            vector[1],
                            vectorFields[v].color
                        );
                    }

                    y += dy;
                }
            }

            x += dx;
        }

        for (var f = 0; f < functions.length; f++) {
            if (lines[f]) {
                drawLine(
                    ctxt,
                    lines[f],
                    functions[f].color,
                    drawPoints ? makePoint : undefined,
                    drawPoints ? pointSize : undefined
                );
            }

            if (fieldValues[f]) {
                let prevI, prevJ;
                let xs = Object.keys(fieldValues[f]).map((val) => 1 * val).sort((a,b) => a - b);

                for (let idx in xs) {
                    let i = xs[idx];
                    if (typeof prevI == typeof undefined) {
                        prevI = i;
                        continue;
                    }

                    let ys = Object.keys(fieldValues[f][i]).map((val) => 1 * val).sort((a,b) => a - b);
                    for (let jdx in ys) {
                        let j = ys[jdx];
                        if (typeof prevJ == typeof undefined) {
                            prevJ = j;
                            continue;
                        }

                        let v = fieldValues[f][i][j],
                            vX = fieldValues[f][prevI][j],
                            vY = fieldValues[f][i][prevJ],
                            point = vecToPoint((prevI + i) / 2, (prevJ + j) / 2),
                            vec = vecToPoint.apply(undefined, normalizeVector((vX - v) / (prevI - i), (vY - v) / (prevJ - j)));

                        drawVector(
                            ctxt,
                            point[0],
                            point[1],
                            vec[0],
                            vec[1],
                            functions[f].color
                        );

                        prevJ = j;
                    }

                    prevI = i;
                    prevJ = undefined;
                }
            }
        }

        drawAxis(1, 0);
        drawAxis(0, 1);

        let objects = [];
        objects.push.apply(objects, functions);
        objects.push.apply(objects, vectorFields);
        legend(ctxt, objects);
        let dt = (maxTime - minTime) / stepsTime;
        time += dt;
        console.log(animate, !paused, !stopped, time, maxTime);
        if (animate && !paused && !stopped && dt > 0 && time <= maxTime) {
            redraw();
            return;
        }
        time -= dt;
    };

    let redrawId;
    let redraw = () => {
        if (redrawId) cancelAnimationFrame(redrawId);
        redrawId = requestAnimationFrame(draw);
    }

    let updateFunction = (event) => {
        let $this = $(event.currentTarget);
        let $parent = $this.parents('.input-group');
        let $input = $parent.find('.function-equation')
        let i = $parent.data('functionI');
        if (typeof i != typeof undefined) {

            if (!functions[i]) {
                functions.push({
                    'name': 'y' + i,
                    'color': randomColor()
                });
            }
            functions[i].equation = $input.val();
        }

        time = minTime;
        redraw();
    };

    let updateVectorField = (event) => {
        let $this = $(event.currentTarget);
        let $parent = $this.parents('.vector-field-xy');
        let $Vx = $parent.find('.vector-field-xy-x');
        let $Vy = $parent.find('.vector-field-xy-y');
        let i = $parent.data('vectorFieldI');
        if (typeof i != typeof undefined) {
            if (!vectorFields[i]) {
                vectorFields.push({
                    'name': 'v' + i,
                    'color': randomColor()
                });
            }
            vectorFields[i].Vx = $Vx.val();
            vectorFields[i].Vy = $Vy.val();
        }

        time = minTime;
        redraw();
    };

    let updateX = () => {
        ctxt.translate(minX * ratioX, -maxY * ratioY);

        minX = 1 * $minX.val();
        stepsX = 1 * $stepsX.val();
        maxX = 1 * $maxX.val();
        ratioX = width / (maxX - minX);

        ctxt.translate(-minX * ratioX, maxY * ratioY);
        redraw();
    };

    let updateY = () => {
        ctxt.translate(minX * ratioX, -maxY * ratioY);

        minY = 1 * $minY.val();
        stepsY = 1 * $stepsY.val();
        maxY = 1 * $maxY.val();
        ratioY = height / (maxY - minY);

        ctxt.translate(-minX * ratioX, maxY * ratioY);
        redraw();
    };

    let updateTime = () => {
        minTime = 1 * $minTime.val();
        stepsTime = 1 * $stepsTime.val();
        maxTime = 1 * $maxTime.val();

        redraw();
    };

    let pause = (event) => {
        paused = true;
        $(event.currentTarget).siblings('.play-btn').children()
            .toggleClass('fa-play', true)
            .toggleClass('fa-pause', false);
    };

    let nextFrame = (event) => {
        let dt = (maxTime - minTime) / stepsTime;
        time += dt;

        pause(event);

        redraw();
    }

    let previousFrame = (event) => {
        let dt = (maxTime - minTime) / stepsTime;
        time -= dt;

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
        time = minTime;

        pause(event);

        redraw();
    };

    let toMaxTime = (event) => {
        pause(event);

        time = maxTime;

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

    let addFunction = (event, data, idx) => {
        event && event.preventDefault();
        let i = $('.function-input-group-container .function-input-group:last').data('functionI');
        if (typeof i != typeof undefined) {
            i++;
        } else {
            i = 0;
        }
        let html = $('.function-template').html()
            .replace(/\{\{i\}\}/ig, i);

        if (data) {
            for (var varName in data) {
                html = html.replace(new RegExp('\\{\\{' + varName + '\\}\\}', 'ig'), data[varName]);
            }
        } else {
            html = html
                .replace(/\{\{name\}\}/ig, '')
                .replace(/\{\{equation\}\}/ig, '');
        }

        $elt = $(html);

        $elt
            .find('.update-function-btn').click(updateFunction);

        $('.function-input-group-container').append($elt);
    };

    $('.add-function-btn').click(addFunction);
    for (var f = 0; f < functions.length; f++) {
        functions[f].name = 'y' + f;
        addFunction(undefined, functions[f], f);
    }

    let addVectorField = (event, data, idx) => {
        event && event.preventDefault();
        let i = $('.vector-field-xy-container .vector-field-xy:last').data('vectorFieldI');
        if (typeof i != typeof undefined) {
            i++;
        } else {
            i = 0;
        }
        let html = $('.vector-field-xy-template').html()
            .replace(/\{\{i\}\}/ig, i);

        if (data) {
            for (var varName in data) {
                html = html.replace(new RegExp('\\{\\{' + varName + '\\}\\}', 'ig'), data[varName]);
            }
        } else {
            html = html
                .replace(/\{\{name\}\}/ig, '')
                .replace(/\{\{Vx\}\}/ig, '')
                .replace(/\{\{Vy\}\}/ig, '');
        }

        $elt = $(html);

        $elt
            .find('.update-vector-field-xy-btn').click(updateVectorField);

        $('.vector-field-xy-container').append($elt);
    };

    $('.add-vector-field-xy-btn').click(addVectorField);
    for (var v = 0; v < vectorFields.length; v++) {
        vectorFields[v].name = 'v' + v;
        addVectorField(undefined, vectorFields[v], v);
    }

    $('.update-function-btn').click(updateFunction);

    let resize = () => {
        time = minTime;
        canvas.width = $canvas.parent().innerWidth();
        canvas.height = $canvas.parent().innerHeight();

        width = canvas.width;
        height = canvas.height;

        ratioX = width / (maxX - minX);
        ratioY = height / (maxY - minY);

        ctxt.translate(-minX * ratioX, maxY * ratioY);

        draw();
    };

    let doit;
    $(window).on('resize', () => {
        if (doit) cancelAnimationFrame(doit);
        doit = requestAnimationFrame(resize);
    });

    resize();
});
