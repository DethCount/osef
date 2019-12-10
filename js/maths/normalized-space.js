class NormalizedSpace extends Space {
    constructor(parent, position, transformation, transformationObject) {
    	let axes = [
    		new Axis('x', new Vector2(1,0), -1, 1, undefined, 'rgba(255,0,0,1)'),
    		new Axis('y', new Vector2(0,-1), -1, 1, undefined, 'rgba(0,255,0,1)')
    	];

    	super(axes, parent, position, transformation, transformationObject);
    }
}