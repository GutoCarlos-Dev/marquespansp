// Mobile Menu Toggle Functionality
document.addEventListener('DOMContentLoaded', function() {
    // Create mobile menu toggle button
    const nav = document.querySelector('header nav');
    const menu = document.getElementById('menu');

    if (nav && menu) {
        // Create toggle button
        const toggleButton = document.createElement('button');
        toggleButton.className = 'mobile-menu-toggle';
        toggleButton.setAttribute('aria-label', 'Toggle menu');
        toggleButton.innerHTML = '☰';

        // Insert toggle button before the menu
        nav.insertBefore(toggleButton, menu);

        // Add click event listener
        toggleButton.addEventListener('click', function() {
            const isOpen = menu.classList.contains('mobile-open');

            if (isOpen) {
                // Close menu
                menu.classList.remove('mobile-open');
                toggleButton.innerHTML = '☰';
                toggleButton.classList.remove('mobile-open');
            } else {
                // Open menu
                menu.classList.add('mobile-open');
                toggleButton.innerHTML = '✕';
                toggleButton.classList.add('mobile-open');
            }
        });

        // Close menu when clicking outside
        document.addEventListener('click', function(event) {
            if (!nav.contains(event.target) && menu.classList.contains('mobile-open')) {
                menu.classList.remove('mobile-open');
                toggleButton.innerHTML = '☰';
                toggleButton.classList.remove('mobile-open');
            }
        });

        // Close menu when menu item is clicked
        const menuButtons = menu.querySelectorAll('button');
        menuButtons.forEach(button => {
            button.addEventListener('click', function() {
                menu.classList.remove('mobile-open');
                toggleButton.innerHTML = '☰';
                toggleButton.classList.remove('mobile-open');
            });
        });
    }

    // Add data-label attributes to table cells for mobile card layout
    function addTableDataLabels() {
        const tables = document.querySelectorAll('table');

        tables.forEach(table => {
            const headers = table.querySelectorAll('thead th');
            const rows = table.querySelectorAll('tbody tr');

            rows.forEach(row => {
                const cells = row.querySelectorAll('td');
                cells.forEach((cell, index) => {
                    if (headers[index]) {
                        const headerText = headers[index].textContent.trim();
                        cell.setAttribute('data-label', headerText);
                    }
                });
            });
        });
    }

    // Call the function to add data labels
    addTableDataLabels();

    // Handle window resize to reset mobile menu state
    window.addEventListener('resize', function() {
        if (window.innerWidth > 768 && menu) {
            menu.classList.remove('mobile-open');
            const toggleButton = document.querySelector('.mobile-menu-toggle');
            if (toggleButton) {
                toggleButton.innerHTML = '☰';
                toggleButton.classList.remove('mobile-open');
            }
        }
    });

    // Improve touch interactions
    const touchElements = document.querySelectorAll('button, .btn, input[type="button"], input[type="submit"]');
    touchElements.forEach(element => {
        element.addEventListener('touchstart', function() {
            this.style.transform = 'scale(0.98)';
        }, { passive: true });

        element.addEventListener('touchend', function() {
            this.style.transform = 'scale(1)';
        }, { passive: true });
    });

    // Add viewport meta tag if missing (for better mobile experience)
    const viewportMeta = document.querySelector('meta[name="viewport"]');
    if (!viewportMeta) {
        const meta = document.createElement('meta');
        meta.name = 'viewport';
        meta.content = 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no';
        document.head.appendChild(meta);
    }
});
