var randomColor = function randomColor(alpha) {
    return 'rgba('
        + Math.round(Math.random() * 255) + ', '
        + Math.round(Math.random() * 255) + ', '
        + Math.round(Math.random() * 255) + ', '
        + (alpha || 1)
        + ')';
};

var color2webgl = function color2webgl(color) {
	return color
		.replace(/^rgba\((\d+),\s(\d+),\s(\d+),\s(\d+)\)$/, 'vec4($1\.0\/255\.0, $2\.0\/255\.0, $3\.0\/255\.0, $4\.0\)');
}

var color2webglvec4 = function color2webglvec4(color) {
    let res = /^rgba\((\d+),\s(\d+),\s(\d+),\s(\d+)\)$/.exec(color);
    return [
        1*res[1]/255,
        1*res[2]/255,
        1*res[3]/255,
        1*res[4]
    ]
}
