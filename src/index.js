'use strict';

var FamousEngine = require('famous/core/FamousEngine');
var Color = require('famous/utilities/Color');

var Light = require('./light');
var OuterSphere = require('./outerSphere');
var InnerSphere = require('./innerSphere');
var OuterSpikes = require('./outerSpikes');
var MiddleSphere = require('./middleSphere');

FamousEngine.init();

var scene = FamousEngine.createScene('body');

var audioContext = createAudioContext();
var analyzer = createAnalyzer(audioContext);

var frequencyData = new Float32Array(256);

playMusic(audioContext, analyzer);

var innerSphere = new InnerSphere(scene.addChild(), analyzer, frequencyData);
var triangles = new MiddleSphere(scene.addChild(), analyzer, frequencyData);
var debris = new OuterSphere(scene.addChild(), analyzer, frequencyData);
var spikes = new OuterSpikes(scene.addChild(), analyzer, frequencyData);

addLights(4);

addGUI();

function addLights(numLights) {
    var colors = [];
    for(var i = 0; i < 4; i++) {
        var r = Math.random() * 255;
        var g = Math.random() * 255;
        var b = Math.random() * 255;
        var color = new Color([r, g, b]);
        colors.push(color);
        new Light(scene.addChild(), color);
    }

    setInterval(function() {
        colors.forEach(function(color) {
            var r = Math.random() * 255;
            var g = Math.random() * 255;
            var b = Math.random() * 255;
            color.setRGB(r, g, b, { duration: 2500 });
        });
    }, 5000);
}

function addGUI() {
    var gui = new dat.GUI();

    var sphereFolder = gui.addFolder('Sphere');
    sphereFolder.add(innerSphere, 'size', 10, 100);
    sphereFolder.add(innerSphere, 'opacity', 0, 1);
    sphereFolder.addColor(innerSphere, 'color');

    var trianglesFolder = gui.addFolder('Triangles');
    trianglesFolder.add(triangles, 'size', 10, 150);
    trianglesFolder.add(triangles, 'opacity', 0, 1);
    trianglesFolder.addColor(triangles, 'color');

    var debrisFolder = gui.addFolder('Shards');
    debrisFolder.add(debris, 'size', 10, 150);
    debrisFolder.add(debris, 'opacity', 0 , 1);
    debrisFolder.addColor(debris, 'color');

    var spikesFolder = gui.addFolder('Rays');
    spikesFolder.add(spikes, 'size', 10, 150);
    spikesFolder.add(spikes, 'opacity', 0, 1);
    spikesFolder.addColor(spikes, 'color');

    gui.close();
}

function createAudioContext() {
    return new (window.AudioContext || window.webkitAudioContext);
}

function createAnalyzer(audioContext) {
    return audioContext.createAnalyser();
}

function playMusic(audioContext, analyzer) {
    var buf; //audio buffer
    var req = new XMLHttpRequest();
    req.open("GET","audio/firestone.mp3",true);
    req.responseType = "arraybuffer";
    req.onload = function() {
        //decode the loaded data
        audioContext.decodeAudioData(req.response, function(buffer) {
            buf = buffer;
            connect(analyzer);
        });
    };
    req.send();

    function connect(analyzer) {
        var source = audioContext.createBufferSource();

        source.buffer = buf;
        source.connect(audioContext.destination);
        source.connect(analyzer);
        if (source.noteOn) {
            source.noteOn(0);
        }
        else {
            source.start();
        }
    }
}
