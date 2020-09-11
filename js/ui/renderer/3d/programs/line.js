class Math3dProgramLine extends Math3dProgram {
    constructor(ctxt, color, vertexDimension, vertexNormalized, vertexStride, vertexOffset, drawMode, drawOffset, initialised) {
        super(ctxt, vertexDimension, vertexNormalized, vertexStride, vertexOffset, drawMode, drawOffset, initialised);

        this.color = color;
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

    // crude traduction from js rgba to vec4
    getFragmentShaderSource() {
        console.log(this.color);
        let color = color2webgl(this.color);
        console.log(this.color, color);
        return `
precision highp float;

void main () {
    gl_FragColor = `+color+`;
}
    `;
    }
}