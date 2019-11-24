var randomColor = function randomColor(alpha) {
    return 'rgba('
        + Math.round(Math.random() * 255) + ', '
        + Math.round(Math.random() * 255) + ', '
        + Math.round(Math.random() * 255) + ', '
        + (alpha || 1)
        + ')';
};
