class SerieUI extends FunctionUI {
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
        selectors = $.extend(
            {
                equationInput: '.serie-equation'
            },
            selectors || {}
        );

        super(
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
        );
    }
}
