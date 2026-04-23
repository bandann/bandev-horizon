/**
 * bandev-hero — Native Web Component for slideshow control
 * No dependencies. Works inside Shopify Theme Editor (re-instantiates on shopify:section:load).
 */
class BandevHero extends HTMLElement {
  constructor() {
    super();
    this.currentIndex = 0;
    this.timer = null;
    this._onPrev = this._onPrev.bind(this);
    this._onNext = this._onNext.bind(this);
    this._onDot = this._onDot.bind(this);
    this._onVisibility = this._onVisibility.bind(this);
  }

  connectedCallback() {
    this.slides = Array.from(this.querySelectorAll('.bandev-hero__slide-item'));
    this.dots = Array.from(this.querySelectorAll('.bandev-hero__dot'));
    this.prevBtn = this.querySelector('[data-bandev-prev]');
    this.nextBtn = this.querySelector('[data-bandev-next]');

    if (this.slides.length <= 1) return;

    this.autoplay = this.hasAttribute('data-autoplay');
    this.speed = parseInt(this.getAttribute('data-speed'), 10) || 5000;
    this.loop = this.getAttribute('data-loop') !== 'false';

    this.prevBtn && this.prevBtn.addEventListener('click', this._onPrev);
    this.nextBtn && this.nextBtn.addEventListener('click', this._onNext);
    this.dots.forEach((dot) => dot.addEventListener('click', this._onDot));

    this._show(0);

    if (this.autoplay) {
      document.addEventListener('visibilitychange', this._onVisibility);
      this._start();
    }
  }

  disconnectedCallback() {
    this._stop();
    document.removeEventListener('visibilitychange', this._onVisibility);
    this.prevBtn && this.prevBtn.removeEventListener('click', this._onPrev);
    this.nextBtn && this.nextBtn.removeEventListener('click', this._onNext);
    this.dots.forEach((dot) => dot.removeEventListener('click', this._onDot));
  }

  _show(index) {
    if (!this.slides.length) return;
    const total = this.slides.length;
    this.currentIndex = ((index % total) + total) % total;
    this.slides.forEach((slide, i) => {
      const isActive = i === this.currentIndex;
      slide.setAttribute('aria-hidden', isActive ? 'false' : 'true');
    });
    this.dots.forEach((dot, i) => {
      dot.setAttribute('aria-current', i === this.currentIndex ? 'true' : 'false');
    });
  }

  _onPrev() {
    this._show(this.currentIndex - 1);
    this._restart();
  }

  _onNext() {
    this._show(this.currentIndex + 1);
    this._restart();
  }

  _onDot(event) {
    const idx = parseInt(event.currentTarget.getAttribute('data-index'), 10);
    if (!Number.isNaN(idx)) {
      this._show(idx);
      this._restart();
    }
  }

  _onVisibility() {
    if (document.hidden) {
      this._stop();
    } else if (this.autoplay) {
      this._start();
    }
  }

  _start() {
    this._stop();
    this.timer = setInterval(() => this._show(this.currentIndex + 1), this.speed);
  }

  _stop() {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
  }

  _restart() {
    if (this.autoplay) this._start();
  }
}

if (!customElements.get('bandev-hero')) {
  customElements.define('bandev-hero', BandevHero);
}
