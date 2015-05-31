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

window.analyzer = analyzer;

var frequencyData = new Float32Array(256);

playMusic(audioContext, analyzer);

new OuterSphere(scene.addChild(), analyzer, frequencyData);
new MiddleSphere(scene.addChild(), analyzer, frequencyData);
new InnerSphere(scene.addChild(), analyzer, frequencyData);
new OuterSpikes(scene.addChild(), analyzer, frequencyData);

addLights(4);

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
        } else {
            source.start();
        }
    }
}