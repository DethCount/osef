class Math3dProgramTriangles extends Math3dProgram {
    constructor(ctxt, color, vertexNormalized, vertexStride, vertexOffset, drawMode, drawOffset, initialised) {
        super(ctxt, 2, 1, vertexNormalized, vertexStride, vertexOffset, drawMode || ctxt.TRIANGLES, drawOffset, initialised);
    }

    initUniforms(uniforms) {
        let colorPosition = this.ctxt.getUniformLocation(
            this.program,
            'u_color'
        );

        this.ctxt.uniform4fv(colorPosition, color2webglvec4(uniforms));
    }

    // crude traduction from js rgba to vec4
    getFragmentShaderSource() {
        // console.log(this.color, color2webgl(this.color));
        return `
precision highp float;

uniform vec4 u_color;

void main () {
    gl_FragColor = u_color;
}
    `;
    }
}
