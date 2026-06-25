// module aliases
var Engine = Matter.Engine,
    Render = Matter.Render,
    Runner = Matter.Runner,
    Bodies = Matter.Bodies,
    Composite = Matter.Composite,
    Composites = Matter.Composites,
    Mouse = Matter.Mouse,
    World = Matter.World;

var canvas = document.getElementById('matter-canvas');
var playground = document.querySelector('.canvas-container');
var bounds = playground.getBoundingClientRect();
var width = Math.floor(bounds.width);
var height = Math.floor(bounds.height);
var blockColors = ['#C4D6B0', '#477998','#DBB4AD', '#548687', '#B3DEE2'];

function randomBlockColor() {
    return blockColors[Math.floor(Math.random() * blockColors.length)];
}

function blockOptions(options) {
    return Object.assign({
        render: {
            fillStyle: randomBlockColor()
        }
    }, options);
}

// create an engine
var engine = Engine.create();
var world = engine.world;
engine.world.gravity.y = 0.5;
engine.velocityIterations = 6;

// create a renderer
var render = Render.create({
    canvas: canvas,
    engine: engine,
    options: {
        width: width,
        height: height,
        wireframes: false,
        background: 'transparent'
    }
});

// add bodies
var rows = 2;
var cols = 10;
var recStack = Composites.stack(width / 2 - 300, 50, cols, rows, 0, 0, function(x, y) {
    return Bodies.rectangle(x, y, 60, 60, blockOptions());
});
var circleStack = Composites.stack(500, 50, 5, 3, 10, 10, function(x, y) {
    return Bodies.circle(x, y, 24, {
        restitution: 0.85,
        friction: 0.8,
        density: 0.08,
        render: {
            fillStyle: '#AAA1C8'
        }
    });
});

// add blocks
World.add(world, [recStack, circleStack,
    Bodies.rectangle(width / 2, 200, 60, 60, blockOptions({ restitution: 0.9 })),
    Bodies.rectangle(width / 2 + 200, 50, 60, 60, blockOptions({ restitution: 0.9 })),
    Bodies.rectangle(width / 2 - 200, 100, 60, 60, blockOptions({ restitution: 0.9 })),
    Bodies.rectangle(width / 2 - 100, 150, 60, 60, blockOptions({ restitution: 0.9 }))
]);

// add ground
var ground = Bodies.rectangle(width / 2, height, width, 20, {
    isStatic: true,
    render: {
        fillStyle: '#5C6672'
    }
});

// add all of the bodies to the world
Composite.add(engine.world, [ground]);

// add mouse control
var mouse = Mouse.create(render.canvas);
var mouseConstraint = Matter.MouseConstraint.create(engine, {
    mouse: mouse,
    constraint: {
        stiffness: 0.9,
        render: {
            visible: false
        }
    }
});

Composite.add(world, mouseConstraint);

// keep the mouse in sync with rendering
render.mouse = mouse;

// run the renderer
Render.run(render);

// create runner
var runner = Runner.create();

// run the engine
Runner.run(runner, engine);

console.log('Engine:', engine);
console.log('World bodies:', Composite.allBodies(world).length);
