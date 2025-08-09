// DOM elements
const generateSection = document.getElementById('generateSection');
const generateBtn = document.getElementById('generateBtn');
const rakhiContainer = document.getElementById('rakhiContainer');
const rakhi = document.getElementById('rakhi');
const swipeInstruction = document.getElementById('swipeInstruction');
const handArea = document.getElementById('handArea');
const hand = document.getElementById('hand');
const rakhiOnHandContainer = document.getElementById('rakhiOnHandContainer');
const successMessage = document.getElementById('successMessage');
const resetBtn = document.getElementById('resetBtn');

// State management
let currentState = 'initial'; // initial, rakhi-generated, swiping, completed
let touchStartY = 0;
let touchEndY = 0;
let isSwipeActive = false;

// Sound effects (using Web Audio API for compatibility)
const audioContext = new (window.AudioContext || window.webkitAudioContext)();

function createTone(frequency, duration, type = 'sine') {
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.frequency.value = frequency;
    oscillator.type = type;
    
    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + duration);
    
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + duration);
}

function playGenerateSound() {
    // Spider-Man web sound effect
    createTone(800, 0.1, 'sawtooth');
    setTimeout(() => createTone(600, 0.1, 'sawtooth'), 100);
    setTimeout(() => createTone(400, 0.2, 'sawtooth'), 200);
}

function playSwipeSound() {
    // Swoosh sound
    createTone(300, 0.3, 'sine');
}

function playSuccessSound() {
    // Success jingle
    const notes = [523, 659, 784, 1047]; // C, E, G, C
    notes.forEach((note, index) => {
        setTimeout(() => createTone(note, 0.2, 'sine'), index * 150);
    });
}

// Initialize the application
function init() {
    setupEventListeners();
    resetToInitialState();
    
    // Enable audio context on first user interaction
    document.addEventListener('click', enableAudio, { once: true });
    document.addEventListener('touchstart', enableAudio, { once: true });
}

function enableAudio() {
    if (audioContext.state === 'suspended') {
        audioContext.resume();
    }
}

function setupEventListeners() {
    // Generate button click
    generateBtn.addEventListener('click', handleGenerateClick);
    
    // Reset button click
    resetBtn.addEventListener('click', handleResetClick);
    
    // Touch events for swipe detection
    document.addEventListener('touchstart', handleTouchStart, { passive: false });
    document.addEventListener('touchmove', handleTouchMove, { passive: false });
    document.addEventListener('touchend', handleTouchEnd, { passive: false });
    
    // Mouse events for desktop swipe simulation
    document.addEventListener('mousedown', handleMouseDown);
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    
    // Keyboard support
    document.addEventListener('keydown', handleKeyDown);
}

function handleGenerateClick() {
    if (currentState !== 'initial') return;
    
    playGenerateSound();
    generateRakhi();
}

function handleResetClick() {
    resetToInitialState();
}

function generateRakhi() {
    currentState = 'rakhi-generated';
    
    // Hide generate section with animation
    generateSection.style.animation = 'fadeOut 0.5s ease-out forwards';
    
    setTimeout(() => {
        generateSection.style.display = 'none';
        
        // Show rakhi container
        rakhiContainer.style.display = 'flex';
        
        // Show hand area
        handArea.style.display = 'block';
        
        // Enable swipe functionality
        isSwipeActive = true;
        
        // Add celebration particles
        createCelebrationParticles();
        
    }, 500);
}

function createCelebrationParticles() {
    const colors = ['#ffd700', '#ff6b6b', '#4ecdc4', '#45b7d1'];
    
    for (let i = 0; i < 20; i++) {
        setTimeout(() => {
            const particle = document.createElement('div');
            particle.style.position = 'fixed';
            particle.style.width = '6px';
            particle.style.height = '6px';
            particle.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
            particle.style.borderRadius = '50%';
            particle.style.pointerEvents = 'none';
            particle.style.zIndex = '1000';
            
            const startX = Math.random() * window.innerWidth;
            const startY = window.innerHeight;
            
            particle.style.left = startX + 'px';
            particle.style.top = startY + 'px';
            
            document.body.appendChild(particle);
            
            // Animate particle
            particle.animate([
                { transform: 'translateY(0) rotate(0deg)', opacity: 1 },
                { transform: `translateY(-${window.innerHeight}px) rotate(360deg)`, opacity: 0 }
            ], {
                duration: 3000,
                easing: 'ease-out'
            }).onfinish = () => {
                document.body.removeChild(particle);
            };
        }, i * 100);
    }
}

// Touch event handlers
function handleTouchStart(e) {
    if (!isSwipeActive) return;
    
    touchStartY = e.touches[0].clientY;
    e.preventDefault();
}

function handleTouchMove(e) {
    if (!isSwipeActive) return;
    
    touchEndY = e.touches[0].clientY;
    
    // Provide visual feedback during swipe
    const swipeDistance = touchEndY - touchStartY;
    if (swipeDistance > 0) {
        const progress = Math.min(swipeDistance / 100, 1);
        rakhi.style.transform = `translateY(${swipeDistance * 0.5}px) scale(${1 - progress * 0.2})`;
    }
    
    e.preventDefault();
}

function handleTouchEnd(e) {
    if (!isSwipeActive) return;
    
    const swipeDistance = touchEndY - touchStartY;
    const minSwipeDistance = 50;
    
    if (swipeDistance > minSwipeDistance) {
        handleSwipeDown();
    } else {
        // Reset rakhi position if swipe wasn't sufficient
        rakhi.style.transform = '';
        rakhi.style.transition = 'transform 0.3s ease';
        setTimeout(() => {
            rakhi.style.transition = '';
        }, 300);
    }
    
    touchStartY = 0;
    touchEndY = 0;
    e.preventDefault();
}

// Mouse event handlers for desktop
let isMouseDown = false;
let mouseStartY = 0;

function handleMouseDown(e) {
    if (!isSwipeActive) return;
    
    isMouseDown = true;
    mouseStartY = e.clientY;
}

function handleMouseMove(e) {
    if (!isSwipeActive || !isMouseDown) return;
    
    const swipeDistance = e.clientY - mouseStartY;
    if (swipeDistance > 0) {
        const progress = Math.min(swipeDistance / 100, 1);
        rakhi.style.transform = `translateY(${swipeDistance * 0.5}px) scale(${1 - progress * 0.2})`;
    }
}

function handleMouseUp(e) {
    if (!isSwipeActive || !isMouseDown) return;
    
    const swipeDistance = e.clientY - mouseStartY;
    const minSwipeDistance = 50;
    
    if (swipeDistance > minSwipeDistance) {
        handleSwipeDown();
    } else {
        // Reset rakhi position
        rakhi.style.transform = '';
        rakhi.style.transition = 'transform 0.3s ease';
        setTimeout(() => {
            rakhi.style.transition = '';
        }, 300);
    }
    
    isMouseDown = false;
    mouseStartY = 0;
}

// Keyboard support
function handleKeyDown(e) {
    if (!isSwipeActive) return;
    
    if (e.key === 'ArrowDown' || e.key === ' ') {
        e.preventDefault();
        handleSwipeDown();
    }
}

function handleSwipeDown() {
    if (currentState !== 'rakhi-generated') return;
    
    currentState = 'swiping';
    isSwipeActive = false;
    
    playSwipeSound();
    
    // Hide swipe instruction
    swipeInstruction.style.animation = 'fadeOut 0.3s ease-out forwards';
    
    // Animate rakhi moving to hand
    rakhi.classList.add('moving');
    hand.classList.add('receiving');
    
    // After animation completes, show rakhi on hand (Step 3)
    setTimeout(() => {
        rakhiContainer.style.display = 'none';
        handArea.style.display = 'none';
        showRakhiOnHand();
    }, 2000);
}

function showRakhiOnHand() {
    currentState = 'showing-rakhi-on-hand';
    
    playSuccessSound();
    rakhiOnHandContainer.style.display = 'flex';
    
    // Create celebration effects
    createFireworks();
    
    // After showing rakhi on hand, show final success message
    setTimeout(() => {
        showSuccessMessage();
    }, 3000);
}

function showSuccessMessage() {
    currentState = 'completed';
    
    // Hide rakhi on hand and show success message
    rakhiOnHandContainer.style.display = 'none';
    successMessage.style.display = 'block';
    
    // Create more celebration effects
    createFireworks();
}

function createFireworks() {
    const colors = ['#ffd700', '#ff6b6b', '#4ecdc4', '#45b7d1', '#f9ca24'];
    
    for (let i = 0; i < 5; i++) {
        setTimeout(() => {
            const centerX = Math.random() * window.innerWidth;
            const centerY = Math.random() * (window.innerHeight * 0.5) + 100;
            
            for (let j = 0; j < 12; j++) {
                const particle = document.createElement('div');
                particle.style.position = 'fixed';
                particle.style.width = '4px';
                particle.style.height = '4px';
                particle.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
                particle.style.borderRadius = '50%';
                particle.style.pointerEvents = 'none';
                particle.style.zIndex = '1000';
                particle.style.left = centerX + 'px';
                particle.style.top = centerY + 'px';
                
                document.body.appendChild(particle);
                
                const angle = (j / 12) * 2 * Math.PI;
                const distance = 100 + Math.random() * 50;
                const endX = centerX + Math.cos(angle) * distance;
                const endY = centerY + Math.sin(angle) * distance;
                
                particle.animate([
                    { transform: 'translate(0, 0) scale(1)', opacity: 1 },
                    { transform: `translate(${endX - centerX}px, ${endY - centerY}px) scale(0)`, opacity: 0 }
                ], {
                    duration: 1000 + Math.random() * 500,
                    easing: 'ease-out'
                }).onfinish = () => {
                    if (document.body.contains(particle)) {
                        document.body.removeChild(particle);
                    }
                };
            }
        }, i * 200);
    }
}

function resetToInitialState() {
    currentState = 'initial';
    isSwipeActive = false;
    
    // Reset all elements
    generateSection.style.display = 'flex';
    generateSection.style.animation = '';
    
    rakhiContainer.style.display = 'none';
    handArea.style.display = 'none';
    rakhiOnHandContainer.style.display = 'none';
    successMessage.style.display = 'none';
    
    // Reset classes and styles
    rakhi.classList.remove('moving');
    hand.classList.remove('receiving');
    rakhi.style.transform = '';
    rakhi.style.transition = '';
    
    swipeInstruction.style.animation = '';
}

// Add CSS for fadeOut animation
const style = document.createElement('style');
style.textContent = `
    @keyframes fadeOut {
        from { opacity: 1; transform: scale(1); }
        to { opacity: 0; transform: scale(0.8); }
    }
`;
document.head.appendChild(style);

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', init);

// Handle visibility change (when user switches tabs)
document.addEventListener('visibilitychange', () => {
    if (document.hidden && audioContext.state === 'running') {
        audioContext.suspend();
    } else if (!document.hidden && audioContext.state === 'suspended') {
        audioContext.resume();
    }
});

// Add some extra sparkle effects on mouse move
document.addEventListener('mousemove', (e) => {
    if (Math.random() > 0.98) { // Randomly create sparkles
        const sparkle = document.createElement('div');
        sparkle.style.position = 'fixed';
        sparkle.style.left = e.clientX + 'px';
        sparkle.style.top = e.clientY + 'px';
        sparkle.style.width = '3px';
        sparkle.style.height = '3px';
        sparkle.style.backgroundColor = '#ffd700';
        sparkle.style.borderRadius = '50%';
        sparkle.style.pointerEvents = 'none';
        sparkle.style.zIndex = '999';
        
        document.body.appendChild(sparkle);
        
        sparkle.animate([
            { opacity: 1, transform: 'scale(1)' },
            { opacity: 0, transform: 'scale(2)' }
        ], {
            duration: 800,
            easing: 'ease-out'
        }).onfinish = () => {
            if (document.body.contains(sparkle)) {
                document.body.removeChild(sparkle);
            }
        };
    }
});
