class WebGLProgramLine {
	constructor(ctxt, color) {
		this.ctxt = ctxt;
		this.color = color;

		this.program = this.ctxt.createProgram();
		let e;

		// setup vertex shader
		let vertexShader = this.ctxt.createShader(this.ctxt.VERTEX_SHADER);
		this.ctxt.shaderSource(vertexShader, this.getVertexShaderSource());
		this.ctxt.compileShader(vertexShader);
		e = this.ctxt.getShaderInfoLog(vertexShader);

		if (e.length > 0) {
			throw 'WebGLProgramLine:vertexShader: ' + e;
		}

		this.ctxt.attachShader(this.program, vertexShader);

		// setup fragment shader
		let fragmentShader = this.ctxt.createShader(this.ctxt.FRAGMENT_SHADER);
		this.ctxt.shaderSource(fragmentShader, this.getFragmentShaderSource());
		this.ctxt.compileShader(fragmentShader);
		e = this.ctxt.getShaderInfoLog(fragmentShader);

		if (e.length > 0) {
			throw 'WebGLProgramLine:fragmentShader: ' + e;
		}

		this.ctxt.attachShader(this.program, fragmentShader);

		this.ctxt.linkProgram(this.program);
		this.ctxt.validateProgram(this.program);

		if (!this.ctxt.getProgramParameter(this.program, this.ctxt.LINK_STATUS)) {
			e = this.ctxt.getProgramInfoLog(this.program);
			if (e.length > 0) {
			  throw 'WebGLProgramLine:programLink: ' + e;
			}
		}

		this.ctxt.viewport(0, 0, this.ctxt.canvas.width, this.ctxt.canvas.height);
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
    gl_Position = vec4(a_position.x, a_position.y, 0.0, 1.0);
}
    `;
	}

	// crude traduction from js rgba to vec4
	getFragmentShaderSource() {
		console.log(this.color, color2webgl(this.color));
		return `
precision highp float;

void main () {
    gl_FragColor = `+color2webgl(this.color)+`;
}
    `;
	}

	// vertices must be of the form [x1,y1,x2,y2]
	// to get a first vertex with a_position = vec2(x1,y1);
	// and a second vertex with a_position = vec2(x2,y2);
	draw(vertices, mode) {
		console.log(vertices, mode, this.ctxt.canvas);
		this.ctxt.useProgram(this.program);
		console.log(this.ctxt.getParameter(this.ctxt.VIEWPORT));

		let positionData = this.ctxt.createBuffer(),
            positionLocation = this.ctxt.getAttribLocation(this.program, 'a_position');

		this.ctxt.bindBuffer(this.ctxt.ARRAY_BUFFER, positionData);
        this.ctxt.bufferData(
            this.ctxt.ARRAY_BUFFER,
            vertices,
            this.ctxt.STATIC_DRAW
        );
        this.ctxt.enableVertexAttribArray(positionLocation);
        this.ctxt.vertexAttribPointer(positionLocation, 2, this.ctxt.FLOAT, false, 0, 0);

		this.ctxt.drawArrays(
			undefined !== mode ? mode : this.ctxt.LINE_STRIP, 
			0, 
			Math.ceil(vertices.length / 2)
		);
	}
}