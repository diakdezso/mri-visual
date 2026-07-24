// =====================================================================
//  MRI HYDRA VISUAL — MICROPHONE-REACTIVE, MULTI-FOLDER, CROSSFADED
//  Same spirit as stable_hydra_visual.js, but:
//    * reacts LIVE to the microphone (tuned for drum & bass)
//    * pulls images from ALL images_mr_* folders
//    * 5 animations (3 original + tunnel + glitch)
//    * smooth crossfade transitions between animations
//
//  Hydra's `a` audio module listens to the microphone by default.
//  The browser asks for mic permission on first run — click "Allow".
//  If the a.show() meters (bottom-left) don't move while music plays,
//  the mic isn't being heard (see the mic tips at the bottom).
// =====================================================================


// =====================================================================
//  IMAGES — pull from every images_mr_* folder (served on :8080)
// =====================================================================
// [folderName, number-of-frames] for each folder:
const folders = [
    ["images_mr_0", 216], ["images_mr_1", 87],  ["images_mr_2", 28],
    ["images_mr_3", 27],  ["images_mr_4", 92],  ["images_mr_5", 56],
    ["images_mr_6", 28],  ["images_mr_7", 87],  ["images_mr_8", 25],
    ["images_mr_9", 26],  ["images_mr_10", 28], ["images_mr_11", 37],
    ["images_mr_12", 18], ["images_mr_13", 18], ["images_mr_14", 3],
];

const imageUrls = [];
for (const [folder, count] of folders) {
    for (let i = 0; i < count; i++) {
        const n = String(i).padStart(8, '0');
        imageUrls.push(`http://localhost:8080/${folder}/${n}.png`);
    }
}
// ~776 images total, played in order across all folders.

s0.initImage(imageUrls[0]);


// =====================================================================
//  MICROPHONE SETUP + SENSITIVITY KNOBS
// =====================================================================
// ---- Tune these 4 numbers to taste for your room / track ----
const MIC_SCALE  = 15;   // sensitivity: higher = reacts to quieter sound
const MIC_SMOOTH = 0.6;  // 0..1 : LOWER = snappier/punchier, higher = smoother
const MIC_CUTOFF = 1;    // ignore noise floor below this
const REACT      = 1.6;  // master immersion multiplier for ALL reactions
// -------------------------------------------------------------

a.setBins(6);
a.setScale(MIC_SCALE);
a.setSmooth(MIC_SMOOTH);
a.setCutoff(MIC_CUTOFF);
a.show();   // bin meters (bottom-left). comment out for a clean image.

// LIVE audio readers — called every frame so the visuals track the mic.
// (multiplying by REACT gives you one dial to make everything more intense)
const bass    = () => a.fft[0] * REACT;   // kick / sub
const lowMid  = () => a.fft[1] * REACT;   // bassline body
const mid     = () => a.fft[2] * REACT;   // synths / vocals
const highMid = () => a.fft[3] * REACT;   // snares
const high    = () => a.fft[4] * REACT;   // hats
const air     = () => a.fft[5] * REACT;   // cymbals / air
const energy  = () => (a.fft[0] + a.fft[1] + a.fft[2] + a.fft[3]) / 4 * REACT;


// =====================================================================
//  IMAGE SWAPPING — steady swap + extra snap on detected kicks
// =====================================================================
let currentImageIndex = 0;
let imageChangeInterval = 700;
let imageChangeIntervalId = setInterval(changeImage, imageChangeInterval);

function changeImage() {
    currentImageIndex = (currentImageIndex + 1) % imageUrls.length;
    s0.initImage(imageUrls[currentImageIndex]);
}

function updateImageChangeInterval(newInterval) {
    imageChangeInterval = newInterval;
    clearInterval(imageChangeIntervalId);
    imageChangeIntervalId = setInterval(changeImage, imageChangeInterval);
}

// Beat detector on the bass: jump the image forward on kicks.
let bassBaseline = 0;
setInterval(() => {
    const b = bass();
    bassBaseline = bassBaseline * 0.9 + b * 0.1;
    if (b > bassBaseline * 1.4 + 0.15) {
        currentImageIndex = (currentImageIndex + 2) % imageUrls.length;
        s0.initImage(imageUrls[currentImageIndex]);
    }
}, 60);


// =====================================================================
//  ANIMATIONS — each renders into the buffer it is given (`buf`)
//  so the manager can crossfade between two of them.
// =====================================================================

// 1) Rotating / kaleidoscopic image — bass spins & pumps, highs open kaleid
function animateFirst(buf = o0) {
    src(s0)
        .rotate(() => bass() * 2)
        .modulate(
            osc(10, 0.1, () => 0.5 + high() * 5)
                .saturate(3)
                .kaleid(() => 100 + mid() * 500)
        )
        .scale(() => 1 + bass() * 0.6)
        .out(buf);
}

// 2) Voronoi shard field — density & breathing follow highs + bass
function animateSecond(buf = o0) {
    shape(1, 1)
        .mult(voronoi(() => 400 + high() * 2500, 2)
            .blend(s0).luma())
        .add(shape(3, 0.125)
            .rotate(() => 1 + mid() * 2.5, 1)
            .mult(voronoi(1000, 1).luma())
            .rotate(1.5))
        .scrollX([0.1, -0.0625, 0.005, 0.00001], 0)
        .scrollY([0.1, -0.0625, 0.005, 0.00001], 0)
        .modulateScale(osc(2), () => bass() * 0.8)
        .out(buf);
}

// 3) Oscillator + kaleidoscope over the image — colour & warp react
function animateThird(buf = o0) {
    src(s0).out(s0); // feed the image into itself
    osc(5, 0.9, 0.001)
        .kaleid([3, 4, 5, 7, 8, 9, 10].fast(0.1))
        .color(0.5, 0.3)
        .colorama(() => 0.2 + high() * 0.7)
        .rotate(1, () => Math.sin(time) * -0.001)
        .modulateRotate(s0, () => Math.sin(time) * bass() * 6)
        .modulate(s0, 0.9)
        .scale(() => 0.9 + energy() * 0.6)
        .out(buf);
}

// 4) NEW — INFINITE FEEDBACK TUNNEL
//    The previous frame is zoomed & rotated into itself (bass = zoom speed),
//    with the MRI image keyed on top. Very immersive / hypnotic on drops.
function animateFourth(buf = o0) {
    src(buf)                                          // previous frame = feedback
        .scale(() => 1.015 + bass() * 0.12)           // bass drives the zoom-in
        .rotate(() => 0.01 + mid() * 0.06)            // mids twist the tunnel
        .colorama(() => 0.02 + high() * 0.35)         // hats shift the colours
        .layer(
            src(s0)                                    // new image on top
                .luma(() => 0.28 + lowMid() * 0.35, 0.1)
                .colorama(0.1)
        )
        .out(buf);
}

// 5) NEW — GLITCH / RGB-SPLIT / PIXEL SMASH
//    Hats chop it into pixels, kicks shove the RGB channels apart.
function animateFifth(buf = o0) {
    src(s0)
        .modulateScale(osc(4, 0.1), () => bass() * 0.5)
        .pixelate(
            () => Math.max(20, 220 - high() * 200),    // hats -> chunkier pixels
            () => Math.max(20, 220 - high() * 200)
        )
        .shift(() => 0.05 + bass() * 0.25, 0, () => high() * 0.4)  // RGB split on hits
        .colorama(() => mid() * 0.4)
        .kaleid(() => 2 + Math.floor(mid() * 4))
        .contrast(1.4)
        .out(buf);
}


// =====================================================================
//  SEQUENCE + SMOOTH CROSSFADE MANAGER
// =====================================================================
const animations = [
    { func: animateFirst,  duration: 8000, interval: 700 },
    { func: animateSecond, duration: 6000, interval: 40  },
    { func: animateFourth, duration: 9000, interval: 500 },
    { func: animateThird,  duration: 7000, interval: 120 },
    { func: animateFifth,  duration: 8000, interval: 300 },
];

const TRANSITION_MS = 1600; // length of the crossfade between animations

let currentIndex = 0;
let nextIndex = null;                 // null = not transitioning
let animationStartTime = performance.now();
let transitionStart = 0;

updateImageChangeInterval(animations[currentIndex].interval);

function animate() {
    const now = performance.now();

    if (nextIndex === null) {
        // --- steady state: render current animation, add a bass flash ---
        animations[currentIndex].func(o1);
        src(o1)
            .brightness(() => bass() * 0.15)   // whole frame flashes on kicks
            .out(o0);

        if (now - animationStartTime >= animations[currentIndex].duration) {
            nextIndex = (currentIndex + 1) % animations.length;
            transitionStart = now;
            // start swapping images at the NEXT animation's rate right away
            updateImageChangeInterval(animations[nextIndex].interval);
        }
    } else {
        // --- transitioning: render both, crossfade with easing ---
        let t = (now - transitionStart) / TRANSITION_MS;
        if (t >= 1) {
            currentIndex = nextIndex;
            nextIndex = null;
            animationStartTime = now;
            animations[currentIndex].func(o1);
            src(o1).brightness(() => bass() * 0.15).out(o0);
        } else {
            const ease = t * t * (3 - 2 * t); // smoothstep
            animations[currentIndex].func(o1);
            animations[nextIndex].func(o2);
            src(o1)
                .blend(o2, ease)
                .brightness(() => bass() * 0.12)
                .out(o0);
        }
    }

    requestAnimationFrame(animate);
}

animate();


// =====================================================================
//  MIC NOT REACTING? quick checklist:
//    1. The a.show() meters (bottom-left) should DANCE while music plays.
//       Flat meters = the mic isn't being heard.
//    2. Chrome: click the padlock/🎤 in the address bar for localhost and
//       set Microphone = Allow, then re-run the code (Ctrl+Shift+Enter).
//    3. Make sure the right input device is selected in Windows sound
//       settings, and the song is loud enough to reach the mic.
//    4. Turn UP `MIC_SCALE` and `REACT` at the top for more sensitivity;
//       turn DOWN `MIC_SMOOTH` (e.g. 0.4) for snappier, punchier hits.
// =====================================================================
