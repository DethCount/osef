class VectorField {
    constructor(name, components, color, particles, normalize, arrowAngle, arrowHeight, lineWidth) {
        this.name = name;
        this.components = components;
        this.color = color;
        this.particles = particles;
        this.normalize = normalize !== false;
        this.arrowAngle = arrowAngle === undefined ? Math.PI / 8 : arrowAngle;
        this.arrowHeight = arrowHeight === undefined ? 0.25 : arrowHeight;
        this.lineWidth = lineWidth || 1;
    }

    clone() {
        let components, particles;
        if (undefined !== this.components) {
            components = [];
            for (let component of this.components) {
                components.push(component.clone());
            }
        }

        if (undefined !== this.particles) {
            particles = [];
            for (let particle of this.particles) {
                particles.push(particle.clone());
            }
        }

        return new (this.constructor)(
            this.name,
            this.components,
            this.color,
            this.particles,
            this.normalize,
            this.arrowAngle,
            this.arrowHeight,
            this.lineWidth
        );
    }

    outdate() {
        for (var idx in this.components) {
            this.components[idx].outdate();
        }

        return this;
    }

    requires(parameter) {
        let required = false,
            i = 0;

        while(!required && i < this.components.length) {
            required = this.components[i].requires(parameter);
            i++;
        }

        return required;
    }

    evaluate(args) {
        let vector = new Vector2();
        for (var idx in this.components) {
            vector[this.components[idx].name] = this.components[idx].evaluate(args);
        }

        return vector;
    }

    integrate(overAxis, range, args) {
        let sum = new Vector2();

        overAxis.for(
            (current) => {
                args[overAxis.name] = current;
                var val = this.evaluate(args);
                if (!(val instanceof Vector2)) {
                    return;
                }

                sum = sum.add(val);
            },
            range
        );

        return sum;
    }

    isAnimated(checkSpace) {
        for(var component in this.components) {
            if (this.components[component].isAnimated(checkSpace)) {
                return true;
            }
        }

        return false;
    }
}
