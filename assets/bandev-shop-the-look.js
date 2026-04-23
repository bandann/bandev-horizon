/**
 * bandev-shop-the-look — Native Web Component
 * Sync between pins and product cards: hover/click highlights both.
 */
class BandevShopTheLook extends HTMLElement {
  constructor() {
    super();
    this._onPinClick = this._onPinClick.bind(this);
    this._onPinEnter = this._onPinEnter.bind(this);
    this._onPinLeave = this._onPinLeave.bind(this);
    this._onProductEnter = this._onProductEnter.bind(this);
    this._onProductLeave = this._onProductLeave.bind(this);
    this._onProductClick = this._onProductClick.bind(this);
    this._onDocumentClick = this._onDocumentClick.bind(this);
  }

  connectedCallback() {
    this.pinWrappers = Array.from(this.querySelectorAll('[data-pin-wrapper]'));
    this.products = Array.from(this.querySelectorAll('[data-product-card]'));

    this.pinWrappers.forEach((wrapper) => {
      const pin = wrapper.querySelector('[data-pin]');
      if (!pin) return;
      pin.addEventListener('click', this._onPinClick);
      wrapper.addEventListener('mouseenter', this._onPinEnter);
      wrapper.addEventListener('mouseleave', this._onPinLeave);
    });

    this.products.forEach((card) => {
      card.addEventListener('mouseenter', this._onProductEnter);
      card.addEventListener('mouseleave', this._onProductLeave);
      card.addEventListener('click', this._onProductClick);
    });

    document.addEventListener('click', this._onDocumentClick);
  }

  disconnectedCallback() {
    this.pinWrappers.forEach((wrapper) => {
      const pin = wrapper.querySelector('[data-pin]');
      if (pin) pin.removeEventListener('click', this._onPinClick);
      wrapper.removeEventListener('mouseenter', this._onPinEnter);
      wrapper.removeEventListener('mouseleave', this._onPinLeave);
    });
    this.products.forEach((card) => {
      card.removeEventListener('mouseenter', this._onProductEnter);
      card.removeEventListener('mouseleave', this._onProductLeave);
      card.removeEventListener('click', this._onProductClick);
    });
    document.removeEventListener('click', this._onDocumentClick);
  }

  _getId(el) {
    return el.getAttribute('data-pin-id') || el.getAttribute('data-product-id');
  }

  _setActive(id, persistent) {
    this._clearActive();
    if (!id) return;
    const wrapper = this.querySelector(`[data-pin-wrapper][data-pin-id="${id}"]`);
    const card = this.querySelector(`[data-product-card][data-product-id="${id}"]`);
    if (wrapper) {
      const pin = wrapper.querySelector('[data-pin]');
      const popover = wrapper.querySelector('[data-popover]');
      if (pin) pin.classList.add('is-active');
      if (popover) popover.setAttribute('aria-hidden', 'false');
      if (pin && persistent) pin.setAttribute('aria-expanded', 'true');
    }
    if (card) {
      card.classList.add('is-active');
      if (persistent && card.scrollIntoView) {
        card.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }
    }
    this._activeId = persistent ? id : null;
  }

  _clearActive() {
    this.querySelectorAll('.is-active').forEach((el) => el.classList.remove('is-active'));
    this.querySelectorAll('[data-popover]').forEach((p) => p.setAttribute('aria-hidden', 'true'));
    this.querySelectorAll('[data-pin][aria-expanded="true"]').forEach((p) => p.setAttribute('aria-expanded', 'false'));
  }

  _onPinClick(event) {
    event.stopPropagation();
    const wrapper = event.currentTarget.closest('[data-pin-wrapper]');
    const id = this._getId(wrapper);
    if (this._activeId === id) {
      this._clearActive();
      this._activeId = null;
    } else {
      this._setActive(id, true);
    }
  }

  _onPinEnter(event) {
    if (this._activeId) return;
    const id = this._getId(event.currentTarget);
    this._setActive(id, false);
  }

  _onPinLeave() {
    if (this._activeId) return;
    this._clearActive();
  }

  _onProductEnter(event) {
    if (this._activeId) return;
    const id = this._getId(event.currentTarget);
    this._setActive(id, false);
  }

  _onProductLeave() {
    if (this._activeId) return;
    this._clearActive();
  }

  _onProductClick(event) {
    // Allow normal navigation if it's a link
    if (event.currentTarget.tagName === 'A') return;
    const id = this._getId(event.currentTarget);
    this._setActive(id, true);
  }

  _onDocumentClick(event) {
    if (!this.contains(event.target) && this._activeId) {
      this._clearActive();
      this._activeId = null;
    }
  }
}

if (!customElements.get('bandev-shop-the-look')) {
  customElements.define('bandev-shop-the-look', BandevShopTheLook);
}
