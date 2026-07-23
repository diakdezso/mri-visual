// Generate an array of image URLs using a loop
const imageUrls = [];
const baseUrl = "http://localhost:8080/images_mr_0/"; // Base URL for images
const imageCount = 150; // Total number of images

for (let i = 0; i < imageCount; i++) {
    const paddedNumber = String(i).padStart(8, '0'); // Pad the number with leading zeros
    imageUrls.push(`${baseUrl}${paddedNumber}.png`); // Construct the full URL
}

// Load the first image into a source object
s0.initImage(imageUrls[0]);

// Load an audio file
const audio = new Audio("http://localhost:8080/rezz_psycho.mp3");
audio.loop = true; // Loop the audio
audio.play(); // Play the audio automatically
const average = a.fft[0]; // Get the first frequency bin

// Use Hydra's built-in audio analysis
a.setBins(6); // Set the number of frequency bins
a.show(); // Show the audio visualizer

let currentImageIndex = 0; // Index to track the current image
let imageChangeInterval = 800; // Change image every 800 milliseconds
let imageChangeIntervalId = setInterval(changeImage, imageChangeInterval);
// Function to change the image
function changeImage() {
    currentImageIndex = (currentImageIndex + 1) % imageUrls.length; // Cycle through images
    s0.initImage(imageUrls[currentImageIndex]); // Load the new image
}

// Function to update the image change interval
function updateImageChangeInterval(newInterval) {
    let imageChangeInterval = newInterval; // Update the interval
    clearInterval(imageChangeIntervalId); // Clear the existing interval
    imageChangeIntervalId = setInterval(changeImage, imageChangeInterval); // Set a new interval
}


// Define animation functions
function animateFirst() {
    updateImageChangeInterval(1000)
    src(s0)
        .rotate(() => average * 0.01) // Rotate based on average amplitude
        .modulate(osc(10, 0.1, () => Math.sin(time) * 3).saturate(3).kaleid(200)) // Modulate with effects
        .out();
}

function animateSecond() {
    updateImageChangeInterval(10)
    shape(1, 1)
        .mult(voronoi(1000, 2)
        .blend(s0).luma()) // Use s0 (the image) instead of o0
        .add(shape(3, 0.125)
            .rotate(1, 1).mult(voronoi(1000, 1).luma())
            .rotate(1.5))
        .scrollX([0.1, -0.0625, 0.005, 0.00001], 0)
        .scrollY([0.1, -0.0625, 0.005, 0.00001], 0)
        .out();
}

function animateThird() {
    updateImageChangeInterval(1000)
    // Load the image into s0
    src(s0)
        .out(s0); // Output the image to s0

    // Create the oscillator effect with transparency on top of the image
    osc(5, 0.9, 0.001) // Create an oscillator
        .kaleid([3, 4, 5, 7, 8, 9, 10].fast(0.1)) // Apply kaleidoscopic effect
        .color(0.5, 0.3) // Set color
        .colorama(0.2) // Apply colorama for tinting
        .rotate(1, () => Math.sin(time) * -0.001) // Rotate with a sine function
        .modulateRotate(s0, () => Math.sin(time) * average) // Modulate rotation based on the image
        .modulate(s0, 0.9) // Modulate the image with the oscillator
        .scale(0.9) // Scale down the effect
        .out(); // Output the final result
}

// Animation configuration
const animations = [
    { func: animateFirst, duration: 5000 },
    { func: animateSecond, duration: 5000 },
    { func: animateThird, duration: 5000 },
];

// Variable to track the current animation index
let currentAnimationIndex = 0;
let animationStartTime = performance.now();

// Function to switch animations
function switchAnimation() {
    const now = performance.now();
    const elapsed = now - animationStartTime;

    if (elapsed >= animations[currentAnimationIndex].duration) {
        currentAnimationIndex = (currentAnimationIndex + 1) % animations.length; // Cycle through animations
        animationStartTime = now; // Reset the start time
    }
}

// Function to handle the animation transition
function animate() {
    switchAnimation(); // Check if we need to switch animations
    animations[currentAnimationIndex].func(); // Call the current animation function
    requestAnimationFrame(animate); // Loop the animation
}

// Start the animation
animate();

// Start the image change interval
setInterval(changeImage, imageChangeInterval);
