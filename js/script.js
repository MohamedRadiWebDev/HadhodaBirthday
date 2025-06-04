// Main JavaScript file for the birthday website

// DOM Elements
const cardInner = document.querySelector('.card-inner');
const birthdayMessage = document.getElementById('birthdayMessage');
const toggleAudioBtn = document.getElementById('toggleAudio');
const bgMusic = document.getElementById('bgMusic');

// Birthday message
const message = `كل سنة وانتي طيبة يا أحلى وأحن إنسانة  ❤️ وبنتمنى ليكي سنة جديدة كلها فرحة وضحكة ما تفارقكيش أبدًا 🎉🎂🌸`;

// Set the birthday message
birthdayMessage.textContent = message;

// Card flip effect
cardInner.addEventListener('click', function() {
    this.classList.toggle('flipped');
    
    // Add confetti effect when card is flipped
    if (this.classList.contains('flipped')) {
        createConfetti();
    }
});

// Audio controls
toggleAudioBtn.addEventListener('click', function() {
    if (bgMusic.paused) {
        bgMusic.play();
        this.innerHTML = '<i class="fas fa-volume-up"></i>';
    } else {
        bgMusic.pause();
        this.innerHTML = '<i class="fas fa-volume-mute"></i>';
    }
});

// Initialize audio (muted by default)
bgMusic.volume = 0.5;

// Countdown Timer
function updateCountdown() {
    // Set the date we're counting down to (example: next month)
    const today = new Date();
    const nextBirthday = new Date();
    
    // Set to a future date (for demo purposes)
    nextBirthday.setDate(today.getDate() + 7);
    
    // Get current time
    const now = new Date().getTime();
    
    // Find the distance between now and the countdown date
    const distance = nextBirthday - now;
    
    // Time calculations for days, hours, minutes and seconds
    const days = Math.floor(distance / (1000 * 60 * 60 * 24));
    const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((distance % (1000 * 60)) / 1000);
    
    // Display the result
    document.getElementById("days").textContent = days.toString().padStart(2, '0');
    document.getElementById("hours").textContent = hours.toString().padStart(2, '0');
    document.getElementById("minutes").textContent = minutes.toString().padStart(2, '0');
    document.getElementById("seconds").textContent = seconds.toString().padStart(2, '0');
}

// Update the countdown every 1 second
setInterval(updateCountdown, 1000);
updateCountdown();

// Confetti effect
function createConfetti() {
    const confettiCount = 100;
    const container = document.querySelector('body');
    
    for (let i = 0; i < confettiCount; i++) {
        const confetti = document.createElement('div');
        confetti.className = 'confetti';
        
        // Random position, color, and animation delay
        const left = Math.random() * 100;
        const width = Math.random() * 10 + 5;
        const height = width * 0.4;
        const colorIndex = Math.floor(Math.random() * 3);
        const colors = ['var(--pink)', 'var(--gold)', 'var(--white)'];
        const animationDelay = Math.random() * 5;
        
        confetti.style.left = `${left}%`;
        confetti.style.width = `${width}px`;
        confetti.style.height = `${height}px`;
        confetti.style.backgroundColor = colors[colorIndex];
        confetti.style.animationDelay = `${animationDelay}s`;
        
        container.appendChild(confetti);
        
        // Remove confetti after animation
        setTimeout(() => {
            confetti.remove();
        }, 5000);
    }
}

// Floating hearts background animation
function createFloatingHearts() {
    const heartsContainer = document.createElement('div');
    heartsContainer.className = 'floating-hearts-container';
    document.body.appendChild(heartsContainer);
    
    // Create initial hearts
    createHearts(20, heartsContainer);
    
    // Continue creating hearts at intervals
    setInterval(() => {
        createHearts(5, heartsContainer);
    }, 3000);
}

// Create hearts for animations
function createHearts(count, container = document.body) {
    for (let i = 0; i < count; i++) {
        setTimeout(() => {
            const heart = document.createElement('div');
            heart.className = 'floating-heart';
            
            // Random size, position, and animation properties
            const size = Math.random() * 30 + 10;
            const left = Math.random() * 100;
            const animationDuration = Math.random() * 10 + 10;
            const animationDelay = Math.random() * 5;
            const opacity = Math.random() * 0.5 + 0.3;
            
            // Set heart styles
            heart.style.width = `${size}px`;
            heart.style.height = `${size}px`;
            heart.style.left = `${left}%`;
            heart.style.animationDuration = `${animationDuration}s`;
            heart.style.animationDelay = `${animationDelay}s`;
            heart.style.opacity = opacity;
            
            // Add heart to container
            container.appendChild(heart);
            
            // Remove heart after animation completes
            setTimeout(() => {
                heart.remove();
            }, (animationDuration + animationDelay) * 1000);
        }, i * 200);
    }
}

// Create animated hearts for final section
function createFinalSectionHearts() {
    const heartsContainer = document.querySelector('.hearts-container');
    
    // Create initial hearts
    createHearts(15, heartsContainer);
    
    // Continue creating hearts at intervals
    setInterval(() => {
        createHearts(5, heartsContainer);
    }, 4000);
}

// Initialize
document.addEventListener('DOMContentLoaded', function() {
    // Add CSS for confetti
    const style = document.createElement('style');
    style.textContent = `
        .confetti {
            position: fixed;
            top: -10px;
            z-index: 999;
            animation: fall 5s linear forwards;
            transform: rotate(0);
        }
        
        @keyframes fall {
            0% {
                transform: translateY(0) rotate(0);
                opacity: 1;
            }
            75% {
                opacity: 1;
            }
            100% {
                transform: translateY(100vh) rotate(720deg);
                opacity: 0;
            }
        }
    `;
    document.head.appendChild(style);
    
    // Start floating hearts background animation
    createFloatingHearts();
    
    // Start animated hearts in final section
    createFinalSectionHearts();
});
