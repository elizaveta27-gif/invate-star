window.initStarryEffects = function initStarryEffects() {
    const canvas = document.getElementById('stars');
    if (!canvas || canvas.dataset.initialized === 'true') return;

    const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (motion.matches) {
        document.querySelectorAll('.reveal').forEach(el => el.classList.add('vis'));
        return;
    }
    canvas.dataset.initialized = 'true';
    const context = canvas.getContext('2d');
    let stars = [];
    let shootingStars = [];

    function resize() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        const count = Math.floor((canvas.width * canvas.height) / 3800);
        stars = Array.from({ length: count }, () => ({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,
            radius: Math.random() * 1.3 + 0.2,
            alpha: Math.random(),
            speed: Math.random() * 0.007 + 0.003,
            direction: Math.random() > 0.5 ? 1 : -1,
        }));
    }

    function spawnShootingStar() {
        shootingStars.push({
            x: Math.random() * canvas.width * 0.75,
            y: Math.random() * canvas.height * 0.45,
            length: Math.random() * 140 + 90,
            speed: Math.random() * 9 + 7,
            angle: Math.PI / 5 + (Math.random() - 0.5) * 0.4,
            alpha: 1,
            decay: 0.016 + Math.random() * 0.01,
        });
    }

    function draw() {
        if (motion.matches) { context.clearRect(0, 0, canvas.width, canvas.height); return; }
        context.clearRect(0, 0, canvas.width, canvas.height);
        for (const star of stars) {
            star.alpha += star.speed * star.direction;
            if (star.alpha >= 1 || star.alpha <= 0) star.direction *= -1;
            context.beginPath();
            context.arc(star.x, star.y, star.radius, 0, Math.PI * 2);
            context.fillStyle = `rgba(255,248,220,${star.alpha})`;
            context.fill();
        }
        shootingStars = shootingStars.filter(star => {
            star.alpha -= star.decay;
            if (star.alpha <= 0) return false;
            const endX = star.x - Math.cos(star.angle) * star.length;
            const endY = star.y - Math.sin(star.angle) * star.length;
            const gradient = context.createLinearGradient(star.x, star.y, endX, endY);
            gradient.addColorStop(0, `rgba(255,255,255,${star.alpha})`);
            gradient.addColorStop(1, 'rgba(212,175,55,0)');
            context.beginPath();
            context.moveTo(star.x, star.y);
            context.lineTo(endX, endY);
            context.strokeStyle = gradient;
            context.lineWidth = 1.8;
            context.stroke();
            star.x += Math.cos(star.angle) * star.speed;
            star.y += Math.sin(star.angle) * star.speed;
            return true;
        });
        requestAnimationFrame(draw);
    }

    resize();
    draw();
    window.addEventListener('resize', resize, { once: true });
    setTimeout(function schedule() {
        if (motion.matches) return;
        spawnShootingStar();
        setTimeout(schedule, 3500 + Math.random() * 5000);
    }, 1500);

    const observer = new IntersectionObserver(entries => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('vis');
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.15 });
    document.querySelectorAll('.reveal').forEach(element => observer.observe(element));

    document.querySelector('.scroll-hint')?.addEventListener('click', () => {
        document.getElementById('countdown')?.scrollIntoView({ behavior: 'smooth' });
    });
};

// Standalone package: retain the decorative motion and make the RSVP form
// useful without the Vibe application runtime.
window.addEventListener('DOMContentLoaded', () => {
    window.initStarryEffects();
    document.querySelector('[data-editor-only]')?.remove();

    const weddingDate = document.querySelector('[data-block-id="wedding-date"]')?.textContent?.trim();
    const target = weddingDate ? new Date(`${weddingDate}T00:00:00`) : null;
    const cells = {
        days: document.getElementById('days'),
        hours: document.getElementById('hours'),
        minutes: document.getElementById('minutes'),
        seconds: document.getElementById('seconds'),
    };
    const updateCountdown = () => {
        if (!target || Number.isNaN(target.getTime())) return;
        const distance = Math.max(0, target.getTime() - Date.now());
        const seconds = Math.floor(distance / 1000);
        const values = [
            Math.floor(seconds / 86400),
            Math.floor(seconds % 86400 / 3600),
            Math.floor(seconds % 3600 / 60),
            seconds % 60,
        ];
        Object.values(cells).forEach((cell, index) => {
            if (cell) cell.textContent = String(values[index]).padStart(2, '0');
        });
    };
    updateCountdown();
    window.setInterval(updateCountdown, 1000);

    document.getElementById('rsvpForm')?.addEventListener('submit', (event) => {
        event.preventDefault();
        const message = document.getElementById('formMessage');
        event.currentTarget.hidden = true;
        if (message) message.innerHTML = '<p style="margin-top:20px;color:#f5f0e8;font-size:20px;font-style:italic">Спасибо! Очень ждём встречи с вами.</p>';
    });
});
