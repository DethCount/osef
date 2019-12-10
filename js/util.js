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