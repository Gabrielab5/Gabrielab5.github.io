document.addEventListener('DOMContentLoaded', () => {
    function setupUI() {
        const hamburger = document.querySelector('.hamburger-menu');
        const navMenu = document.querySelector('.main-nav');
        if (hamburger && navMenu) {
            hamburger.addEventListener('click', () => {
                navMenu.classList.toggle('is-open');
            });
        }

        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', function (e) {
                e.preventDefault();
                const targetElement = document.querySelector(this.getAttribute('href'));
                if (targetElement) {
                    targetElement.scrollIntoView({ behavior: 'smooth' });
                }
                if (navMenu && navMenu.classList.contains('is-open')) {
                    navMenu.classList.remove('is-open');
                }
            });
        });
    }

    // --- Project Slider ---
    function setupProjectSlider() {
        const sliderWrapper = document.querySelector('.projects-slider-wrapper');
        const projectsContainer = document.querySelector('.project-cards');
        const prevButton = document.querySelector('.prev-arrow');
        const nextButton = document.querySelector('.next-arrow');

        if (!projectsContainer || !prevButton || !nextButton) return;

        const card = projectsContainer.querySelector('.project-card');
        if (!card) return;

        const gap = parseInt(window.getComputedStyle(projectsContainer).gap, 10) || 32;
        const scrollAmount = card.offsetWidth + gap;

        nextButton.addEventListener('click', () => {
            const isAtEnd = projectsContainer.scrollLeft + projectsContainer.clientWidth >= projectsContainer.scrollWidth - 1;
            if (isAtEnd) {
                projectsContainer.scrollTo({ left: 0, behavior: 'smooth' });
            } else {
                projectsContainer.scrollBy({ left: scrollAmount, behavior: 'smooth' });
            }
        });

        prevButton.addEventListener('click', () => {
            const isAtStart = projectsContainer.scrollLeft === 0;
            if (isAtStart) {
                projectsContainer.scrollTo({ left: projectsContainer.scrollWidth, behavior: 'smooth' });
            } else {
                projectsContainer.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
            }
        });
    }
  
    // --- Timeline Slider 
    const timelineScrollContainer = document.querySelector('.timeline-section .timeline-scroll-container'); // Correctly targets the scrollable div
        const timelinePrevButton = document.querySelector('.timeline-section .timeline-arrow.left');
        const timelineNextButton = document.querySelector('.timeline-section .timeline-arrow.right');

        if (timelineScrollContainer && timelinePrevButton && timelineNextButton) {
            const timelineItem = timelineScrollContainer.querySelector('.timeline-h-item');
            if (timelineItem) {
                const horizontalTimeline = timelineScrollContainer.querySelector('.horizontal-timeline');
                const timelineGap = horizontalTimeline ? parseInt(window.getComputedStyle(horizontalTimeline).gap, 10) : 120;
                
                const timelineScrollAmount = timelineItem.offsetWidth + timelineGap;

                timelineNextButton.addEventListener('click', () => {
                    const isAtEnd = timelineScrollContainer.scrollLeft + timelineScrollContainer.clientWidth >= timelineScrollContainer.scrollWidth - 1;
                    if (isAtEnd) {
                        timelineScrollContainer.scrollTo({ left: 0, behavior: 'smooth' });
                    } else {
                        timelineScrollContainer.scrollBy({ left: timelineScrollAmount, behavior: 'smooth' });
                    }
                });

                timelinePrevButton.addEventListener('click', () => {
                    const isAtStart = timelineScrollContainer.scrollLeft === 0;
                    if (isAtStart) {
                        timelineScrollContainer.scrollTo({ left: timelineScrollContainer.scrollWidth, behavior: 'smooth' });
                    } else {
                        timelineScrollContainer.scrollBy({ left: -timelineScrollAmount, behavior: 'smooth' });
                    }
                });
            }
        }
    
    
    function setupContactForm() {
        const contactForm = document.getElementById('contact-form');
        
        if (!contactForm) {
            console.warn("Contact form element not found. EmailJS will not be initialized."); 
            return;
        }

        emailjs.init(EMAILJS_PUBLIC_KEY);
        
        const successModal = document.getElementById('success-modal');
        const closeModalBtn = successModal.querySelector('.close-button');
        const submitBtn = document.getElementById('submit-btn');
        const emailError = document.getElementById('email-error');
        const messageError = document.getElementById('message-error');
        const emailInput = document.getElementById('email');
        const messageInput = document.getElementById('message');
        const errorModal = document.getElementById('error-modal'); 
        const errorMessageText = document.getElementById('error-message-text'); 
        const closeModalButtons = document.querySelectorAll('.modal .close-button');

        closeModalButtons.forEach(button => {
            button.addEventListener('click', () => {
                successModal.classList.add('hidden');
                if (errorModal) errorModal.classList.add('hidden'); 
            });
        });

        if (successModal) {
            successModal.addEventListener('click', (event) => {
                if (event.target === successModal) successModal.classList.add('hidden');
            });
        }
        if (errorModal) {
            errorModal.addEventListener('click', (event) => {
                if (event.target === errorModal) errorModal.classList.add('hidden');
            });
        }

        if (!submitBtn) {
            console.warn("Submit button element not found.");
            return;
        }
        function validateEmail(email) {
            const re = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
            return re.test(String(email).toLowerCase());
        }

        contactForm.addEventListener('submit', function(event) {
            event.preventDefault();

            emailError.textContent = '';
            messageError.textContent = '';
            if (errorMessageText) errorMessageText.textContent = ''; 
            if (errorModal) errorModal.classList.add('hidden');

            let isValid = true;

            const email = emailInput.value.trim();
            const message = messageInput.value.trim();

            if (!validateEmail(email)) {
                emailError.textContent = 'Please enter a valid email address.';
                isValid = false;
            }
            if (message === '') {
                messageError.textContent = 'Please enter a message.';
                isValid = false;
            }

            if (!isValid) return;

            submitBtn.disabled = true;
            submitBtn.innerHTML = 'Sending...';

            emailjs.sendForm(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, this)
                .then(() => {
                    placeholder="Your Message"
                    successModal.classList.remove('hidden');
                    contactForm.reset();
                }, (error) => {
                    console.error('EmailJS FAILED to send:', error);
                    const errorModal = document.getElementById('error-modal'); 
                    const errorMessage = document.getElementById('error-message-text'); 
                    if (errorModal && errorMessage) {
                        errorMessage.textContent = 'Failed to send message. Please try again later.';
                        errorModal.classList.remove('hidden');
                    } else {
                        alert('Oops! Something went wrong. Please try again.'); 
                    }
                })
                .finally(() => {
                    submitBtn.disabled = false;
                    submitBtn.innerHTML = 'Send Message <i class="fas fa-paper-plane"></i>';
                });
        });

        function hideModal() {
            successModal.classList.add('hidden');
        }

        closeModalBtn.addEventListener('click', hideModal);
        successModal.addEventListener('click', (event) => {
            if (event.target === successModal) hideModal();
        });
    }

    setupUI();
    setupProjectSlider();
    setupContactForm();
});