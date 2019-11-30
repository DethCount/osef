class Pulse {
    constructor(fun, integrationAxis) {
        this.fun = fun;
        this.integrationAxis = integrationAxis;

        Object.defineProperty(this, 'particles', {
            'set': (val) => {
                this.fun.particles = val;
            },
            'get': () => {
                return this.fun.particles;
            }
        });

        Object.defineProperty(this, 'particlesCtxt', {
            'set': (val) => {
                this.fun.particlesCtxt = val;
            },
            'get': () => {
                return this.fun.particlesCtxt;
            }
        });

        Object.defineProperty(this, 'name', {
            'set': (val) => {
                this.fun.name = val;
            },
            'get': () => {
                return this.fun.name;
            }
        });

        Object.defineProperty(this, 'color', {
            'set': (val) => {
                this.fun.color = val;
            },
            'get': () => {
                return this.fun.color;
            }
        });
    }

    requires(varName) {
        return this.fun.requires(varName);
    }

    evaluate(args) {
        console.log('evaluate pulse', args);
        var it = Math.floor(args[this.integrationAxis.name]);

        return this.fun.integrate(
            this.integrationAxis,
            this.integrationAxis.partial(0, it),
            args
        );
    }

    outdate() {
        this.fun.outdate();

        return this;
    }
}
