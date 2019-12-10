class Space3dRenderer {
    constructor(spaceUI) {
        this.spaceUI = spaceUI;
        this.ctxt = this.spaceUI.$canvas.get(0).getContext('webgl2');
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
    }

    render(context, animate, animationComponent) {
        this.clear();

        context = $.extend(this.spaceUI.getStartContext(), this.spaceUI.currentContext || {}, context || {});

        let prevContext;

        for (var oid in this.spaceUI.objectsUI) {
            if (this.spaceUI.objectsUI[oid] instanceof FunctionUI) {
                this.spaceUI.objectsUI[oid].render(context);
            }
        }

        for (var component in this.spaceUI.axesUI) {
            if (component == 'time') continue;
            this.spaceUI.axesUI[component].render(this.ctxt, context);
        }
    }
}
