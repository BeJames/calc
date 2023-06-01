// Fourier Transform Logic
let myWaveChart = null; // declare the wave chart
let myChart = null; // declare the transform chart
let myPhaseChart = null; // declare the phase chart
let myPowerChart = null; // declare the power chart

function computeFT() {
  event.preventDefault();
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
  // The before computation wave chart
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
          title:  {
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

  document.querySelectorAll('.chart-title')[0].classList.remove('hide');

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

  document.querySelectorAll('.chart-title')[1].classList.remove('hide');

    // Phase spectrum chart
    let phaseChartCtx = document.getElementById('phaseChart').getContext('2d');
    if (myPhaseChart) {
      myPhaseChart.destroy();
    }
    myPhaseChart = new Chart(phaseChartCtx, {
      type: 'line',
      data: {
        labels: transform.map((_, i) => i),
        datasets: [{
          label: 'Phase',
          data: transform.map(t => t.phase),
          fill: false,
          borderColor: 'rgb(192, 75, 75)',
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
              text: 'Phase (radians)'
            }
          }
        }
      }
    });

    document.querySelectorAll('.chart-title')[2].classList.remove('hide');
  
    // Power spectrum chart
    let powerChartCtx = document.getElementById('powerChart').getContext('2d');
    if (myPowerChart) {
      myPowerChart.destroy();
    }
    myPowerChart = new Chart(powerChartCtx, {
      type: 'line',
      data: {
        labels: transform.map((_, i) => i),
        datasets: [{
          label: 'Power',
          data: transform.map(t => t.amp * t.amp),
          fill: false,
          borderColor: 'rgb(75, 75, 192)',
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
              text: 'Power'
            }
          }
        }
      }
    });

    document.querySelectorAll('.chart-title')[3].classList.remove('hide');
    document.querySelectorAll('.chart-title')[4].classList.remove('hide');
    document.querySelectorAll('.chart-title')[5].classList.remove('hide');
    document.querySelectorAll('.chart-title')[6].classList.remove('hide');
    document.querySelectorAll('.chart-title')[7].classList.remove('hide');

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
  document.getElementById('dinosaurImage').src = "img/dinosaur-dark.png";
};

let lightButton = document.getElementById('lightMode'); 
  lightButton.onclick = function () {
  let element = document.body;
  element.classList.remove("dark-mode");
  document.getElementById('dinosaurImage').src = "img/dinosaur.png";
};
  
  let computeButton = document.getElementById('compute');
  computeButton.addEventListener('click', function(event) {
    event.preventDefault(); // Prevent the default form submission behavior
    computeFT(); // Call the computeFT function
});
}