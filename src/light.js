var PointLight = require('famous/webgl-renderables/lights/PointLight');
var Vec3 = require('famous/math/Vec3');

function Light(node, color) {
    this.id = node.addComponent(this);
    this.node = node;

    this.tempo = Math.random() * 10;
    this.radius = 1000;

    var pointLight = new PointLight(this.node)
        .setColor(color);

    this.pos = new Vec3(Math.random() - 0.5, Math.random() - 0.5, Math.random() - 0.5);
    this.r = new Vec3(Math.random() - 0.5, Math.random() - 0.5, Math.random() - 0.5);

    this.node
        .setSizeMode(1, 1, 1)
        .setAbsoluteSize(50, 50, 50)
        .setAlign(0.5, 0.5, 0.5)
        .setOrigin(0.5, 0.5, 0.5)
        .setMountPoint(0.5, 0.5, 0.5)
        .requestUpdate(this.id);
}

Light.prototype.onUpdate = function onUpdate(time) {
    var p = this.pos;

    var dir = Vec3.cross(p, this.r, new Vec3());
    dir.normalize().scale(this.tempo);
    p.add(dir).normalize().scale(this.radius);

    this.node
        .setPosition(p.x, p.y, 1000)
        .requestUpdateOnNextTick(this.id);
}

module.exports = Light;