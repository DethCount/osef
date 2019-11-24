$(() => {
    let $canvasContainer = $('.canvas-container'),
        $canvas = $('#viewer')
            .attr('width', $canvasContainer.innerWidth())
            .attr('height', $canvasContainer.innerHeight()),
        canvas = $canvas.get(0),
        ctxt = canvas.getContext('2d'),
        spaceColor = randomColor(),
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
        canvasSpace,
        undefined,
        undefined,
        new MatrixField(
            'm0',
            [
                new VectorField(
                    'x',
                    [
                        new MathFunction('x', 'sin({time}/{x}/{y})/1.5'),
                        new MathFunction('y', 'cos({time}/{x}/{y})/1.5')
                    ],
                    'red'
                ),
                new VectorField(
                    'y',
                    [
                        new MathFunction('x', 'cos({time}/{x}/{y})/1.5'),
                        new MathFunction('y', '-sin({time}/{x}/{y})/1.5')
                    ],
                    'green'
                )
            ],
            spaceColor
        )
    );

    let objects = [
        new MathFunction('y0', '{time}'),
        new MathFunction('y0', 'cos(({x}/({time}%10))*PI)'),
        new MathFunction('y0', 'sin(2 * PI * {x} + {time})'),
        new MathFunction('y1', 'pow({x}, 2) + pow({y}, 2)'),
        new MathFunction('y2', 'pow(cos({time} * {y}), 2) - pow(sin({time} * {x}), 2)'),
        new Serie('s0', '{prev}+1', 'time', workSpace.axes[2], 1),
        new Serie('s0', 'sin({x}*{y}+{prev})', 'time', workSpace.axes[2], 1),
        new VectorField(
            'v0',
            [
                new MathFunction('x', '{x} * {y}'),
                new MathFunction('y', '{x} - {y}')
            ]
        ),
        new VectorField(
            'v1',
            [
                new MathFunction('x', 'cos({x})*-sin({y})'),
                new MathFunction('y', '-sin({y}) * cos({x})')
            ]
        )
    ];

    var workSpaceUI = new SpaceUI(
        1,
        workSpace,
        $('#form'),
        $('.canvas-container'),
        $canvas,
        spaceColor,
        objects,
        undefined,
        $('.axis-template').html()
    );

    window.workSpaceUI = workSpaceUI;

    workSpaceUI.render();

    $(window).on('resize', () => {
        workSpaceUI.resize(true, false);
        canvasSpace.resize();
        workSpaceUI.render();
    });
});
