class AxisUI {
    constructor(space, name, $elt, color, selectors, precision, stepsPrecision, lineWidth, markerLength, axisPadding, otherAxisPadding, fontSize, fontFamily) {
        this.space = space;
        this.name = name;
        this.$elt = $elt;
        this.color = color || 'black';
        this.selectors = $.extend(
            {},
            {
                updateBtn: '.update-btn',
                minInput: '.axis-min-input',
                maxInput: '.axis-max-input',
                stepsInput: '.axis-steps-input',
                range: '.range',
                playBtn: '.play-btn',
                stopBtn: '.stop-btn',
                prevBtn: '.prev-btn',
                nextBtn: '.next-btn',
                lastBtn: '.last-btn'
            },
            selectors || {}
        );

        this.precision = precision === undefined ? 6 : 1*precision;
        this.stepsPrecision = stepsPrecision === undefined ? 10 : 1*stepsPrecision;
        this.lineWidth = lineWidth === undefined ? 1 : 1*lineWidth;
        this.axisPadding = axisPadding || 0;
        this.otherAxisPadding = otherAxisPadding === undefined ? 10 : 1*otherAxisPadding;
        this.fontSize = fontSize === undefined ? 12 : 1*fontSize;
        this.fontFamily = fontFamily || 'Arial';

        Object.defineProperty(this, 'minValue', {
            get: () => {
                return 1*this.$elt.find(this.selectors.minInput).val();
            },
            set: (val) => {
                this.$elt.find(this.selectors.minInput).val(1*val);
            }
        });

        Object.defineProperty(this, 'maxValue', {
            get: () => {
                return 1*this.$elt.find(this.selectors.maxInput).val();
            },
            set: (val) => {
                this.$elt.find(this.selectors.maxInput).val(1*val);
            }
        });

        Object.defineProperty(this, 'stepsValue', {
            get: () => {
                return 1*this.$elt.find(this.selectors.stepsInput).val();
            },
            set: (val) => {
                this.$elt.find(this.selectors.stepsInput).val(1*val);
            }
        });

        Object.defineProperty(this, 'axis', {
            get: () => {
                return this.space.getAxisByName(this.name);
            }
        });

        this.markerLength = markerLength || (this.axis.max - this.axis.min) / (this.stepsPrecision*this.axis.steps);

        this.init();
    }


    init() {
        this.minValue = this.axis.min;
        this.maxValue = this.axis.max;
        this.stepsValue = this.axis.steps;

        if (this.name == 'x' || this.name == 'y') {
            this.$elt.find(this.selectors.range).remove();
        } else {
            this.$elt.find(this.selectors.range)
                .on('click', this.selectors.playBtn, this.onPlayBtnClick.bind(this))
                .on('click', this.selectors.stopBtn, this.onStopBtnClick.bind(this))
                .on('click', this.selectors.prevBtn, this.onPrevBtnClick.bind(this))
                .on('click', this.selectors.nextBtn, this.onNextBtnClick.bind(this))
                .on('click', this.selectors.lastBtn, this.onLastBtnClick.bind(this));
        }

        this.$elt.find(this.selectors.updateBtn)
            .click(this.onUpdateBtnClick.bind(this));
    }

    onUpdateBtnClick(event) {
        this.space.getAxisByName(this.name).min = this.minValue;
        this.space.getAxisByName(this.name).max = this.maxValue;
        this.space.getAxisByName(this.name).steps = this.stepsValue;

        this.$elt.trigger('update');
    }

    onPlayBtnClick(event) {
        this.$elt.trigger('play');
    }

    onStopBtnClick(event) {
        this.$elt.trigger('stop');
    }

    onPrevBtnClick(event) {
        this.$elt.trigger('prev');
    }

    onNextBtnClick(event) {
        this.$elt.trigger('next');
    }

    onLastBtnClick(event) {
        this.$elt.trigger('last');
    }

    on(eventName, callback) {
        this.$elt.on(eventName, callback);

        return this;
    }

    render(ctxt, context) {
        let x = Math.abs(this.axis.basis.x),
            y = Math.abs(this.axis.basis.y);

        ctxt.font = this.fontSize + 'px ' + this.fontFamily;
        ctxt.strokeStyle = this.color;
        ctxt.lineWidth = this.lineWidth;

        let previousPos, textWidth;

        this.axis.each((i) => {
            if (i == 0) {
                return;
            }

            let vector = this.space.applyTransformation(
                this.space.mergeContextAndVector(
                    context,
                    new Vector2(i * x, i * y)
                )
            );

            if (previousPos) {
                ctxt.beginPath();
                ctxt.moveTo(previousPos.x, previousPos.y);
                ctxt.lineTo(vector.x, vector.y);
                ctxt.stroke();
            }
            //console.log(this.axis.name, previousPos, vector);

            ctxt.beginPath();
            ctxt.moveTo(vector.x, vector.y);
            let vector2 = this.space.applyTransformation(
                this.space.mergeContextAndVector(
                    context,
                    new Vector2(i * x + this.markerLength * y, i * y + this.markerLength * x)
                )
            );

            ctxt.lineTo(vector2.x, vector2.y);
            ctxt.stroke();

            let prec = Math.pow(10, this.precision);
            ctxt.fillText(
                Math.round(i*prec)/prec,
                vector.x
                    - x * this.axisPadding
                    - this.otherAxisPadding * y
                    - Math.round(ctxt.measureText(i == 1).width / 2),
                vector.y
                    + y * this.axisPadding
                    + this.otherAxisPadding * x
                    + Math.round(this.fontSize / 2)
            );

            previousPos = vector.clone();
        });
    }
}
