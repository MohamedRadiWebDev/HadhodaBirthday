// Upload form JavaScript for handling image uploads

document.addEventListener('DOMContentLoaded', function() {
    // DOM Elements
    const uploadForm = document.getElementById('imageUploadForm');
    const imageInput = document.getElementById('imageInput');
    const commentInput = document.getElementById('commentInput');
    const fileNameDisplay = document.getElementById('fileName');
    const uploadStatus = document.getElementById('uploadStatus');
    
    // Display selected file name
    imageInput.addEventListener('change', function() {
        if (this.files && this.files[0]) {
            fileNameDisplay.textContent = this.files[0].name;
        } else {
            fileNameDisplay.textContent = '';
        }
    });
    
    // Handle form submission
    uploadForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        // Validate form
        if (!imageInput.files || !imageInput.files[0]) {
            showStatus('يرجى اختيار صورة للمشاركة', 'error');
            return;
        }
        
        // Create FormData object
        const formData = new FormData();
        formData.append('image', imageInput.files[0]);
        formData.append('comment', commentInput.value);
        
        // Show uploading status
        showStatus('جاري رفع الصورة...', 'progress');
        
        try {
            // Send to server
            const response = await fetch('/api/image/upload', {
                method: 'POST',
                body: formData
            });
            
            const result = await response.json();
            
            if (response.ok) {
                // Success
                showStatus('تم رفع الصورة بنجاح! ستظهر في معرض اللحظات الجميلة', 'success');
                
                // Reset form
                uploadForm.reset();
                fileNameDisplay.textContent = '';
                
                // Refresh gallery after short delay
                setTimeout(() => {
                    if (typeof populateGallery === 'function') {
                        populateGallery();
                    } else {
                        window.location.reload();
                    }
                }, 2000);
            } else {
                // Error from server
                showStatus(`حدث خطأ: ${result.error || 'فشل في رفع الصورة'}`, 'error');
            }
        } catch (error) {
            // Network or other error
            console.error('Upload error:', error);
            showStatus('حدث خطأ أثناء رفع الصورة. يرجى المحاولة مرة أخرى.', 'error');
        }
    });
    
    // Helper function to show status messages
    function showStatus(message, type) {
        uploadStatus.textContent = message;
        uploadStatus.className = 'upload-status';
        uploadStatus.classList.add(`upload-${type}`);
        uploadStatus.style.display = 'block';
        
        // Hide success/progress messages after delay
        if (type === 'success' || type === 'progress') {
            setTimeout(() => {
                if (type === 'success') {
                    uploadStatus.style.display = 'none';
                }
            }, 5000);
        }
    }
});
