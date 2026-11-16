
const slides = [...document.querySelectorAll('.slide')],
    nav = document.getElementById('nav'),
    navlinks = document.getElementById('navlinks'),
    counter = document.getElementById('counter'),
    progress = document.getElementById('progress');

let current = 0;

slides.forEach((s, i) => {
    const b = document.createElement('button');

    b.textContent =
        String(i + 1).padStart(2, '0') + ' / ' + s.dataset.label;

    b.addEventListener('click', () => {
        go(i);
        nav.classList.remove('open');
    });

    navlinks.append(b);
});

const buttons = [...navlinks.children];

function update(i) {
    current = i;

    counter.textContent =
        String(i + 1).padStart(2, '0') +
        ' / ' +
        String(slides.length).padStart(2, '0');

    progress.style.width =
        ((i + 1) / slides.length * 100) + '%';

    buttons.forEach((b, j) =>
        b.classList.toggle('active', j === i)
    );
}

function go(i) {
    i = Math.max(0, Math.min(slides.length - 1, i));

    slides[i].scrollIntoView({
        behavior: 'smooth',
        block: 'start'
    });

    update(i);
}

document.getElementById('prev').onclick =
    () => go(current - 1);

document.getElementById('next').onclick =
    () => go(current + 1);

document.querySelectorAll('button[data-next]').forEach(
    b => b.onclick = () => go(current + 1)
);

document.getElementById('menuBtn').onclick =
    () => nav.classList.toggle('open');

document.addEventListener('keydown', e => {
    if (e.key === 'Escape') {
        nav.classList.remove('open');
    }

    if (
        ['ArrowRight', 'PageDown'].includes(e.key) &&
        !e.altKey
    ) {
        e.preventDefault();
        go(current + 1);
    }

    if (
        ['ArrowLeft', 'PageUp'].includes(e.key) &&
        !e.altKey
    ) {
        e.preventDefault();
        go(current - 1);
    }
});

const io = new IntersectionObserver(entries => {
    entries.forEach(e => {
        if (e.isIntersecting) {
            update(slides.indexOf(e.target));
        }
    });
}, {
    threshold: 0.45
});

slides.forEach(s => io.observe(s));



const backToTop = document.getElementById("backToTop");

if (backToTop) {
    function updateBackToTop() {
        const firstSlide = slides[0];

        if (!firstSlide) return;

        const firstSlideBottom =
            firstSlide.getBoundingClientRect().bottom;

        backToTop.classList.toggle(
            "visible",
            firstSlideBottom < window.innerHeight * 0.5
        );
    }

    backToTop.addEventListener("click", () => {
        go(0);
        nav.classList.remove("open");
    });

    window.addEventListener("scroll", updateBackToTop, {
        passive: true
    });

    updateBackToTop();
}



/* Плавна поява контенту при скролі */

function initScrollReveal() {
    const elements = document.querySelectorAll(`
        .cover-content > *,
        .section-head > *,
        .stack article,
        .tiles article,
        .rows > div,
        .strip,
        .pricing article,
        .footnote,
        .tablewrap,
        .closing-card,
        .closing-bottom > *
    `);

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        return;
    }

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('is-visible');
                observer.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.08,
        rootMargin: '0px 0px -25px 0px'
    });

    elements.forEach((element) => {
        const parent = element.parentElement;

        // Послідовна поява карток у межах одного блоку
        if (
            parent.matches('.stack, .tiles, .rows, .pricing')
        ) {
            const siblings = [...parent.children];
            const index = siblings.indexOf(element);

            element.style.setProperty(
                '--reveal-delay',
                `${Math.min(index * 90, 450)}ms`
            );
        }

        element.classList.add('reveal');
        observer.observe(element);
    });
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initScrollReveal);
} else {
    initScrollReveal();
}



/* Горизонтальний паралакс напису SKIN DESIGN STUDIO */

const bigmark = document.querySelector('.bigmark');
const coverSlide = document.querySelector('.slide.cover');

if (bigmark && coverSlide) {
    let ticking = false;

    function updateBigmark() {
        const rect = coverSlide.getBoundingClientRect();
        const viewportHeight = window.innerHeight;

        // 0 — початок скролу, 1 — перший слайд прокручений
        const progress = Math.max(
            0,
            Math.min(1, -rect.top / Math.max(rect.height, 1))
        );

        // Напис рухається вліво на 280px
        const shift = -280 * progress;

        bigmark.style.setProperty('--mark-shift', `${shift}px`);

        ticking = false;
    }

    function requestBigmarkUpdate() {
        if (!ticking) {
            requestAnimationFrame(updateBigmark);
            ticking = true;
        }
    }

    if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        window.addEventListener('scroll', requestBigmarkUpdate, {
            passive: true
        });

        // Якщо прокручується сам контейнер презентації
        document.getElementById('deck')?.addEventListener(
            'scroll',
            requestBigmarkUpdate,
            { passive: true }
        );

        updateBigmark();
    }
}



document.querySelectorAll('.skinDots').forEach(skinDots => {
    const NS = 'http://www.w3.org/2000/svg';

    const rings = [
        { radius: 270, count: 42, size: 5 },
        { radius: 225, count: 36, size: 4 },
        { radius: 180, count: 30, size: 3 },
        { radius: 135, count: 24, size: 2 }
    ];

    rings.forEach((ring, ringIndex) => {
        const group = document.createElementNS(NS, 'g');

        group.setAttribute(
            'class',
            `skin-dot-ring ${ringIndex % 2 ? 'reverse' : ''}`
        );

        ring.count && Array.from({ length: ring.count }).forEach((_, i) => {
            const angle = (i / ring.count) * Math.PI * 2;

            const x = 300 + Math.cos(angle) * ring.radius;
            const y = 300 + Math.sin(angle) * ring.radius;

            const dot = document.createElementNS(NS, 'circle');

            dot.setAttribute('cx', x);
            dot.setAttribute('cy', y);
            dot.setAttribute('r', ring.size);
            dot.setAttribute('class', 'skin-dot');

            group.appendChild(dot);
        });

        skinDots.appendChild(group);
    });
});


document.querySelectorAll('.tablewrap table').forEach(table => {

    const headers = [...table.querySelectorAll('thead th')]
        .map(th => th.textContent.trim());

    table.querySelectorAll('tbody tr').forEach(row => {

        row.querySelectorAll('td').forEach((cell, index) => {
            cell.setAttribute(
                'data-label',
                headers[index] || ''
            );
        });

    });

});