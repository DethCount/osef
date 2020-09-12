class Math3dProgram {
    constructor(ctxt, vertexDimension, nbVerticesPerItem, vertexNormalized, vertexStride, vertexOffset, drawMode, drawOffset, initialised) {
        this.ctxt = ctxt;
        this.vertexDimension = vertexDimension || 2;
        this.nbVerticesPerItem = nbVerticesPerItem || 1;
        this.vertexNormalized = vertexNormalized === true;
        this.vertexStride = vertexStride || 0;
        this.vertexOffset = vertexOffset || 0;
        this.drawMode = drawMode || this.ctxt.LINE_STRIP;
        this.drawOffset = 0;
        this.initialised = initialised === true;
    }

    createProgram() {
        this.program = this.ctxt.createProgram();
        let e;

        // setup vertex shader
        let vertexShader = this.ctxt.createShader(this.ctxt.VERTEX_SHADER);
        this.ctxt.shaderSource(vertexShader, this.getVertexShaderSource());
        this.ctxt.compileShader(vertexShader);
        e = this.ctxt.getShaderInfoLog(vertexShader);

        if (e.length > 0) {
            throw this.constructor.name + ':vertexShader: ' + e;
        }

        this.ctxt.attachShader(this.program, vertexShader);

        // setup fragment shader
        let fragmentShader = this.ctxt.createShader(this.ctxt.FRAGMENT_SHADER);
        this.ctxt.shaderSource(fragmentShader, this.getFragmentShaderSource());
        this.ctxt.compileShader(fragmentShader);
        e = this.ctxt.getShaderInfoLog(fragmentShader);

        if (e.length > 0) {
            throw this.constructor.name + ':fragmentShader: ' + e;
        }

        this.ctxt.attachShader(this.program, fragmentShader);

        this.ctxt.linkProgram(this.program);
        this.ctxt.validateProgram(this.program);

        if (!this.ctxt.getProgramParameter(this.program, this.ctxt.LINK_STATUS)) {
            e = this.ctxt.getProgramInfoLog(this.program);
            if (e.length > 0) {
                throw this.constructor.name + ':programLink: ' + e;
            }
        }
    }

    init() {
        // console.log('createProgram', this.initialised, this.program);
        if (!this.initialised) {
            this.createProgram();

            // console.log('viewport', 0, 0, this.ctxt.canvas.width, this.ctxt.canvas.height);
            this.ctxt.viewport(0, 0, this.ctxt.canvas.width, this.ctxt.canvas.height);

            this.initialised = true;
        }
    }

    debug() {
        console.log(
            this,
            this.ctxt.getProgramInfoLog(this.program),
            this.ctxt.getProgramParameter(this.program, this.ctxt.DELETE_STATUS),
            this.ctxt.getProgramParameter(this.program, this.ctxt.LINK_STATUS),
            this.ctxt.getProgramParameter(this.program, this.ctxt.VALIDATE_STATUS),
            this.ctxt.getProgramParameter(this.program, this.ctxt.ATTACHED_SHADERS),
            this.ctxt.getProgramParameter(this.program, this.ctxt.ACTIVE_ATTRIBUTES),
            this.ctxt.getProgramParameter(this.program, this.ctxt.ACTIVE_UNIFORMS),
            this.ctxt.getProgramParameter(this.program, this.ctxt.TRANSFORM_FEEDBACK_BUFFER_MODE),
            this.ctxt.getProgramParameter(this.program, this.ctxt.TRANSFORM_FEEDBACK_VARYINGS),
            this.ctxt.getProgramParameter(this.program, this.ctxt.ACTIVE_UNIFORM_BLOCKS)
        );
    }

    getVertexShaderSource() {
        return `
attribute vec2 a_position;

void main () {
    gl_Position = vec4(a_position, 0.0, 1.0);
}
    `;
    }

    getFragmentShaderSource() {
        return `
precision highp float;

void main () {
    gl_FragColor = vec4(1.0, 0.0, 0.0, 1.0);
}
    `;
    }

    initAttributes(attributes) {
        let positionData = this.ctxt.createBuffer(),
            positionLocation = this.ctxt.getAttribLocation(this.program, 'a_position');

        this.ctxt.bindBuffer(this.ctxt.ARRAY_BUFFER, positionData);
        this.ctxt.bufferData(
            this.ctxt.ARRAY_BUFFER,
            attributes, // vertices
            this.ctxt.STATIC_DRAW
        );
        this.ctxt.enableVertexAttribArray(positionLocation);
        this.ctxt.vertexAttribPointer(
            positionLocation,
            this.vertexDimension,
            this.ctxt.FLOAT,
            this.vertexNormalized,
            this.vertexStride,
            this.vertexOffset
        );
    }

    initUniforms(uniforms) {
    }

    initVaryings(varyings) {
    }

    initDraw(uniforms, attributes, varyings, mode) {
        console.log(this, 'drawing', uniforms, attributes, varyings, mode);
        this.ctxt.useProgram(this.program);

        this.initUniforms(uniforms);
        this.initAttributes(attributes);
        this.initVaryings(varyings);

    }

    // vertices must be of the form [x1,y1,x2,y2]
    // to get a first vertex with a_position = vec2(x1,y1);
    // and a second vertex with a_position = vec2(x2,y2);
    draw(uniforms, attributes, varyings, mode) {
        this.init();

        this.initDraw(uniforms, attributes, varyings, mode);

        this.doDraw(uniforms, attributes, varyings, mode);
    }

    doDraw(uniforms, attributes, varyings, mode) {
        this.ctxt.drawArrays(
            undefined !== mode ? mode : this.drawMode,
            this.drawOffset,
            Math.ceil(
                attributes.length /
                (this.vertexDimension * this.nbVerticesPerItem)
            )
        );
    }
}
