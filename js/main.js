// Smooth scrolling for navigation links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        document.querySelector(this.getAttribute('href')).scrollIntoView({
            behavior: 'smooth'
        });
    });
});

// Navbar background color change on scroll
window.addEventListener('scroll', function() {
    if (window.scrollY > 50) {
        document.querySelector('.navbar').style.backgroundColor = 'var(--dark-blue)';
    } else {
        document.querySelector('.navbar').style.backgroundColor = 'var(--primary-color)';
    }
});

// Animation on scroll for features and courses
const animateOnScroll = () => {
    const elements = document.querySelectorAll('.feature-card, .course-card');
    elements.forEach(element => {
        const elementPosition = element.getBoundingClientRect().top;
        const screenPosition = window.innerHeight;
        
        if(elementPosition < screenPosition) {
            element.style.opacity = '1';
            element.style.transform = 'translateY(0)';
        }
    });
};

window.addEventListener('scroll', animateOnScroll);

// Form validation
const contactForm = document.querySelector('.contact-form form');
if(contactForm) {
    contactForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        // Basic form validation
        const inputs = this.querySelectorAll('input, textarea');
        let isValid = true;
        
        inputs.forEach(input => {
            if(!input.value.trim()) {
                isValid = false;
                input.classList.add('is-invalid');
            } else {
                input.classList.remove('is-invalid');
            }
        });
        
        if(isValid) {
            alert('ขอบคุณสำหรับข้อความ เราจะติดต่อกลับโดยเร็วที่สุด');
            this.reset();
        }
    });
}

// Course registration modal
const registerButtons = document.querySelectorAll('a[href="#register"]');
registerButtons.forEach(button => {
    button.addEventListener('click', (e) => {
        e.preventDefault();
        alert('ระบบลงทะเบียนจะเปิดให้บริการเร็วๆ นี้');
    });
});