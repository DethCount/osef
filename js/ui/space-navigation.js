class SpaceNavigationUI {
    constructor(
        spaceUI,
        $elt,
        selectors
    ) {
        this.spaceUI = spaceUI;
        this.$elt = $elt;

        this.selectors = $.extend(
            {
                addAxisBtn: '.add-axis-btn',
                addFunctionBtn: '.add-function-btn',
                addSerieBtn: '.add-serie-btn',
                addVectorFieldBtn: '.add-vector-field-btn',
                addMatrixFieldBtn: '.add-matrix-field-btn'
            },
            selectors || {}
        );
    }

    init() {
        this.$elt
            .find(this.selectors.addAxisBtn)
                .click(this.onAddAxisClick.bind(this))
            .end()
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
    }

    onAddAxisClick(event) {
        $('.nav-tabs .nav-link.data-tab').click();

        this.spaceUI.addAxisUI();
    }

    onAddFunctionClick(event) {
        this.spaceUI.addFunctionUI();
    }

    onAddSerieClick(event) {
        this.spaceUI.addSerieUI();
    }

    onAddVectorFieldClick(event) {
        this.spaceUI.addVectorFieldUI();
    }

    onAddMatrixFieldClick(event) {
        this.spaceUI.addMatrixFieldUI();
    }
}
