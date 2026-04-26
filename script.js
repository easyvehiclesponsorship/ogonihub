document.addEventListener('DOMContentLoaded', () => {
    
    // --- 1. Hamburger Menu Toggle Logic ---
    const header = document.querySelector('header');
    const menuToggle = document.querySelector('.menu-toggle');
    const navLinks = document.querySelectorAll('.nav-links a');

    if (menuToggle) {
        menuToggle.addEventListener('click', () => {
            // Toggles the 'open' class on the header, which shifts CSS states
            header.classList.toggle('open');
            
            // For accessibility: Update aria-expanded attribute
            const isOpen = header.classList.contains('open');
            menuToggle.setAttribute('aria-expanded', isOpen);
        });
    }

    // Close the menu when a link is clicked
    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            header.classList.remove('open');
            menuToggle.setAttribute('aria-expanded', 'false');
        });
    });

    // --- 2. Pagination Dots Logic (Placeholder Functionality) ---
    const dots = document.querySelectorAll('.pagination-dot');

    if (dots.length > 0) {
        dots.forEach(dot => {
            dot.addEventListener('click', () => {
                // Remove 'active' class from all dots
                dots.forEach(d => d.classList.remove('active'));
                // Add 'active' class to the clicked dot
                dot.classList.add('active');

                // Log the index for demonstration
                const clickedIndex = dot.getAttribute('data-index');
                console.log(`Pagination dot ${clickedIndex} clicked.`);
                // In a real application, this would trigger content/image updates for the carousel.
            });
        });
    }
});
