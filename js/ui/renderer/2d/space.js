class Space2dRenderer {
    constructor(spaceUI) {
        this.spaceUI = spaceUI;
        this.ctxt = this.spaceUI.$canvas.get(0).getContext('2d');
    }

    clear(recursive) {
        this.ctxt.clearRect(0, 0, this.ctxt.canvas.width, this.ctxt.canvas.height);

        if (recursive !== false) {
            this.spaceUI.$canvasContainer.children().each((idx, elt) => {
                var canvas = $(elt).get(0);
                var ctxt = canvas.getContext('2d').clearRect(0, 0, canvas.width, canvas.height);
            });
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

    renderBoundaries(context, color) {
        var first = true;

        if (color) {
            this.ctxt.strokeStyle = color;
        }

        var factor = 100;

        this.ctxt.beginPath();
        context.x = this.spaceUI.space.getAxisByName('x').min;
        for (context.y = this.spaceUI.space.getAxisByName('y').min; 
            context.y <= this.spaceUI.space.getAxisByName('y').max; 
            context.y += this.spaceUI.space.getAxisByName('y').getIncrement()/factor
        ) {
            var pos = this.spaceUI.space.applyTransformation(context, true, false);
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
        context.x = this.spaceUI.space.getAxisByName('x').max;
        for (context.y = this.spaceUI.space.getAxisByName('y').min; 
            context.y <= this.spaceUI.space.getAxisByName('y').max; 
            context.y += this.spaceUI.space.getAxisByName('y').getIncrement()/factor
        ) {
            var pos = this.spaceUI.space.applyTransformation(context, true, false);
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
        context.y = this.spaceUI.space.getAxisByName('y').min;
        for (context.x = this.spaceUI.space.getAxisByName('x').min; 
            context.x <= this.spaceUI.space.getAxisByName('x').max; 
            context.x += this.spaceUI.space.getAxisByName('x').getIncrement()/factor
        ) {
            var pos = this.spaceUI.space.applyTransformation(context, true, false);
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
        context.y = this.spaceUI.space.getAxisByName('y').max;
        for (context.x = this.spaceUI.space.getAxisByName('x').min; 
            context.x <= this.spaceUI.space.getAxisByName('x').max; 
            context.x += this.spaceUI.space.getAxisByName('x').getIncrement()/factor
        ) {
            var pos = this.spaceUI.space.applyTransformation(context, true, false);
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
}
