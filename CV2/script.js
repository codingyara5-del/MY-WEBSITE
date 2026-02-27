/**
 * INTERACTIVE SCIENCE EXPERIMENT GAME
 * Baking Soda & Vinegar Acid-Base Reaction
 * 
 * This file handles all interactivity, physics simulations, animations,
 * sound effects, and educational content delivery.
 */

// ========== STATE MANAGEMENT ==========
const experimentState = {
    // Step tracking
    bakingSodaAdded: false,
    coloringAdded: false,
    vinegarAdded: false,
    reactionActive: false,
    
    // Color tracking
    selectedColor: null,
    colorMixture: null,
    
    // Progress
    currentStep: 0,
    totalSteps: 3,
    
    // Audio
    soundEnabled: true,
    
    // Educational content
    guided: true
};

// ========== INITIALIZATION ==========
document.addEventListener('DOMContentLoaded', function() {
    console.log('Science Experiment Game Initialized');
    initializeEventListeners();
    setupGuideCharacter();
    updateProgressUI();
});

// ========== EVENT LISTENERS ==========
function initializeEventListeners() {
    // Action buttons
    document.getElementById('add-baking-soda-btn').addEventListener('click', addBakingSoda);
    document.getElementById('add-coloring-btn').addEventListener('click', addFoodColoring);
    document.getElementById('add-vinegar-btn').addEventListener('click', addVinegar);
    document.getElementById('reset-btn').addEventListener('click', resetExperiment);
    
    // Audio toggle
    document.getElementById('audio-toggle').addEventListener('click', toggleAudio);
    
    // Close info panel
    document.getElementById('close-info-btn').addEventListener('click', closeInfoPanel);
    
    // Prevent context menu on right-click
    document.addEventListener('contextmenu', (e) => e.preventDefault());
}

// ========== INTERACTION HANDLERS ==========

/**
 * Add Baking Soda (NaHCO₃) - Step 1
 */
function addBakingSoda() {
    if (experimentState.bakingSodaAdded) {
        showStatusMessage('Baking soda already added!', 'info');
        return;
    }

    // Validation: Can't add vinegar first
    if (experimentState.vinegarAdded && !experimentState.bakingSodaAdded) {
        showStatusMessage('❌ Try again! Add baking soda first.', 'error');
        guideCharacterSpeak('Oops! You need to add baking soda BEFORE the vinegar. Let\'s start over!');
        playSound('error');
        return;
    }

    experimentState.bakingSodaAdded = true;
    experimentState.currentStep = 1;
    
    // Visual feedback
    animateSpoonScoop();
    showLiquidLevel('baking-soda-added');
    
    // Update UI
    markStepComplete(1);
    updateProgressUI();
    playSound('success');
    
    // Guide character feedback
    guideCharacterSpeak('Great! You\'ve added sodium bicarbonate (NaHCO₃), the base. Now you can add food coloring if you want to see the reaction better!');
    
    // Educational info
    showScientificInfo('Baking Soda', `
        <p><strong>Chemical Formula:</strong> NaHCO₃ (Sodium Bicarbonate)</p>
        <p><strong>Properties:</strong> A white powder that acts as a weak base.</p>
        <p><strong>pH Level:</strong> Slightly basic (pH ~8.3 when dissolved)</p>
    `);
    
    showStatusMessage('✓ Baking soda added! Optional: Add food coloring or proceed to vinegar.', 'success');
}

/**
 * Add Food Coloring (Optional) - Step 2
 */
function addFoodColoring() {
    if (!experimentState.bakingSodaAdded) {
        showStatusMessage('❌ Add baking soda first!', 'error');
        guideCharacterSpeak('You need to add baking soda before the food coloring!');
        playSound('error');
        return;
    }

    if (experimentState.coloringAdded) {
        showStatusMessage('Food coloring already added!', 'info');
        return;
    }

    experimentState.coloringAdded = true;
    experimentState.currentStep = 2;
    
    // Select a random color (blue, red, yellow, green)
    const colors = [
        { name: 'blue', hue: 210, mix: '#8ea8d8', light: '#b0c5e8' },
        { name: 'red', hue: 0, mix: '#e8b4a8', light: '#f0d0c8' },
        { name: 'yellow', hue: 50, mix: '#f0d8a0', light: '#f8e8c0' },
        { name: 'green', hue: 120, mix: '#a8d8a8', light: '#c0e8c0' }
    ];
    
    experimentState.selectedColor = colors[Math.floor(Math.random() * colors.length)];
    experimentState.colorMixture = experimentState.selectedColor.mix;
    
    // Visual feedback
    updateColorMixture();
    markStepComplete(2);
    updateProgressUI();
    playSound('liquid-pour');
    
    // Guide character feedback
    guideCharacterSpeak(`Perfect! You added ${experimentState.selectedColor.name} food coloring. The liquid is now colorized. Next, add the vinegar to see the reaction!`);
    
    // Educational info
    showScientificInfo('Food Coloring', `
        <p><strong>Purpose:</strong> Makes the reaction more visible.</p>
        <p><strong>Effect:</strong> Doesn't participate in the reaction, just for visualization.</p>
        <p><strong>Note:</strong> This helps us see the chemical changes clearly.</p>
    `);
    
    showStatusMessage('✓ Food coloring added! Now add vinegar to trigger the reaction.', 'success');
}

/**
 * Add Vinegar (CH₃COOH) - Step 3 (Trigger Reaction)
 */
function addVinegar() {
    if (!experimentState.bakingSodaAdded) {
        showStatusMessage('❌ Add baking soda first!', 'error');
        guideCharacterSpeak('You must add baking soda before the vinegar!');
        playSound('error');
        return;
    }

    if (experimentState.vinegarAdded) {
        showStatusMessage('Vinegar already added!', 'info');
        return;
    }

    if (experimentState.reactionActive) {
        showStatusMessage('Reaction already in progress!', 'info');
        return;
    }

    experimentState.vinegarAdded = true;
    experimentState.currentStep = 3;
    experimentState.reactionActive = true;
    
    // Disable buttons during reaction
    disableActionButtons(true);
    
    // Visual and audio feedback
    playSound('vinegar-pour');
    animateLiquidIncrease();
    triggerBubbling();
    triggerFoamExpansion();
    
    // Update UI
    markStepComplete(3);
    showLiquidLevel('vinegar-added');
    updateProgressUI();
    
    // Guide character reaction
    setTimeout(() => {
        guideCharacterSpeak('WOW! The acid-base reaction is happening! The vinegar (acetic acid - CH₃COOH) is reacting with the baking soda (base). Watch the CO₂ bubbles escape!');
        playSound('reaction-complete');
    }, 800);
    
    // Educational info
    showScientificInfo('The Chemical Reaction', `
        <p><strong>Equation:</strong></p>
        <p style="font-family: monospace; text-align: center;">
        NaHCO₃ + CH₃COOH → CH₃COONa + H₂O + CO₂↑
        </p>
        <p><strong>Products:</strong></p>
        <ul>
            <li><strong>Sodium Acetate</strong> (CH₃COONa) - salt</li>
            <li><strong>Water</strong> (H₂O)</li>
            <li><strong>Carbon Dioxide</strong> (CO₂) - the gas causing bubbles</li>
        </ul>
    `);
    
    showStatusMessage('✓ Reaction complete! Chemical equation verified. New substances created!', 'success');
    
    // Re-enable buttons after reaction
    setTimeout(() => {
        disableActionButtons(false);
        experimentState.reactionActive = false;
    }, 4000);
}

/**
 * Reset Experiment
 */
function resetExperiment() {
    console.log('Experiment Reset');
    
    // Reset state
    experimentState.bakingSodaAdded = false;
    experimentState.coloringAdded = false;
    experimentState.vinegarAdded = false;
    experimentState.reactionActive = false;
    experimentState.currentStep = 0;
    experimentState.selectedColor = null;
    experimentState.colorMixture = null;
    
    // Reset UI
    document.querySelectorAll('.step-indicator').forEach(step => {
        step.classList.remove('active', 'completed');
    });
    
    const liquidLevel = document.querySelector('.liquid-level');
    liquidLevel.classList.remove('baking-soda-added', 'coloring-added', 'vinegar-added');
    liquidLevel.style.height = '0%';
    
    const foamLayer = document.querySelector('.foam-layer');
    foamLayer.classList.remove('active');
    
    const progressFill = document.querySelector('.progress-fill');
    progressFill.style.width = '0%';
    
    // Reset status message
    showStatusMessage('Ready to begin! Add baking soda to start.', 'info');
    
    // Reset guide character
    guideCharacterSpeak('Experiment reset! Let\'s try again. Remember: Add baking soda first, then optional food coloring, then vinegar!');
    
    // Reset scientific info
    showScientificInfo('Acid-Base Reaction', `
        <p><strong>Acid-Base Reaction:</strong> When an acid meets a base, they react to form new substances.</p>
        <p><strong>Example:</strong> Vinegar (acid) + Baking Soda (base) = Water + Salt + Carbon Dioxide Gas</p>
        <p>Follow the steps to see this amazing chemical reaction!</p>
    `);
    
    playSound('reset');
}

// ========== ANIMATION FUNCTIONS ==========

/**
 * Animate spoon scooping baking soda
 */
function animateSpoonScoop() {
    const spoon = document.querySelector('.metal-spoon');
    spoon.classList.remove('scooping');
    
    // Trigger reflow to restart animation
    void spoon.offsetWidth;
    spoon.classList.add('scooping');
    
    setTimeout(() => {
        spoon.classList.remove('scooping');
    }, 1200);
}

/**
 * Show liquid level with appropriate class
 */
function showLiquidLevel(levelClass) {
    const liquidLevel = document.querySelector('.liquid-level');
    liquidLevel.classList.add(levelClass);
}

/**
 * Animate liquid increase when vinegar is added
 */
function animateLiquidIncrease() {
    const liquid = document.querySelector('.liquid-level');
    liquid.style.transition = 'height 0.8s ease-out';
}

/**
 * Trigger bubbling animation with CO2 particles
 */
function triggerBubbling() {
    const bubblesContainer = document.querySelector('.bubbles-container');
    const bubbles = bubblesContainer.querySelectorAll('.bubble');
    
    let bubbleIndex = 0;
    const bubbleInterval = setInterval(() => {
        if (bubbleIndex < bubbles.length) {
            const bubble = bubbles[bubbleIndex];
            
            // Random properties
            const size = 8 + Math.random() * 12;
            const delay = Math.random() * 300;
            const offsetX = -30 + Math.random() * 60;
            
            bubble.style.width = size + 'px';
            bubble.style.height = size + 'px';
            bubble.style.left = (50 + offsetX) + '%';
            bubble.style.bottom = '10%';
            bubble.style.setProperty('--offset', offsetX + 'px');
            
            bubble.classList.remove('active');
            void bubble.offsetWidth; // Trigger reflow
            bubble.classList.add('active');
            
            bubbleIndex++;
        } else {
            clearInterval(bubbleInterval);
        }
    }, 150);
    
    // Continue bubbling for 3 seconds
    setTimeout(() => {
        clearInterval(bubbleInterval);
    }, 3000);
}

/**
 * Trigger foam expansion
 */
function triggerFoamExpansion() {
    const foamLayer = document.querySelector('.foam-layer');
    foamLayer.classList.remove('active');
    
    // Trigger reflow
    void foamLayer.offsetWidth;
    foamLayer.classList.add('active');
}

/**
 * Update color mixture visualization
 */
function updateColorMixture() {
    if (!experimentState.selectedColor) return;
    
    const liquidLevel = document.querySelector('.liquid-level');
    liquidLevel.style.setProperty('--color-mix', experimentState.selectedColor.mix);
    liquidLevel.style.setProperty('--color-mix-light', experimentState.selectedColor.light);
    
    // Add the coloring-added class
    liquidLevel.classList.add('coloring-added');
}

// ========== UI UPDATE FUNCTIONS ==========

/**
 * Update progress UI based on current step
 */
function updateProgressUI() {
    const progressFill = document.querySelector('.progress-fill');
    const progress = (experimentState.currentStep / experimentState.totalSteps) * 100;
    progressFill.style.width = progress + '%';
}

/**
 * Mark a step as complete
 */
function markStepComplete(stepNumber) {
    const stepElement = document.getElementById('step-' + stepNumber);
    if (stepElement) {
        stepElement.classList.add('completed');
        stepElement.classList.add('active');
    }
}

/**
 * Show status message
 */
function showStatusMessage(message, type = 'info') {
    const statusElement = document.getElementById('status-message');
    statusElement.textContent = message;
    statusElement.className = 'status-message';
    
    if (type === 'error') {
        statusElement.classList.add('error');
    } else if (type === 'success') {
        statusElement.classList.add('success');
    }
}

/**
 * Disable/Enable action buttons
 */
function disableActionButtons(disabled) {
    document.querySelectorAll('.action-button:not(.reset-btn)').forEach(btn => {
        btn.disabled = disabled;
    });
}

/**
 * Show scientific information
 */
function showScientificInfo(title, content) {
    const infoContent = document.getElementById('info-content');
    
    // Remove old section with same title if it exists
    const oldSection = Array.from(infoContent.querySelectorAll('.info-section')).find(s => 
        s.querySelector('h3')?.textContent === title
    );
    
    if (oldSection) {
        oldSection.remove();
    }
    
    // Create new section
    const section = document.createElement('div');
    section.className = 'info-section';
    section.innerHTML = `<h3>${title}</h3>${content}`;
    
    infoContent.appendChild(section);
}

/**
 * Close info panel
 */
function closeInfoPanel() {
    const infoPanel = document.querySelector('.info-panel');
    infoPanel.style.opacity = '0';
    infoPanel.style.pointerEvents = 'none';
    infoPanel.style.transition = 'opacity 0.3s ease';
    
    setTimeout(() => {
        infoPanel.style.opacity = '1';
        infoPanel.style.pointerEvents = 'auto';
    }, 3000);
}

// ========== GUIDE CHARACTER SYSTEM ==========

/**
 * Initialize guide character
 */
function setupGuideCharacter() {
    const guide = document.getElementById('guide-character');
    
    // Initial greeting
    guideCharacterSpeak(
        'Welcome to the Acid-Base Reaction Experiment! I\'m your guide. ' +
        'Learn about chemistry by mixing baking soda and vinegar. Start by adding baking soda!'
    );
}

/**
 * Make guide character speak
 */
function guideCharacterSpeak(message) {
    const guideText = document.getElementById('guide-text');
    guideText.textContent = message;
    
    // Trigger animation
    const speechBubble = document.querySelector('.guide-speech-bubble');
    speechBubble.style.animation = 'none';
    
    setTimeout(() => {
        speechBubble.style.animation = 'bubble-appear 0.4s ease-out';
    }, 10);
}

// ========== SOUND EFFECTS SYSTEM ==========

/**
 * Toggle audio on/off
 */
function toggleAudio() {
    experimentState.soundEnabled = !experimentState.soundEnabled;
    const audioBtn = document.getElementById('audio-toggle');
    
    if (experimentState.soundEnabled) {
        audioBtn.classList.remove('muted');
    } else {
        audioBtn.classList.add('muted');
    }
}

/**
 * Play sound effect
 */
function playSound(soundType) {
    if (!experimentState.soundEnabled) return;
    
    // Using Web Audio API to generate sounds (no audio files required)
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    
    let frequency = 440;
    let duration = 0.3;
    let type = 'sine';
    
    switch(soundType) {
        case 'success':
            playTone(audioContext, 523, 0.15); // C5 - short
            setTimeout(() => playTone(audioContext, 659, 0.15), 100); // E5
            setTimeout(() => playTone(audioContext, 784, 0.3), 200); // G5
            break;
            
        case 'error':
            playTone(audioContext, 196, 0.2); // G3 - low
            setTimeout(() => playTone(audioContext, 165, 0.2), 150); // E3
            break;
            
        case 'vinegar-pour':
            playTone(audioContext, 200, 0.8, 'triangle');
            break;
            
        case 'liquid-pour':
            playTone(audioContext, 250, 0.5, 'triangle');
            break;
            
        case 'reaction-complete':
            playTone(audioContext, 523, 0.2); // C5
            setTimeout(() => playTone(audioContext, 659, 0.2), 100); // E5
            setTimeout(() => playTone(audioContext, 784, 0.2), 200); // G5
            setTimeout(() => playTone(audioContext, 1047, 0.4), 300); // C6
            break;
            
        case 'reset':
            playTone(audioContext, 300, 0.15, 'sine');
            setTimeout(() => playTone(audioContext, 250, 0.15, 'sine'), 100);
            break;
            
        default:
            playTone(audioContext, 440, 0.2);
    }
}

/**
 * Play a tone using Web Audio API
 */
function playTone(audioContext, frequency, duration, type = 'sine') {
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.type = type;
    oscillator.frequency.setValueAtTime(frequency, audioContext.currentTime);
    
    // Envelope
    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + duration);
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + duration);
}

// ========== EDUCATIONAL CONTENT ==========

/**
 * Scientific concepts and educational information
 */
const scientificContent = {
    bakingSoda: {
        title: 'Baking Soda (Sodium Bicarbonate)',
        content: `
            <p><strong>Chemical Formula:</strong> NaHCO₃</p>
            <p><strong>Type:</strong> Weak base</p>
            <p><strong>pH:</strong> ~8.3 (slightly basic when dissolved in water)</p>
            <p><strong>Uses:</strong> Cooking, cleaning, pH regulation</p>
            <p><strong>Structure:</strong> Ionic compound consisting of sodium (Na⁺), 
            hydrogen (H⁺), carbonate (CO₃²⁻) ions</p>
        `
    },
    vinegar: {
        title: 'Vinegar (Acetic Acid)',
        content: `
            <p><strong>Chemical Formula:</strong> CH₃COOH</p>
            <p><strong>Type:</strong> Weak acid</p>
            <p><strong>pH:</strong> ~2.5 (acidic)</p>
            <p><strong>Composition:</strong> 4-8% acetic acid, rest is water</p>
            <p><strong>Molecular Structure:</strong> Contains a carboxyl group (-COOH) 
            responsible for acidity</p>
        `
    },
    acidBaseReaction: {
        title: 'Acid-Base Reaction',
        content: `
            <p><strong>Definition:</strong> A chemical reaction between an acid and a base 
            that produces water and salt.</p>
            <p><strong>Balanced Equation:</strong></p>
            <p style="font-family: monospace; text-align: center; font-weight: bold;">
            NaHCO₃ + CH₃COOH → CH₃COONa + H₂O + CO₂↑
            </p>
            <p><strong>Products:</strong></p>
            <ul>
                <li><strong>Sodium Acetate (CH₃COONa):</strong> Salt - remains in solution</li>
                <li><strong>Water (H₂O):</strong> Essential product of acid-base reactions</li>
                <li><strong>Carbon Dioxide (CO₂):</strong> Gas that escapes, creating bubbles</li>
            </ul>
        `
    },
    carbonDioxide: {
        title: 'Carbon Dioxide Gas (CO₂)',
        content: `
            <p><strong>Chemical Formula:</strong> CO₂</p>
            <p><strong>Origin:</strong> Product of the acid-base reaction</p>
            <p><strong>Properties:</strong></p>
            <ul>
                <li>Colorless gas</li>
                <li>Denser than air</li>
                <li>Used in carbonated beverages</li>
                <li>Essential for photosynthesis</li>
            </ul>
            <p><strong>In This Reaction:</strong> Escapes as bubbles due to lower solubility 
            in water after reaction completion.</p>
        `
    },
    ionization: {
        title: 'Ion Transfer and pH',
        content: `
            <p><strong>pH Scale:</strong> 0-14</p>
            <ul>
                <li><strong>Acidic:</strong> pH < 7 (contains H⁺ ions)</li>
                <li><strong>Neutral:</strong> pH = 7 (equal H⁺ and OH⁻)</li>
                <li><strong>Basic:</strong> pH > 7 (contains OH⁻ ions)</li>
            </ul>
            <p><strong>During Reaction:</strong> Acid (H⁺) and base (OH⁻) neutralize each other.</p>
        `
    }
};

// ========== INITIALIZATION OF EDUCATIONAL CONTENT ==========
window.addEventListener('load', function() {
    // Set initial scientific info
    showScientificInfo('Acid-Base Reaction', scientificContent.acidBaseReaction.content);
});

// ========== KEYBOARD SHORTCUTS ==========
document.addEventListener('keydown', function(event) {
    switch(event.key) {
        case '1':
            document.getElementById('add-baking-soda-btn').click();
            break;
        case '2':
            document.getElementById('add-coloring-btn').click();
            break;
        case '3':
            document.getElementById('add-vinegar-btn').click();
            break;
        case 'r':
        case 'R':
            resetExperiment();
            break;
        case 'm':
        case 'M':
            toggleAudio();
            break;
    }
});

// ========== PERFORMANCE OPTIMIZATION ==========
// Use requestAnimationFrame for smooth animations
let frameCount = 0;
function animationFrame() {
    frameCount++;
    requestAnimationFrame(animationFrame);
}
animationFrame();

// ========== ERROR HANDLING ==========
window.addEventListener('error', function(event) {
    console.error('Error caught:', event.error);
    // Graceful degradation - game continues even if there are errors
});

// ========== ACCESSIBILITY ==========
// Ensure keyboard navigation works
document.addEventListener('keydown', function(event) {
    if (event.key === 'Tab') {
        // Tab navigation handled by browser
    }
});

console.log('✓ Science Experiment Game Script Loaded');
console.log('Keyboard shortcuts: 1=Baking Soda, 2=Coloring, 3=Vinegar, R=Reset, M=Mute');
