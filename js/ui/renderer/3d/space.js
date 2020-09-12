class Space3dRenderer {
    constructor(spaceUI) {
        this.spaceUI = spaceUI;
        this.ctxt = this.spaceUI.$canvas.get(0).getContext('webgl2');
        this.program = new Math3dProgramLine(this.ctxt, this.spaceUI.color);

        this.initNormalizedCanvas = true;
    }

    clear(recursive) {
        this.ctxt.clearColor(0, 0, 0, 0);
        this.ctxt.clear(this.ctxt.COLOR_BUFFER_BIT);

        if (recursive !== false) {
            this.spaceUI.$canvasContainer.children().each((idx, elt) => {
                var canvas = $(elt).get(0);
                var ctxt = canvas.getContext('webgl2');

                if (!ctxt) {
                    return;
                }

                ctxt.clearColor(0, 0, 0, 0);
                ctxt.clear(ctxt.COLOR_BUFFER_BIT);
            });
        }

        if (this.initNormalizedCanvas) {
            let space = this.spaceUI.space;
            while (!(space.parent instanceof CanvasSpace)) {
                space = space.parent;
            }

            if (space.parent instanceof CanvasSpace) {
                space.parent = new NormalizedSpace();
            }

            this.initNormalizedCanvas = false;
        }
    }

    render(context, animate, animationComponent) {
        this.clear();
        this.spaceUI.resize(true, false);

        context = $.extend(this.spaceUI.getStartContext(), this.spaceUI.currentContext || {}, context || {});

        let prevContext;

        this.spaceUI.space.each(
            (context) => {
                for (var oid in this.spaceUI.objectsUI) {
                    this.spaceUI.objectsUI[oid].render(context, prevContext, false);
                }
                prevContext = $.extend({}, context);
            },
            context
        );

        this.renderBoundaries(context, this.spaceUI.color);

        for (var component in this.spaceUI.axesUI) {
            if (component == 'time') continue;
            this.spaceUI.axesUI[component].render(this.ctxt, context);
        }
    }

    renderBoundaries(context) {
        let vertices = [];
        var first = true;

        var factor = 100;

        context.x = this.spaceUI.space.getAxisByName('x').min;
        for (context.y = this.spaceUI.space.getAxisByName('y').min;
            context.y <= this.spaceUI.space.getAxisByName('y').max;
            context.y += this.spaceUI.space.getAxisByName('y').getIncrement()/factor
        ) {
            var pos = this.spaceUI.space.applyTransformation(context, true, false);
            if (pos.isNaV()) {
                continue;
            }

            vertices.push(pos.x, pos.y);
        }

        context.y = this.spaceUI.space.getAxisByName('y').max;
        for (context.x = this.spaceUI.space.getAxisByName('x').min;
            context.x <= this.spaceUI.space.getAxisByName('x').max;
            context.x += this.spaceUI.space.getAxisByName('x').getIncrement()/factor
        ) {
            var pos = this.spaceUI.space.applyTransformation(context, true, false);
            if (pos.isNaV()) {
                continue;
            }

            vertices.push(pos.x, pos.y);
        }

        context.x = this.spaceUI.space.getAxisByName('x').max;
        for (context.y = this.spaceUI.space.getAxisByName('y').max;
            context.y >= this.spaceUI.space.getAxisByName('y').min;
            context.y -= this.spaceUI.space.getAxisByName('y').getIncrement()/factor
        ) {
            var pos = this.spaceUI.space.applyTransformation(context, true, false);
            if (pos.isNaV()) {
                continue;
            }

            vertices.push(pos.x, pos.y);
        }

        context.y = this.spaceUI.space.getAxisByName('y').min;
        for (context.x = this.spaceUI.space.getAxisByName('x').max;
            context.x >= this.spaceUI.space.getAxisByName('x').min;
            context.x -= this.spaceUI.space.getAxisByName('x').getIncrement()/factor
        ) {
            var pos = this.spaceUI.space.applyTransformation(context, true, false);
            if (pos.isNaV()) {
                continue;
            }

            vertices.push(pos.x, pos.y);
        }

        if (vertices.length > 2) {
            // console.log('renderBoundaries', vertices);
            this.program.draw(
                undefined,
                new Float32Array(vertices),
                undefined
            );
        }
    }
}
