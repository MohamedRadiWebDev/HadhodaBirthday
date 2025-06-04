// Countdown Timer with Animation - Version 2 (Cache-busting)
// Global interval ID to manage the countdown timer
let countdownInterval = null;

// Immediate self-executing function to ensure code runs as soon as script is loaded
(function() {
    console.log("Countdown script loaded and executing immediately");
    
    // Add CSS for countdown animation dynamically
    const style = document.createElement("style");
    style.textContent = `
        .time-amount {
            position: relative;
            perspective: 300px;
            transition: color 0.3s;
        }
        
        .flip-animation {
            animation: flipNumber 0.5s ease-in-out;
        }
        
        @keyframes flipNumber {
            0% {
                transform: rotateX(0deg);
            }
            50% {
                transform: rotateX(90deg);
                color: var(--gold);
            }
            100% {
                transform: rotateX(0deg);
            }
        }
        
        /* Mobile touch improvements */
        @media (max-width: 768px) {
            .card-inner, .image-gallery img, .add-wish-button {
                transition: transform 0.3s ease;
            }
            
            .card-inner:active, .image-gallery img:active, .add-wish-button:active {
                transform: scale(0.95);
            }
            
            .time-section {
                cursor: pointer;
                user-select: none;
                -webkit-tap-highlight-color: transparent;
            }
            
            .time-section:active .time-amount {
                animation: pulse 0.5s ease;
            }
            
            @keyframes pulse {
                0% { transform: scale(1); }
                50% { transform: scale(1.1); }
                100% { transform: scale(1); }
            }
        }
    `;
    document.head.appendChild(style);
    
    // Initialize countdown and card flip immediately
    initializeCountdown();
    initializeCardFlip();
    
    // Also set up event listeners for DOM ready and window load
    document.addEventListener("DOMContentLoaded", function() {
        console.log("DOM fully loaded - initializing countdown v2");
        initializeCountdown();
        initializeCardFlip();
    });
    
    window.addEventListener('load', function() {
        console.log("Window fully loaded - ensuring countdown v2 is running");
        initializeCountdown();
        initializeCardFlip();
    });
})();

// Function to initialize countdown
function initializeCountdown() {
    console.log("Initializing countdown");
    
    // Clear any existing interval to prevent duplicates
    if (countdownInterval) {
        clearInterval(countdownInterval);
        countdownInterval = null;
    }
    
    // Run immediately once
    updateCountdown();
    
    // Then set up interval for regular updates
    countdownInterval = setInterval(updateCountdown, 1000);
}

// Main countdown function
function updateCountdown() {
    try {
        const now = new Date().getTime();
        // Use a fixed date for testing - June 10, 2025
        const targetDate = new Date("2025-06-10T00:00:00").getTime();
        const timeRemaining = targetDate - now;
        
        if (timeRemaining <= 0) {
            // Handle countdown completion
            updateElementWithValue("days", "00");
            updateElementWithValue("hours", "00");
            updateElementWithValue("minutes", "00");
            updateElementWithValue("seconds", "00");
            
            // Stop the countdown
            if (countdownInterval) {
                clearInterval(countdownInterval);
            }
            return;
        }

        // Calculate time components
        const days = Math.floor(timeRemaining / (1000 * 60 * 60 * 24));
        const hours = Math.floor((timeRemaining % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((timeRemaining % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((timeRemaining % (1000 * 60)) / 1000);
        
        // Format values with leading zeros
        const formattedDays = days < 10 ? "0" + days : days.toString();
        const formattedHours = hours < 10 ? "0" + hours : hours.toString();
        const formattedMinutes = minutes < 10 ? "0" + minutes : minutes.toString();
        const formattedSeconds = seconds < 10 ? "0" + seconds : seconds.toString();
        
        // Update countdown values
        updateElementWithValue("days", formattedDays);
        updateElementWithValue("hours", formattedHours);
        updateElementWithValue("minutes", formattedMinutes);
        updateElementWithValue("seconds", formattedSeconds);
        
        console.log("Countdown updated:", days, hours, minutes, seconds);
        
    } catch (error) {
        console.error("Error in updateCountdown:", error);
    }
}

// Function to update element with value and animate if changed
function updateElementWithValue(id, newValue) {
    const element = document.getElementById(id);
    if (!element) {
        console.error(`Element with id ${id} not found`);
        return;
    }

    const currentValue = element.textContent;
    
    // Only update and animate if the value has changed
    if (currentValue !== newValue) {
        // Remove animation class first
        element.classList.remove("flip-animation");
        
        // Force browser reflow to restart animation
        void element.offsetWidth;
        
        // Update the text content
        element.textContent = newValue;
        
        // Add animation class
        element.classList.add("flip-animation");
        
        // Remove class after animation completes
        setTimeout(() => {
            element.classList.remove("flip-animation");
        }, 500);
    }
}

// Function to initialize card flip functionality
function initializeCardFlip() {
    console.log("Initializing card flip");
    
    try {
        const card = document.querySelector(".card-inner");
        if (!card) {
            console.error("Card element not found");
            return;
        }
        
        // Remove any existing event listeners by cloning and replacing
        const newCard = card.cloneNode(true);
        card.parentNode.replaceChild(newCard, card);
        
        // Add click event to the card for toggling
        newCard.addEventListener("click", function(e) {
            console.log("Card clicked - toggling flip state");
            this.classList.toggle("flipped");
            
            // Vibration feedback if supported
            if ("vibrate" in navigator) {
                navigator.vibrate(20);
            }
        });
        
        // Add specific listeners for front and back
        const cardFront = newCard.querySelector(".card-front");
        const cardBack = newCard.querySelector(".card-back");
        const envelope = newCard.querySelector(".card-front .envelope");
        
        if (envelope) {
            envelope.addEventListener("click", function(e) {
                console.log("Envelope clicked - adding flipped class");
                e.stopPropagation(); // Prevent event bubbling
                newCard.classList.add("flipped");
                
                // Vibration feedback if supported
                if ("vibrate" in navigator) {
                    navigator.vibrate(20);
                }
            });
        }
        
        if (cardBack) {
            cardBack.addEventListener("click", function(e) {
                console.log("Back clicked - removing flipped class");
                e.stopPropagation(); // Prevent event bubbling
                newCard.classList.remove("flipped");
                
                // Vibration feedback if supported
                if ("vibrate" in navigator) {
                    navigator.vibrate(20);
                }
            });
        }
        
        // Add touch swipe functionality
        let touchStartX = 0;
        let touchEndX = 0;
        let touchStartY = 0;
        let touchEndY = 0;
        
        newCard.addEventListener("touchstart", function(e) {
            touchStartX = e.changedTouches[0].screenX;
            touchStartY = e.changedTouches[0].screenY;
        }, { passive: true });
        
        newCard.addEventListener("touchend", function(e) {
            touchEndX = e.changedTouches[0].screenX;
            touchEndY = e.changedTouches[0].screenY;
            handleSwipe();
        }, { passive: true });
        
        function handleSwipe() {
            const xDiff = touchEndX - touchStartX;
            const yDiff = touchEndY - touchStartY;
            
            if (Math.abs(xDiff) > Math.abs(yDiff)) {
                if (Math.abs(xDiff) > 50) { 
                    newCard.classList.toggle("flipped");
                    
                    // Vibration feedback if supported
                    if ("vibrate" in navigator) {
                        navigator.vibrate(20);
                    }
                }
            }
        }
    } catch (error) {
        console.error("Error in initializeCardFlip:", error);
    }
}
