var WIDTH = 640;
var HEIGHT = 360;

// Interesting parameters to tweak!
var SMOOTHING = 0.8;
var FFT_SIZE = 512;

function AudioVisualizer(context){
	this.context = context;
	this.analyser = context.createAnalyser();
 	this.analyser.connect(context.destination);
 	this.analyser.minDecibels = -140;
	this.analyser.maxDecibels = 0;
	this.freqs = new Uint8Array(this.analyser.frequencyBinCount);
	this.times = new Uint8Array(this.analyser.frequencyBinCount);

	this.isPlaying = false;
	this.startTime = 0;
	this.startOffset = 0;
}

AudioVisualizer.prototype.Play = function(){

	if(this.isPlaying)
	{
		this.source[this.source.stop ? 'stop': 'noteOff'](0);
    	this.startOffset += this.context.currentTime - this.startTime;
    	this.isPlaying = false;
	}
	else{
		this.startTime = this.context.currentTime;
		this.source = this.context.createBufferSource();
		this.source.connect(this.analyser);
		//var buffer = this.context.createBuffer(2, 1024, this.context.sampleRate);
	    this.source.buffer = this.context.buffer;
	    this.source.loop = true;
	    this.source[this.source.start ? 'start' : 'noteOn'](0, this.startTime % this.context.buffer.duration);
	    this.isPlaying = true;

	    requestAnimFrame(this.draw.bind(this));
	}

    //requestAnimFrame(this.draw.bind(this));
}

AudioVisualizer.prototype.draw = function() {
  this.analyser.smoothingTimeConstant = SMOOTHING;
  this.analyser.fftSize = FFT_SIZE;
  // Get the frequency data from the currently playing music
  this.analyser.getByteFrequencyData(this.freqs);
  this.analyser.getByteTimeDomainData(this.times);

  var width = Math.floor(1/this.freqs.length, 10);

  /*var canvas = document.querySelector('canvas');
  var drawContext = canvas.getContext('2d');
  canvas.width = WIDTH;
  canvas.height = HEIGHT;*/
  // Draw the frequency domain chart.
  for (var i = 0; i < this.analyser.frequencyBinCount; i++) {
    var value = this.freqs[i];
    var percent = value / 256;
    var height = HEIGHT * percent;
    var offset = HEIGHT - height - 1;
    var barWidth = WIDTH/this.analyser.frequencyBinCount;
    var hue = i/this.analyser.frequencyBinCount * 360;

    addBin(i,value);
    //drawContext.fillStyle = 'hsl(' + hue + ', 100%, 50%)';
    //drawContext.fillRect(i * barWidth, offset, barWidth, height);
  }

  // Draw the time domain chart.
  for (var i = 0; i < this.analyser.frequencyBinCount; i++) {
/*    var value = this.times[i];
    var percent = value / 256;
    var height = HEIGHT * percent;
    var offset = HEIGHT - height - 1;
    var barWidth = WIDTH/this.analyser.frequencyBinCount;
    drawContext.fillStyle = 'white';
    drawContext.fillRect(i * barWidth, offset, 1, 2);*/
  }

  if (this.isPlaying) {
    requestAnimFrame(this.draw.bind(this));
  }
}

AudioVisualizer.prototype.getFrequencyValue = function(freq) {
  var nyquist = context.sampleRate/2;
  var index = Math.round(freq/nyquist * this.freqs.length);
  return this.freqs[index];
}
