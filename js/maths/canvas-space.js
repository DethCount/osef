class CanvasSpace extends Space {
    constructor(canvas, axes, parent, position, transformation) {
        super(
            [
                new Axis('x', new Vector2(1, 0), 0, canvas.width, canvas.width),
                new Axis('y', new Vector2(0, 1), 0, canvas.height, canvas.height),
            ],
            parent,
            position,
            transformation
        );

        this.canvas = canvas;
    }

    resize() {
        this.axes[0].max = this.canvas.width;
        this.axes[0].steps = this.canvas.width;

        this.axes[1].max = this.canvas.height;
        this.axes[1].steps = this.canvas.height;
    }
}
