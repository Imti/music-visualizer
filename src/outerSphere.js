'use strict';

var Mesh = require('famous/webgl-renderables/Mesh');
var DynamicGeometry = require('famous/webgl-geometries/DynamicGeometry');
var GeodesicSphere = require('famous/webgl-geometries/primitives/GeodesicSphere');
var Material = require('famous/webgl-materials/Material');
var Color = require('famous/utilities/Color');

function OuterSphere(node, analyzer, frequencyData) {
    this.id = node.addComponent(this);

    // gui settings
    this.opacity = 1.0;
    this.color = '#fff';
    this.size = 75;

    this.node = node;
    this.analyzer = analyzer;
    this.frequencyData = frequencyData;

    this.geometry = new DynamicGeometry();
    this.geometry.fromGeometry(new GeodesicSphere({ detail: 4 }));

    var len = this.geometry.getLength();
    var displacement = [];
    for (var i = 0; i < len; i++) {
        displacement.push(Math.random() / 2);
    }

    this.geometry.setVertexBuffer('a_Displacement', displacement, 1);

    var shader =
        `vec3 outerSphereVertexPos() {
            return a_normals * vec3((a_Displacement + u_outerSphereAmplitude / 5.0) + 22.5);
        }`;

    Material.registerExpression('outerSphereVertex', {
        glsl: 'outerSphereVertexPos();',
        defines: shader,
        output: 3
    });

    this.offset = Material.outerSphereVertex(null, {
        attributes: { a_Displacement: 1 },
        uniforms: { u_outerSphereAmplitude: 1 }
    });

    this.mesh = new Mesh(this.node)
        .setGeometry(this.geometry)
        .setPositionOffset(this.offset)
        .setBaseColor(new Color(this.color))
        .setGlossiness(new Color(this.color));

    this.node
        .setSizeMode(1, 1, 1)
        .setAbsoluteSize(this.size, this.size, this.size)
        .setAlign(0.5, 0.5, 0.5)
        .setOrigin(0.5, 0.5, 0.5)
        .setMountPoint(0.5, 0.5, 0.5)
        .setOpacity(this.opacity)
        .requestUpdate(this.id);
}

OuterSphere.prototype.onUpdate = function onUpdate(time) {
    this.analyzer.getFloatFrequencyData(this.frequencyData);

    var averageFrequency = 0;
    var len = this.frequencyData.length;

    for (var i = 0; i < len; i++) {
        averageFrequency += this.frequencyData[i];
    }

    averageFrequency = averageFrequency / len;

    this.offset.setUniform('u_outerSphereAmplitude', averageFrequency);
    
    var offset = time / 2000;
    this.node
        .setRotation(offset, offset, offset)
        .requestUpdateOnNextTick(this.id);

    // gui update
    this.node
        .setAbsoluteSize(this.size, this.size, this.size)
        .setOpacity(this.opacity);

    this.mesh.setBaseColor(new Color(this.color));
};

module.exports = OuterSphere;
