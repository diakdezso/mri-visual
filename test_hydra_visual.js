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
    updateImageChangeInterval(1000);
    
    // Generate a random factor based on the average
    const randomFactor = Math.random() * average; // Random value scaled by average

    src(s0)
        .rotate(() => (average + randomFactor) * 0.01) // Rotate based on average amplitude and random factor
        .modulate(osc(10, 0.1, () => Math.sin(time) * 3).saturate(3).kaleid(200)) // Modulate with effects
        .out();
}

function animateSecond() {
    updateImageChangeInterval(20);
    
    // Generate a random factor based on the average
    const randomFactor = Math.random() * average; // Random value scaled by average

    shape(1, 1)
        .mult(voronoi(1000, 2)
        .blend(s0).luma()) // Use s0 (the image) instead of o0
        .add(shape(3, 0.125)
            .rotate(1 + randomFactor, 1) // Add random factor to rotation
            .mult(voronoi(1000, 1).luma())
            .rotate(1.5))
        .scrollX([0.1 + randomFactor * 0.01, -0.0625, 0.005, 0.00001], 0) // Modify scrollX with random factor
        .scrollY([0.1 + randomFactor * 0.01, -0.0625, 0.005, 0.00001], 0) // Modify scrollY with random factor
        .out();
}

function animateThird() {
    updateImageChangeInterval(100);
    
    // Generate a random factor based on the average
    const randomFactor = Math.random() * average; // Random value scaled by average

    // Load the image into s0
    src(s0)
        .out(s0); // Output the image to s0

    // Create the oscillator effect with transparency on top of the image
    osc(5, 0.9, 0.001) // Create an oscillator
        .kaleid([3, 4, 5, 7, 8, 9, 10].fast(0.1)) // Apply kaleidoscopic effect
        .color(0.5, 0.3) // Set color
        .colorama(0.2) // Apply colorama for tinting
        .rotate(1 + randomFactor * 0.1, () => Math.sin(time) * -0.001) // Add random factor to rotation
        .modulateRotate(s0, () => Math.sin(time) * (average + randomFactor)) // Modulate rotation based on the image and random factor
        .modulate(s0, 0.9) // Modulate the image with the oscillator
        .scale(0.9) // Scale down the effect
        .out(); // Output the final result
}

function animateFourth() {
    updateImageChangeInterval(400);
    // Generate a random factor
    const randomFactor = Math.random(); // Random value between 0 and 1

    // Create the shape effect and apply it to the image from s0
    shape(4, (0.01, () => 0.4 + a.fft[2] + randomFactor), 1) // Add random factor to the shape's second parameter
        .mult(osc(1, 10).modulate(osc(5).rotate(1.4, 1), 3))
        .color(1, 2, 4)
        .saturate(0.2)
        .luma(0.2, 0.10, (5, () => 2 + a.fft[3] + randomFactor)) // Add random factor to luma
        .scale(0.6, () => 0.9 + a.fft[3] + randomFactor * 0.5) // Add random factor to scale
        .diff(src(s0)) // Use the image from s0 for difference blending
        .out(o0); // Output to o0
}

// Animation configuration
const animations = [
    //TODO ORDER TO FIX ON BREAKBEATS WE SHOULD HAVE VIBRATING IMAGES
    { func: animateFirst, duration: 10000 },
    { func: animateSecond, duration: 500 },
    { func: animateThird, duration: 100 },
    { func: animateFirst, duration: 5000 },
    { func: animateSecond, duration: 1000 },
    { func: animateFirst, duration: 6500 },
    { func: animateThird, duration: 100 },
    { func: animateSecond, duration: 1500 },
    { func: animateFirst, duration: 5000 },
    { func: animateSecond, duration: 1000 },
    { func: animateFirst, duration: 5000 },
    { func: animateThird, duration: 500 },
    { func: animateSecond, duration: 3500 },
    { func: animateFirst, duration: 3000 },
    { func: animateSecond, duration: 3500 },
    //ORDER IS NICE FROM HERE ==>
    { func: animateFourth, duration: 10000 },
    { func: animateThird, duration: 5000 },
    { func: animateSecond, duration: 1000 },
    { func: animateThird, duration: 5000 },
    { func: animateFourth, duration: 5000 },
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
