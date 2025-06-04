// Gallery JavaScript for handling dynamic image and video loading from Google Sheets CSV

document.addEventListener('DOMContentLoaded', function() {
    // DOM Elements
    const imageGallery = document.querySelector('.image-gallery');
    const imageModal = document.getElementById('imageModal');
    const modalMessage = document.getElementById('modalMessage');
    const closeModal = document.querySelector('.close-modal');
    
    // Google Sheet published CSV URL - Form Responses 1
    const SHEET_URL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vT4tLa9F1xw_RApK7F2HJvCAHkVebnqA6PjwbzB6I7I8aZoYgghiQZ_qqwuVGBS7JKXk70ej3jqsjUK/pub?gid=1271226652&single=true&output=csv";
    
    // Check if file is a video based on extension or mime type
    function isVideoFile(fileUrl) {
        if (!fileUrl) return false;
        
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
    
    // Convert Google Drive link to direct view link
    function convertToDriveViewLink(url) {
        if (!url) return url;
        
        // Check if it's a Google Drive link
        if (url.includes('drive.google.com')) {
            // Extract file ID
            let fileId = '';
            
            // Pattern for "open?id=" format
            if (url.includes('open?id=')) {
                fileId = url.split('open?id=')[1].split('&')[0];
            } 
            // Pattern for "/d/" format
            else if (url.includes('/d/')) {
                fileId = url.split('/d/')[1].split('/')[0];
            }
            
            if (fileId) {
                return `https://drive.google.com/uc?export=view&id=${fileId}`;
            }
        }
        
        return url;
    }
    
    // Parse CSV data
    function parseCSV(text) {
        const lines = text.split('\n');
        const headers = lines[0].split(',');
        const result = [];
        
        for (let i = 1; i < lines.length; i++) {
            if (!lines[i].trim()) continue; // Skip empty lines
            
            // Handle commas within quoted fields
            const values = [];
            let inQuotes = false;
            let currentValue = '';
            
            for (let j = 0; j < lines[i].length; j++) {
                const char = lines[i][j];
                
                if (char === '"') {
                    inQuotes = !inQuotes;
                } else if (char === ',' && !inQuotes) {
                    values.push(currentValue);
                    currentValue = '';
                } else {
                    currentValue += char;
                }
            }
            
            values.push(currentValue); // Add the last value
            
            const row = {};
            for (let j = 0; j < headers.length && j < values.length; j++) {
                // Remove quotes if present
                let value = values[j];
                if (value.startsWith('"') && value.endsWith('"')) {
                    value = value.substring(1, value.length - 1);
                }
                row[headers[j]] = value;
            }
            
            result.push(row);
        }
        
        return result;
    }
    
    // Fetch images and videos from Google Sheets CSV
    async function fetchMediaFromSheet() {
        try {
            // Show loading message
            imageGallery.innerHTML = '<div class="loading">جاري تحميل الصور والفيديوهات...</div>';
            
            // Fetch the CSV data
            const response = await fetch(SHEET_URL);
            if (!response.ok) {
                throw new Error('Failed to fetch data from Google Sheets');
            }
            
            const csvText = await response.text();
            const data = parseCSV(csvText);
            
            // Process the data
            const mediaItems = [];
            
            for (const row of data) {
                // Expected columns: Timestamp, الاسم, تعليق على الصورة, الصورة
                const timestamp = row['Timestamp'];
                const name = row['الاسم'];
                const comment = row['تعليق على الصورة'];
                let fileUrl = row['الصورة'];
                
                // Convert Google Drive link to direct view link
                fileUrl = convertToDriveViewLink(fileUrl);
                
                // Determine if it's a video
                const isVideo = isVideoFile(fileUrl);
                
                if (fileUrl && fileUrl.trim() !== '') {
                    mediaItems.push({
                        src: fileUrl,
                        alt: name || 'صورة مشاركة',
                        comment: comment || '',
                        isVideo: isVideo,
                        timestamp: timestamp
                    });
                }
            }
            
            return mediaItems;
            
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
                this.src = 'images/birthday_cake.png'; // Fallback image
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
