var Mesh = require('famous/webgl-renderables/Mesh');
var DynamicGeometry = require('famous/webgl-geometries/DynamicGeometry');
var Sphere = require('famous/webgl-geometries/primitives/Sphere');
var Material = require('famous/webgl-materials/Material');
var Color = require('famous/utilities/Color');

function InnerSphere(node, analyzer, frequencyData) {
    this.id = node.addComponent(this);

    this.node = node;
    this.analyzer = analyzer;
    this.frequencyData = frequencyData;

    this.geometry = new DynamicGeometry();
    this.geometry.fromGeometry(new Sphere({ detail: 100 }));

    var shader =
        `vec3 innerSphereVertexPos() {
            return a_normals * vec3((u_innerSphereAmplitude / 20.0) + 5.0);
        }`;

    Material.registerExpression('innerSphereVertex', {
        glsl: 'innerSphereVertexPos();',
        defines: shader,
        output: 3
    });

    this.offset = Material.innerSphereVertex(null, {
        uniforms: { u_innerSphereAmplitude: 1 }
    });


    this.mesh = new Mesh(this.node)
        .setGeometry(this.geometry)
        .setPositionOffset(this.offset)
        .setBaseColor(new Color('#999'))

    this.node
        .setSizeMode(1, 1, 1)
        .setAbsoluteSize(50, 50, 50)
        .setAlign(0.5, 0.5, 0.5)
        .setOrigin(0.5, 0.5, 0.5)
        .setMountPoint(0.5, 0.5, 0.5)
        .requestUpdate(this.id)

}

InnerSphere.prototype.onUpdate = function(time) {
    this.analyzer.getFloatFrequencyData(this.frequencyData);

    var averageFrequency = 0;
    var len = this.frequencyData.length;

    for (var i = 0; i < len; i++) {
        averageFrequency += this.frequencyData[i];
    }

    averageFrequency = averageFrequency / len;

    this.offset.setUniform('u_innerSphereAmplitude', averageFrequency);
    
    var offset = time / 2000;
    this.node
        .setRotation(offset, offset, offset)
        .requestUpdateOnNextTick(this.id);
}

module.exports = InnerSphere;