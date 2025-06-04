// Gallery JavaScript for handling dynamic image and video loading from Google Sheets

document.addEventListener('DOMContentLoaded', function() {
    // DOM Elements
    const imageGallery = document.querySelector('.image-gallery');
    const imageModal = document.getElementById('imageModal');
    const modalMessage = document.getElementById('modalMessage');
    const closeModal = document.querySelector('.close-modal');
    
    // Google Sheet ID and name - will be updated with user's sheet
    const SHEET_URL = "GOOGLE_SHEET_URL_PLACEHOLDER"; // Will be replaced with actual URL
    
    // Check if file is a video based on extension or mime type
    function isVideoFile(fileUrl) {
        // Check based on URL patterns
        const videoExtensions = ['mp4', 'webm', 'ogg', 'mov', 'avi', 'wmv', 'flv', 'mkv'];
        const urlLower = fileUrl.toLowerCase();
        
        // Check for video extensions in the URL
        for (const ext of videoExtensions) {
            if (urlLower.includes('.' + ext)) {
                return true;
            }
        }
        
        // Check for Google Drive video indicators
        if (urlLower.includes('video') || urlLower.includes('=video')) {
            return true;
        }
        
        return false;
    }
    
    // Fetch images and videos from Google Sheets
    async function fetchMediaFromSheet() {
        try {
            // Show loading message
            imageGallery.innerHTML = '<div class="loading">جاري تحميل الصور والفيديوهات...</div>';
            
            // Create a script element to load the Google Visualization API
            const script = document.createElement('script');
            script.src = 'https://www.gstatic.com/charts/loader.js';
            
            // Return a promise that resolves when the API is loaded
            return new Promise((resolve, reject) => {
                script.onload = () => {
                    // Load the Visualization API
                    google.charts.load('current', {'packages':['corechart']});
                    
                    // Set a callback to run when the API is loaded
                    google.charts.setOnLoadCallback(() => {
                        // Create a query to get the data from the spreadsheet
                        const query = new google.visualization.Query(SHEET_URL);
                        
                        // Send the query with a callback function
                        query.send((response) => {
                            if (response.isError()) {
                                reject('Error in query: ' + response.getMessage() + ' ' + response.getDetailedMessage());
                                return;
                            }
                            
                            // Get the data table from the response
                            const data = response.getDataTable();
                            const numRows = data.getNumberOfRows();
                            
                            // Process the data
                            const mediaItems = [];
                            
                            for (let i = 0; i < numRows; i++) {
                                // Assuming columns: Timestamp, Name, Comment, FileURL, IsVideo
                                const timestamp = data.getValue(i, 0);
                                const name = data.getValue(i, 1);
                                const comment = data.getValue(i, 2);
                                const fileUrl = data.getValue(i, 3);
                                let isVideo = data.getValue(i, 4);
                                
                                // If isVideo is not explicitly set, try to determine from URL
                                if (isVideo === null || isVideo === undefined) {
                                    isVideo = isVideoFile(fileUrl);
                                } else if (typeof isVideo === 'string') {
                                    // Convert string 'true'/'false' to boolean
                                    isVideo = isVideo.toLowerCase() === 'true';
                                }
                                
                                if (fileUrl) {
                                    mediaItems.push({
                                        src: fileUrl,
                                        alt: name || 'صورة مشاركة',
                                        comment: comment || '',
                                        isVideo: isVideo,
                                        timestamp: timestamp
                                    });
                                }
                            }
                            
                            resolve(mediaItems);
                        });
                    });
                };
                
                script.onerror = () => {
                    reject('Failed to load Google Visualization API');
                };
                
                // Add the script to the page
                document.head.appendChild(script);
            });
        } catch (error) {
            console.error('Error fetching media from sheet:', error);
            return [];
        }
    }
    
    // Populate gallery with images and videos
    async function populateGallery() {
        try {
            // Fetch media items from Google Sheet
            const sheetMedia = await fetchMediaFromSheet();
            
            // Clear existing gallery content
            imageGallery.innerHTML = '';
            
            // Add default gallery images
            const galleryImages = [
                { 
                    src: 'images/birthday_balloons.png', 
                    alt: 'بالونات عيد الميلاد',
                    comment: 'زي البالونات دي، ضحكتك بتملى الدنيا فرح وبهجة… دايمًا رافعة قلبي لفوق ♥️',
                    isVideo: false
                },
                { 
                    src: 'images/birthday_cake.png', 
                    alt: 'كيكة عيد الميلاد',
                    comment: 'مش بس الكيكة اللي حلوة… إنتي أحلى حاجة حصلتلي في كل أعيادي 🎉',
                    isVideo: false
                },
                { 
                    src: 'images/birthday_gifts.png', 
                    alt: 'هدايا عيد الميلاد',
                    comment: 'كل الهدايا في الدنيا متساويش وجودك جنبي… إنتي هديتي الأجمل 💝',
                    isVideo: false
                }
            ];
            
            // Combine default images with sheet media
            const allMedia = [...galleryImages];
            
            // Add sheet media if available
            if (sheetMedia && sheetMedia.length > 0) {
                // Sort by timestamp (newest first)
                sheetMedia.sort((a, b) => {
                    if (!a.timestamp) return 1;
                    if (!b.timestamp) return -1;
                    return new Date(b.timestamp) - new Date(a.timestamp);
                });
                
                allMedia.push(...sheetMedia);
            }
            
            // Add all media to gallery
            allMedia.forEach((media, index) => {
                addMediaToGallery(media.src, media.alt, media.comment, 'media-' + index, media.isVideo);
            });
            
            // If no media items, show message
            if (allMedia.length === 0) {
                const noMediaElement = document.createElement('div');
                noMediaElement.className = 'no-images';
                noMediaElement.textContent = 'لا توجد صور أو فيديوهات حتى الآن. كن أول من يشارك ذكرياته الجميلة!';
                imageGallery.appendChild(noMediaElement);
            }
        } catch (error) {
            console.error('Error populating gallery:', error);
            imageGallery.innerHTML = '<div class="error">حدث خطأ أثناء تحميل الصور والفيديوهات. يرجى المحاولة مرة أخرى لاحقًا.</div>';
        }
    }
    
    // Add a single media item (image or video) to the gallery
    function addMediaToGallery(src, alt, comment, id, isVideo) {
        let mediaElement;
        
        if (isVideo) {
            // Create video element
            mediaElement = document.createElement('video');
            mediaElement.src = src;
            mediaElement.className = 'gallery-video';
            mediaElement.controls = true;
            mediaElement.muted = true;
            mediaElement.preload = 'metadata';
            
            // Add play on hover functionality
            mediaElement.addEventListener('mouseenter', function() {
                this.play().catch(e => console.log('Auto-play prevented:', e));
            });
            
            mediaElement.addEventListener('mouseleave', function() {
                this.pause();
            });
            
            // For videos, we don't show comments, so we set it to empty
            mediaElement.dataset.comment = '';
        } else {
            // Create image element
            mediaElement = document.createElement('img');
            mediaElement.src = src;
            mediaElement.alt = alt || 'صورة مشاركة';
            mediaElement.className = 'gallery-image';
            mediaElement.dataset.comment = comment || '';
            
            // Add error handling for images
            mediaElement.onerror = function() {
                this.src = 'images/image_error.png'; // Fallback image
                this.alt = 'صورة غير متوفرة';
            };
        }
        
        mediaElement.dataset.id = id;
        mediaElement.dataset.isVideo = isVideo;
        
        // Add click event
        mediaElement.addEventListener('click', function() {
            if (this.dataset.isVideo === 'true') {
                // For videos, open in full screen or play/pause
                if (this.paused) {
                    this.play().catch(e => console.log('Play prevented:', e));
                } else {
                    this.pause();
                }
            } else {
                // For images, show modal with comment
                const commentText = this.dataset.comment || 'لا يوجد تعليق';
                modalMessage.textContent = commentText;
                imageModal.style.display = 'block';
                
                // Add heart animation when modal opens
                if (typeof createHearts === 'function') {
                    createHearts(15);
                }
            }
        });
        
        imageGallery.appendChild(mediaElement);
    }
    
    // Close modal when clicking on X
    closeModal.addEventListener('click', function() {
        imageModal.style.display = 'none';
    });
    
    // Close modal when clicking outside of it
    window.addEventListener('click', function(event) {
        if (event.target === imageModal) {
            imageModal.style.display = 'none';
        }
    });
    
    // Initialize gallery
    populateGallery();
});
