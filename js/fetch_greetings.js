// Script to fetch greetings from Google Sheets and display them in the guestbook section

// Google Sheet ID from the URL
const SHEET_ID = '1Yp-qAcaoxA1-7-_z3_QNQvlV9NGbuSTvn7aPN3OjkPk';
const SHEET_TAB_NAME = 'Form Responses 1';

// Function to load greetings using Google Visualization API (JSONP approach - no CORS issues)
function fetchGreetings() {
    // Show loading message
    const wishesContainer = document.getElementById('wishes-container');
    wishesContainer.innerHTML = '<div class="loading">استنى علينا بنحمّل كلام الرجالة...</div>';
    
    try {
        // Create a script element to load the Google Visualization API
        const script = document.createElement('script');
        script.src = 'https://www.gstatic.com/charts/loader.js';
        script.onload = () => {
            // Load the Visualization API and the corechart package
            google.charts.load('current', {'packages':['corechart']});
            
            // Set a callback to run when the Google Visualization API is loaded
            google.charts.setOnLoadCallback(() => {
                // Create a query to get the data from the spreadsheet
                const query = new google.visualization.Query(
                    `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?sheet=${SHEET_TAB_NAME}&headers=1`
                );
                
                // Send the query with a callback function
                query.send(handleQueryResponse);
            });
        };
        
        // Add the script to the page
        document.head.appendChild(script);
        
    } catch (error) {
        console.error('Error setting up Google Visualization API:', error);
        wishesContainer.innerHTML = '<div class="error">حدث خطأ أثناء تحميل التهاني. يرجى المحاولة مرة أخرى لاحقًا.</div>';
    }
}

// Handle the query response
function handleQueryResponse(response) {
    const wishesContainer = document.getElementById('wishes-container');
    
    if (response.isError()) {
        console.error('Error in query: ' + response.getMessage() + ' ' + response.getDetailedMessage());
        wishesContainer.innerHTML = '<div class="error">حدث خطأ أثناء تحميل التهاني. يرجى المحاولة مرة أخرى لاحقًا.</div>';
        return;
    }
    
    // Get the data table from the response
    const data = response.getDataTable();
    const numRows = data.getNumberOfRows();
    
    // Clear loading message
    wishesContainer.innerHTML = '';
    
    // If no greetings found
    if (numRows === 0) {
        wishesContainer.innerHTML = '<div class="no-wishes">لا توجد تهاني بعد. كن أول من يضيف تهنئة!</div>';
        return;
    }
    
    // Process each greeting (newest first)
    for (let i = numRows - 1; i >= 0; i--) {
        const timestamp = data.getValue(i, 0); // Timestamp is in column A (index 0)
        const name = data.getValue(i, 1);      // Name is in column B (index 1)
        const message = data.getValue(i, 2);   // Message is in column C (index 2)
        
        // Only require the message to be present
        if (message) {
            // Create greeting card
            const wishCard = document.createElement('div');
            wishCard.className = 'wish-card';

            // Only add name element if name exists and is not empty/null
            if (name) {
                const wishName = document.createElement('div');
                wishName.className = 'wish-name';
                wishName.textContent = name;
                wishCard.appendChild(wishName);
            }

            const wishMessage = document.createElement('div');
            wishMessage.className = 'wish-message';
            wishMessage.textContent = message;
            wishCard.appendChild(wishMessage);

            const wishDate = document.createElement('div');
            wishDate.className = 'wish-date';
            // Format date if available
            if (timestamp) {
                const date = new Date(timestamp);
                if (!isNaN(date)) {
                    wishDate.textContent = date.toLocaleDateString('ar-EG');
                }
            }

            // Only add date element if it has content
            if (wishDate.textContent) {
                wishCard.appendChild(wishDate);
            }
            
            wishesContainer.appendChild(wishCard);
        }
    }
}

// Load greetings when the page loads
document.addEventListener('DOMContentLoaded', fetchGreetings);

