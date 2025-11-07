// Smooth counter with smart intervals
function animateCounter(element, target, duration = 2000) {
    const startTime = performance.now();
    let lastDisplayed = -1;
    const plusSign = document.querySelector('.counter-plus');

    // Smooth easing - more gradual
    const easeOutCubic = (t) => {
        return 1 - Math.pow(1 - t, 3);
    };

    function animate(currentTime) {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const easedProgress = easeOutCubic(progress);

        // Calculate raw value
        const rawValue = easedProgress * target;

        // Smart rounding - larger steps when far, smaller when close
        let step;
        if (rawValue < 1000) step = 100;
        else if (rawValue < 5000) step = 250;
        else if (rawValue < 10000) step = 500;
        else if (rawValue < 12000) step = 200;
        else if (rawValue < 12800) step = 100;
        else if (rawValue < 12950) step = 50;
        else step = 10;

        const current = Math.min(Math.floor(rawValue / step) * step, target);

        // Only update if value changed
        if (current !== lastDisplayed) {
            // Smooth fade for number change
            element.style.opacity = '0.7';
            setTimeout(() => {
                element.textContent = current.toLocaleString();
                element.style.opacity = '1';
                lastDisplayed = current;
            }, 50);
        }

        if (progress < 1) {
            requestAnimationFrame(animate);
        } else {
            // Торжественное финальное появление - число и плюс одновременно!
            element.style.opacity = '0';
            element.style.transform = 'scale(0.85)';
            plusSign.style.transform = 'scale(0.85)';

            setTimeout(() => {
                element.textContent = target.toLocaleString();
                // Bounce эффект для торжественности
                element.style.transition = 'opacity 0.7s cubic-bezier(0.34, 1.56, 0.64, 1), transform 0.7s cubic-bezier(0.34, 1.56, 0.64, 1)';
                element.style.opacity = '1';
                element.style.transform = 'scale(1.08)';

                // Plus появляется одновременно с тем же bounce эффектом
                plusSign.classList.add('visible');
                plusSign.style.transform = 'scale(1.08)';

                // Возврат к нормальному размеру
                setTimeout(() => {
                    element.style.transform = 'scale(1)';
                    plusSign.style.transform = 'scale(1)';
                }, 700);
            }, 100);
        }
    }

    requestAnimationFrame(animate);
}

// Initialize counter animation on page load
document.addEventListener('DOMContentLoaded', function() {
    const counterElement = document.querySelector('.counter-number');
    const target = parseInt(counterElement.getAttribute('data-target'));

    // Start animation after a brief delay
    setTimeout(() => {
        animateCounter(counterElement, target);
    }, 200);
});

// Modal functionality
document.addEventListener('DOMContentLoaded', function() {
    const modalOverlay = document.getElementById('modalOverlay');
    const closeButton = document.getElementById('closeButton');
    const commentInputSection = document.querySelector('.comment-input-section');
    const commentInputWrapper = document.querySelector('.comment-input-wrapper');
    const commentInput = document.querySelector('.comment-input');
    
    // Close modal function
    function closeModal() {
        modalOverlay.style.display = 'none';
    }
    
    // Open modal function (for testing)
    function openModal() {
        modalOverlay.style.display = 'flex';
    }
    
    // Close button click handler
    closeButton.addEventListener('click', closeModal);
    
    // Close on overlay click (optional)
    modalOverlay.addEventListener('click', function(event) {
        if (event.target === modalOverlay) {
            closeModal();
        }
    });
    
    // Close on Escape key (optional)
    document.addEventListener('keydown', function(event) {
        if (event.key === 'Escape') {
            closeModal();
        }
    });
    
    // Comment input expansion
    commentInput.addEventListener('focus', function(event) {
        if (!commentInputSection.classList.contains('expanded')) {
            commentInputSection.classList.add('expanded');
            adjustSectionHeight();
        }
    });
    
    // Adjust section height based on content
    function adjustSectionHeight() {
        if (commentInputSection.classList.contains('expanded')) {
            // Reset textarea height to calculate natural content height
            commentInput.style.height = 'auto';
            
            // Get the natural content height
            const scrollHeight = commentInput.scrollHeight;
            const minHeight = 68; // Base expanded textarea height
            const maxHeight = 178; // Max textarea height (250px wrapper - 72px buttons)
            
            // Calculate the height we need (between min and max)
            const textareaHeight = Math.max(minHeight, Math.min(scrollHeight, maxHeight));
            
            // Set textarea height
            commentInput.style.height = textareaHeight + 'px';
            
            // Calculate wrapper and section heights
            const wrapperHeight = textareaHeight + 72; // textarea + button area + gap
            const sectionHeight = wrapperHeight + 32; // + section padding
            
            // Apply wrapper and section heights
            commentInputWrapper.style.height = wrapperHeight + 'px';
            commentInputSection.style.height = sectionHeight + 'px';
            
            // Adjust margin-top to grow upward (only on desktop)
            if (window.innerWidth > 768) {
                const growth = sectionHeight - 96;
                commentInputSection.style.marginTop = -growth + 'px';
            } else {
                // On mobile, keep at bottom but allow height growth
                commentInputSection.style.marginTop = 'auto';
            }
            
            // Enable/disable scrolling based on content
            if (scrollHeight > maxHeight) {
                commentInput.style.overflowY = 'auto';
            } else {
                commentInput.style.overflowY = 'hidden';
            }
        }
    }
    
    // Auto-resize on input
    commentInput.addEventListener('input', function() {
        adjustSectionHeight();
    });
    
    // Collapse when clicking outside
    document.addEventListener('click', function(event) {
        if (!commentInputSection.contains(event.target) && commentInputSection.classList.contains('expanded')) {
            if (commentInput.value.trim() === '') {
                // Remove expanded class first
                commentInputSection.classList.remove('expanded');
                // Force reset all inline styles
                commentInputSection.removeAttribute('style');
                commentInputWrapper.removeAttribute('style');
                commentInput.removeAttribute('style');
                // Force reflow to ensure styles are applied
                void commentInputSection.offsetHeight;
            }
        }
    });
    
    // Enable/disable button based on input
    const addButton = document.querySelector('.add-comment-button');
    commentInput.addEventListener('input', function() {
        if (commentInput.value.trim() !== '') {
            addButton.disabled = false;
            addButton.classList.add('active');
        } else {
            addButton.disabled = true;
            addButton.classList.remove('active');
        }
        adjustSectionHeight();
    });
    
    // Add comment functionality
    addButton.addEventListener('click', function() {
        if (!addButton.disabled && commentInput.value.trim() !== '') {
            addNewComment(commentInput.value.trim());
            commentInput.value = '';
            addButton.disabled = true;
            addButton.classList.remove('active');
            commentInputSection.classList.remove('expanded');
            commentInputSection.style.height = '';
            commentInputSection.style.marginTop = '';
            commentInputWrapper.style.height = '';
            commentInput.style.height = '';
        }
    });
    
    // Track avatar colors by author
    const authorColors = {
        'John Donn': '#7BB4D5',
        'Kate Johns': '#C8A9E1',
        'Claude Schneider': '#9E8FDA'
    };
    
    // Function to add new comment
    function addNewComment(text) {
        const commentsList = document.querySelector('.comments-list');
        const newComment = document.createElement('div');
        newComment.className = 'comment-item';
        
        // Use consistent color for Claude Schneider
        const authorName = 'Claude Schneider';
        const avatarColor = authorColors[authorName] || '#9E8FDA';
        
        newComment.innerHTML = `
            <div class="comment-avatar">
                <svg width="28" height="28" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <circle cx="14" cy="14" r="14" fill="${avatarColor}"/>
                    <g transform="translate(5, 4.5)">
                        <path fill-rule="evenodd" clip-rule="evenodd" d="M12.9705 6.26907C12.9705 8.47184 11.2043 10.2381 9 10.2381C6.79643 10.2381 5.02951 8.47184 5.02951 6.26907C5.02951 4.0663 6.79643 2.30078 9 2.30078C11.2043 2.30078 12.9705 4.0663 12.9705 6.26907ZM9 17.3008C5.74678 17.3008 3 16.772 3 14.732C3 12.6912 5.76404 12.1812 9 12.1812C12.254 12.1812 15 12.71 15 14.75C15 16.7908 12.236 17.3008 9 17.3008Z" fill="white"/>
                    </g>
                </svg>
            </div>
            <div class="comment-content">
                <div class="comment-header">
                    <span class="comment-author">Claude Schneider</span>
                    <span class="comment-dot">•</span>
                    <span class="comment-time">just now</span>
                </div>
                <div class="comment-text">${text.replace(/\n/g, '<br>')}</div>
            </div>
        `;
        
        commentsList.appendChild(newComment);
        
        // Scroll to show the new comment with 16px padding below
        setTimeout(() => {
            const commentsContent = document.querySelector('.comments-content');
            commentsContent.scrollTo({
                top: commentsContent.scrollHeight,
                behavior: 'smooth'
            });
        }, 100);
    }
    
    // Mobile tab switching
    const mobileTabs = document.querySelectorAll('.mobile-tab');
    const leftColumn = document.querySelector('.modal-column-left');
    const rightColumn = document.querySelector('.modal-column-right');
    
    // Set initial state for mobile
    function initializeMobileView() {
        if (window.innerWidth <= 768) {
            leftColumn.classList.add('active');
            rightColumn.classList.remove('active');
        } else {
            leftColumn.classList.remove('active');
            rightColumn.classList.remove('active');
        }
    }
    
    mobileTabs.forEach(tab => {
        tab.addEventListener('click', function() {
            const tabName = this.getAttribute('data-tab');
            
            // Update active tab
            mobileTabs.forEach(t => t.classList.remove('active'));
            this.classList.add('active');
            
            // Show/hide columns
            if (tabName === 'preview') {
                leftColumn.classList.add('active');
                rightColumn.classList.remove('active');
            } else {
                leftColumn.classList.remove('active');
                rightColumn.classList.add('active');
            }
        });
    });
    
    // Handle window resize
    window.addEventListener('resize', initializeMobileView);
    
    // Initialize on load
    initializeMobileView();
    
    // Open modal on page load for testing
    openModal();
});