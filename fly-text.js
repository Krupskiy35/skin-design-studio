
/* GSAP fly-away animation — H1 + H2 */
(() => {
    'use strict';

    if (!window.gsap || !window.ScrollTrigger) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    gsap.registerPlugin(ScrollTrigger);

    const titles = document.querySelectorAll(
        '.slide.cover h1, .slide.content-slide h2'
    );

    const deck = document.getElementById('deck');
    const isDeckScroller = deck &&
        getComputedStyle(deck).overflowY !== 'visible' &&
        deck.scrollHeight > deck.clientHeight + 10;

    const scroller = isDeckScroller ? deck : window;

    function random(i, offset) {
        const n = Math.sin((i + 1) * 127.1 + offset * 311.7) * 43758.5453;
        return n - Math.floor(n);
    }

    titles.forEach((element) => {

        // Зберігаємо початковий текст та HTML-форматування
        const originalText = element.textContent
            .replace(/\s+/g, ' ')
            .trim();

        const walker = document.createTreeWalker(
            element,
            NodeFilter.SHOW_TEXT
        );

        const nodes = [];
        while (walker.nextNode()) nodes.push(walker.currentNode);

        const chars = [];

        nodes.forEach(node => {
            const fragment = document.createDocumentFragment();

            const parts = (node.nodeValue || '').split(/(\s+)/);

            parts.forEach(part => {
                if (!part) return;

                if (/^\s+$/.test(part)) {
                    fragment.appendChild(
                        document.createTextNode(part)
                    );
                    return;
                }

                const word = document.createElement('span');
                word.className = 'fly-word';

                for (const letter of Array.from(part)) {
                    const span = document.createElement('span');

                    span.className = 'fly-char';
                    span.textContent = letter;
                    span.setAttribute('aria-hidden', 'true');

                    word.appendChild(span);
                    chars.push(span);
                }

                fragment.appendChild(word);
            });

            node.parentNode.replaceChild(fragment, node);
        });

        element.setAttribute('aria-label', originalText);

        const number = (key, fallback) => {
            const value = Number(element.dataset[key]);
            return Number.isFinite(value) ? value : fallback;
        };

        const isHero = !!element.closest('.slide.cover');

        const windAngle = number('windAngle', 25) * Math.PI / 180;

        const strength = number('windStrength', 320);
        const scatter = number('scatter', 120);
        const maxRotation = number('maxRotation', 280);
        const depth = number('depth', 100);
        const stagger = Math.max(
            0,
            Math.min(0.85, number('stagger', 0.5))
        );

        const timeline = gsap.timeline({
            paused: true,
            defaults: { ease: 'power2.inOut' }
        });

        chars.forEach((char, i) => {
            const theta = random(i, 1) * Math.PI * 2;
            const radius = random(i, 2) * scatter;

            const x = Math.cos(windAngle) * strength +
                Math.cos(theta) * radius;

            const y = -Math.sin(windAngle) * strength +
                Math.sin(theta) * radius;

            const start = random(i, 3) * stagger;

            timeline.fromTo(
                char,
                {
                    x: 0,
                    y: 0,
                    z: 0,
                    rotationX: 0,
                    rotationY: 0,
                    rotationZ: 0,
                    opacity: 1
                },
                {
                    x,
                    y,
                    z: (random(i, 4) * 2 - 1) * depth,
                    rotationX: (random(i, 5) * 2 - 1) * maxRotation,
                    rotationY: (random(i, 6) * 2 - 1) * maxRotation,
                    rotationZ: (random(i, 7) * 2 - 1) *
                        maxRotation * 0.35,
                    opacity: 0,
                    duration: 1 - stagger,
                    immediateRender: false
                },
                start
            );
        });

        ScrollTrigger.create({
            trigger: isHero ? element.closest('.slide.cover') : element,
            scroller: scroller,

            start: isHero ? 'top top' : 'top 35%',
            end: isHero ? '+=180' : '+=180',

            scrub: 0.25,
            animation: timeline,
            invalidateOnRefresh: true
        });
    });

    if (document.fonts && document.fonts.ready) {
        document.fonts.ready.then(() => ScrollTrigger.refresh());
    }
})();
