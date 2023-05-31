// business logic

// Fourier Transform Logic
let myWaveChart = null; // delcare the wave chart
let myChart = null; // declare the transform chart

function computeFT() {
  // Get user inputs
  let waveType = document.getElementById('waveType').value;
  let sampleRate = parseInt(document.getElementById('sampleRate').value);
  let duration = parseInt(document.getElementById('duration').value);
  let frequency1 = parseInt(document.getElementById('frequency1').value);
  let frequency2 = parseInt(document.getElementById('frequency2').value);

  // Generate wave
  let wave = new Array(sampleRate * duration);
  
  // For each sample in our wave array, compute the amplitude by adding two waves of the selected type
  for (let i = 0; i < wave.length; i++) {
    switch (waveType) {
      case 'sin':
        wave[i] = Math.sin(2 * Math.PI * frequency1 * i / sampleRate) + Math.sin(2 * Math.PI * frequency2 * i / sampleRate);
        break;
      case 'square':
        wave[i] = Math.sign(Math.sin(2 * Math.PI * frequency1 * i / sampleRate)) + Math.sign(Math.sin(2 * Math.PI * frequency2 * i / sampleRate));
        break;
      case 'sawtooth':
        wave[i] = 2 * (i / sampleRate * frequency1 - Math.floor(0.5 + i / sampleRate * frequency1)) + 2 * (i / sampleRate * frequency2 - Math.floor(0.5 + i / sampleRate * frequency2));
        break;
    }
  }
  // The before computation wave 
  if (myWaveChart) {
    myWaveChart.destroy();
  }
  
  var waveCtx = document.getElementById('waveChart').getContext('2d');
  myWaveChart = new Chart(waveCtx, {
    type: 'line',
    data: {
      labels: Array.from({length: wave.length}, (_, i) => i),
      datasets: [{
        label: 'Amplitude',
        data: wave,
        fill: false,
        borderColor: 'rgb(75, 192, 192)',
        tension: 0.1
      }]
    },
    options: {
      scales: {
        x: {
          title: {
            display: true,
            text: 'Time'
          }
        },
        y: {
          title: {
            display: true,
            text: 'Amplitude'
          }
        }
      }
    }
  });
  
  // Compute Fourier Transform
  let transform = fourierTransform(wave);

  // Destroy the existing chart if it exists
  if (myChart) {
    myChart.destroy();
  }

  // Create a new chart
  let ctx = document.getElementById('myChart').getContext('2d');
  myChart = new Chart(ctx, {
    type: 'line',
    data: {
      labels: transform.map((_, i) => i),
      datasets: [{
        label: 'Amplitude',
        data: transform.map(t => t.amp),
        fill: false,
        borderColor: 'rgb(75, 192, 192)',
        tension: 0.1
      }]
    },
    options: {
      scales: {
        x: {
          title: {
            display: true,
            text: 'Frequency'
          }
        },
        y: {
          title: {
            display: true,
            text: 'Amplitude'
          }
        }
      }
    }
  });

  // We only look at the first half of the transform because the second half is a mirror image when the input is a real signal
  let half = transform.slice(0, transform.length / 2);

  // Find fundamental frequency
  let maxIndex = 0;

  // We loop through the transformed data to find the index of the maximum amplitude.
  // This index represents the frequency with the most energy, which is the fundamental frequency of our input wave
  for (let i = 0; i < half.length; i++) {
    if (half[i].amp > half[maxIndex].amp) {
      maxIndex = i;
    }
  }

  // The frequency is computed as the index times the sample rate divided by the number of samples, which gives us the frequency in Hz
  let fundamentalFrequency = maxIndex * sampleRate / wave.length;

  // Output result
  document.getElementById('output').innerText = 'Fundamental Frequency: ' + fundamentalFrequency + ' Hz';
}

function fourierTransform(wave) {
  let N = wave.length;
  let transform = [];

  // For each frequency...
  for (let k = 0; k < N; k++) {
    let real = 0;
    let imag = 0;

    // For each point in time...
    for (let n = 0; n < N; n++) {
      // Compute the angle
      let theta = (2 * Math.PI * k * n) / N;
      
      // The real part is the sum of the input wave amplitude times the cosine of the angle
      real += wave[n] * Math.cos(theta);
      
      // The imaginary part is the sum of the input wave amplitude times the sine of the angle
      imag -= wave[n] * Math.sin(theta);
    }

    // The real and imaginary parts are each divided by the number of samples to normalize them
    real /= N;
    imag /= N;

    // The frequency is simply the current index
    let freq = k;
    
    // The amplitude is the square root of the sum of the squares of the real and imaginary parts
    let amp = Math.sqrt(real * real + imag * imag);
    
    // The phase is the arctangent of the imaginary part divided by the real part
    let phase = Math.atan2(imag, real);
    
    // Store the real and imaginary parts, along with the frequency, amplitude, and phase, in the transform array
    transform.push({ re: real, im: imag, freq, amp, phase });
  }
  
  return transform;
}



// user interface logic 
window.onload = function() {
  let awesome = document.getElementById("awesome");
  awesome.onclick = function() {
    alert("I Heart Dinosaurs");
  };

  let darkButton = document.getElementById('darkMode');
  darkButton.onclick = function () {
    let element = document.body;
    element.classList.add("dark-mode");
  };

  let lightButton = document.getElementById('lightMode'); 
  lightButton.onclick = function () {
    let element = document.body;
    element.classList.remove("dark-mode");
  };
  
  let computeButton = document.getElementById('compute');
  computeButton.addEventListener('click', computeFT);
}