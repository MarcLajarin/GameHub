document.addEventListener('DOMContentLoaded', () => {
    // Canvas or WebGL Game logic might be here, but for now it's just gallery

    // --- DIFFICULTY FILTER (Kept from previous logic if valid) ---
    const difficultySelect = document.getElementById('difficulty-select');
    const gameCards = document.querySelectorAll('.game-card');

    // Check if difficulty select exists (it was missing in recent index.html, but checking just in case)
    if (difficultySelect) {
        const savedDifficulty = localStorage.getItem('arcadeDifficulty') || 'standard';
        difficultySelect.value = savedDifficulty;
        applyDifficulty(savedDifficulty);

        difficultySelect.addEventListener('change', (e) => {
            const diff = e.target.value;
            localStorage.setItem('arcadeDifficulty', diff);
            applyDifficulty(diff);
        });
    }

    function applyDifficulty(difficulty) {
        gameCards.forEach(card => {
            const isClassic = card.classList.contains('blackjack-slot') || card.classList.contains('solitaire-slot');
            if (difficulty === 'standard') {
                card.style.display = 'flex';
            } else {
                if (isClassic) {
                    card.style.display = 'none';
                } else {
                    card.style.display = 'flex';
                }
            }
        });
    }

    // --- CAROUSEL LOGIC ---
    const track = document.getElementById('gallery-track');
    const prevBtn = document.getElementById('prevBtn');
    const nextBtn = document.getElementById('nextBtn');
    const dots = document.querySelectorAll('.dot');

    if (track && prevBtn && nextBtn) {
        let currentSlide = 0;
        const slideCount = track.children.length; // Should be 2 slides currently

        function updateCarousel() {
            const translateX = -(currentSlide * 100);
            track.style.transform = `translateX(${translateX}%)`;

            // Update dots
            dots.forEach((dot, index) => {
                if (index === currentSlide) {
                    dot.classList.add('active');
                } else {
                    dot.classList.remove('active');
                }
            });
        }

        nextBtn.addEventListener('click', () => {
            if (currentSlide < slideCount - 1) {
                currentSlide++;
            } else {
                currentSlide = 0; // Loop back to start
            }
            updateCarousel();
        });

        prevBtn.addEventListener('click', () => {
            if (currentSlide > 0) {
                currentSlide--;
            } else {
                currentSlide = slideCount - 1; // Loop to end
            }
            updateCarousel();
        });

        // Handle Dot Clicks
        dots.forEach((dot, index) => {
            dot.addEventListener('click', () => {
                currentSlide = index;
                updateCarousel();
            });
        });
    }
});
