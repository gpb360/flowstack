// ============================================================================
// HTML RENDERER — Converts builder JSON blocks into production-quality HTML
// Handles all 30 block types, responsive breakpoints, SEO meta, sitemap.
// ============================================================================

import type { Block, Page, Site, BlockStyles } from '../types';

// ============================================================================
// CSS HELPERS
// ============================================================================

function stylesToCSS(styles: BlockStyles | undefined): string {
  if (!styles) return '';
  return Object.entries(styles)
    .filter(([, value]) => value !== undefined && value !== null && value !== '')
    .map(([key, value]) => {
      const cssKey = key.replace(/[A-Z]/g, (letter) => `-${letter.toLowerCase()}`);
      return `${cssKey}: ${value}`;
    })
    .join('; ');
}

function styleAttr(styles: BlockStyles | undefined): string {
  const css = stylesToCSS(styles);
  return css ? ` style="${escapeAttr(css)}"` : '';
}

function escapeHTML(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function escapeAttr(str: string): string {
  return str.replace(/"/g, '&quot;');
}

// ============================================================================
// BLOCK RENDERERS
// ============================================================================

function renderChildren(children: Block[] | undefined): string {
  if (!children || children.length === 0) return '';
  return children.map(renderBlock).join('\n');
}

function renderBlock(block: Block): string {
  const desktopStyles = block.styles?.desktop;
  const sa = styleAttr(desktopStyles);
  const id = block.id ? ` id="block-${escapeAttr(block.id)}"` : '';

  if (block.visible === false) return '';

  switch (block.type) {
    // ====== LAYOUT ======
    case 'section':
      return `<section${id}${sa}>\n${renderChildren(block.children)}\n</section>`;

    case 'container':
      return `<div class="fs-container"${id}${sa}>\n${renderChildren(block.children)}\n</div>`;

    case 'columns': {
      const cols = block.props.columns || 2;
      return `<div class="fs-columns fs-columns-${cols}"${id}${sa}>\n${renderChildren(block.children)}\n</div>`;
    }

    case 'divider': {
      const style = block.props.style || 'solid';
      const color = block.props.color || '#e5e7eb';
      const thickness = block.props.thickness || '1px';
      return `<hr${id} style="border: none; border-top: ${thickness} ${style} ${escapeAttr(color)}; ${stylesToCSS(desktopStyles)}" />`;
    }

    case 'spacer':
      return `<div class="fs-spacer"${id}${sa}></div>`;

    // ====== CONTENT ======
    case 'heading': {
      const level = Math.min(Math.max(block.props.level || 2, 1), 6);
      const content = block.props.content || '';
      return `<h${level}${id}${sa}>${content}</h${level}>`;
    }

    case 'text':
      return `<p${id}${sa}>${block.props.content || ''}</p>`;

    case 'image': {
      const src = escapeAttr(block.props.src || '');
      const alt = escapeAttr(block.props.alt || '');
      const img = `<img src="${src}" alt="${alt}"${sa} loading="lazy" />`;
      if (block.props.link) {
        const target = block.props.openInNewTab ? ' target="_blank" rel="noopener noreferrer"' : '';
        return `<a href="${escapeAttr(block.props.link)}"${target}>${img}</a>`;
      }
      return img;
    }

    case 'video': {
      if (block.props.type === 'youtube' && block.props.videoId) {
        const autoplay = block.props.autoplay ? '&autoplay=1' : '';
        return `<div class="fs-video"${id}${sa}><iframe src="https://www.youtube.com/embed/${escapeAttr(block.props.videoId)}?rel=0${autoplay}" frameborder="0" allowfullscreen style="width:100%;aspect-ratio:${block.props.aspectRatio || '16/9'}"></iframe></div>`;
      }
      if (block.props.type === 'vimeo' && block.props.videoId) {
        return `<div class="fs-video"${id}${sa}><iframe src="https://player.vimeo.com/video/${escapeAttr(block.props.videoId)}" frameborder="0" allowfullscreen style="width:100%;aspect-ratio:${block.props.aspectRatio || '16/9'}"></iframe></div>`;
      }
      if (block.props.src) {
        const autoplay = block.props.autoplay ? ' autoplay' : '';
        const loop = block.props.loop ? ' loop' : '';
        const controls = block.props.controls !== false ? ' controls' : '';
        return `<video src="${escapeAttr(block.props.src)}"${autoplay}${loop}${controls}${sa}></video>`;
      }
      return `<div class="fs-video-placeholder"${id}${sa}>Video</div>`;
    }

    case 'button': {
      const href = escapeAttr(block.props.link || '#');
      const target = block.props.openInNewTab ? ' target="_blank" rel="noopener noreferrer"' : '';
      const text = escapeHTML(block.props.text || 'Button');
      return `<a href="${href}"${target} class="fs-btn fs-btn-${block.props.variant || 'primary'} fs-btn-${block.props.size || 'md'}"${id}${sa}>${text}</a>`;
    }

    case 'list': {
      const tag = block.props.type === 'number' ? 'ol' : 'ul';
      const items = (block.props.items || []) as string[];
      const lis = items.map((item: string) => `  <li>${escapeHTML(item)}</li>`).join('\n');
      return `<${tag}${id}${sa}>\n${lis}\n</${tag}>`;
    }

    case 'quote': {
      const cite = block.props.citeUrl ? ` cite="${escapeAttr(block.props.citeUrl)}"` : '';
      const attribution = block.props.attribution
        ? `\n<footer class="fs-quote-attribution">— ${escapeHTML(block.props.attribution)}</footer>`
        : '';
      return `<blockquote${id}${sa}${cite}>\n  <p>${escapeHTML(block.props.content || '')}</p>${attribution}\n</blockquote>`;
    }

    case 'code':
      return `<pre${id}${sa}><code class="language-${escapeAttr(block.props.language || 'text')}">${escapeHTML(block.props.code || '')}</code></pre>`;

    // ====== MEDIA ======
    case 'gallery': {
      const images = (block.props.images || []) as Array<{ src: string; alt?: string }>;
      const cols = block.props.columns || 4;
      const gap = block.props.gap || '16px';
      const imgHTML = images
        .map((img) => `  <div class="fs-gallery-item"><img src="${escapeAttr(img.src)}" alt="${escapeAttr(img.alt || '')}" loading="lazy" /></div>`)
        .join('\n');
      return `<div class="fs-gallery fs-gallery-${cols}"${id} style="display:grid;grid-template-columns:repeat(${cols},1fr);gap:${gap};${stylesToCSS(desktopStyles)}">\n${imgHTML}\n</div>`;
    }

    case 'slider': {
      const images = (block.props.images || []) as Array<{ src: string; alt?: string }>;
      const slides = images
        .map((img, i) => `  <div class="fs-slide${i === 0 ? ' fs-slide-active' : ''}" style="display:${i === 0 ? 'block' : 'none'}"><img src="${escapeAttr(img.src)}" alt="${escapeAttr(img.alt || '')}" style="width:100%;height:100%;object-fit:cover" /></div>`)
        .join('\n');
      return `<div class="fs-slider"${id}${sa}>\n${slides}\n</div>`;
    }

    case 'fileDownload': {
      const url = escapeAttr(block.props.fileUrl || '#');
      const name = escapeHTML(block.props.fileName || 'File');
      const size = block.props.fileSize ? ` <span class="fs-file-size">(${escapeHTML(block.props.fileSize)})</span>` : '';
      const btnText = escapeHTML(block.props.buttonText || 'Download');
      return `<div class="fs-file-download"${id}${sa}>\n  <span class="fs-file-name">${name}${size}</span>\n  <a href="${url}" download class="fs-btn fs-btn-secondary fs-btn-sm">${btnText}</a>\n</div>`;
    }

    case 'socialIcons': {
      const platforms = (block.props.platforms || []) as Array<{ name: string; url: string }>;
      const size = block.props.size || 'md';
      const links = platforms
        .map((p) => `  <a href="${escapeAttr(p.url)}" class="fs-social-icon fs-social-${size}" target="_blank" rel="noopener noreferrer" aria-label="${escapeAttr(p.name)}">${escapeHTML(p.name)}</a>`)
        .join('\n');
      return `<div class="fs-social-icons"${id}${sa}>\n${links}\n</div>`;
    }

    // ====== FORM ======
    case 'form': {
      const submitText = escapeHTML(block.props.submitButtonText || 'Submit');
      return `<form class="fs-form"${id}${sa}>\n${renderChildren(block.children)}\n  <button type="submit" class="fs-btn fs-btn-primary fs-btn-md">${submitText}</button>\n</form>`;
    }

    case 'input': {
      const name = escapeAttr(block.props.name || 'field');
      const type = escapeAttr(block.props.type || 'text');
      const label = block.props.label ? `<label for="input-${name}" class="fs-label">${escapeHTML(block.props.label)}</label>` : '';
      const required = block.props.required ? ' required' : '';
      const placeholder = block.props.placeholder ? ` placeholder="${escapeAttr(block.props.placeholder)}"` : '';
      return `<div class="fs-field"${id}${sa}>\n  ${label}\n  <input type="${type}" id="input-${name}" name="${name}"${placeholder}${required} class="fs-input" />\n</div>`;
    }

    case 'textarea': {
      const name = escapeAttr(block.props.name || 'message');
      const label = block.props.label ? `<label for="ta-${name}" class="fs-label">${escapeHTML(block.props.label)}</label>` : '';
      const required = block.props.required ? ' required' : '';
      const placeholder = block.props.placeholder ? ` placeholder="${escapeAttr(block.props.placeholder)}"` : '';
      const rows = block.props.rows || 4;
      return `<div class="fs-field"${id}${sa}>\n  ${label}\n  <textarea id="ta-${name}" name="${name}" rows="${rows}"${placeholder}${required} class="fs-textarea"></textarea>\n</div>`;
    }

    case 'select': {
      const name = escapeAttr(block.props.name || 'select');
      const label = block.props.label ? `<label for="sel-${name}" class="fs-label">${escapeHTML(block.props.label)}</label>` : '';
      const required = block.props.required ? ' required' : '';
      const options = (block.props.options || []) as Array<{ value: string; label: string }>;
      const placeholder = block.props.placeholder ? `\n    <option value="" disabled selected>${escapeHTML(block.props.placeholder)}</option>` : '';
      const opts = options.map((o) => `    <option value="${escapeAttr(o.value)}">${escapeHTML(o.label)}</option>`).join('\n');
      return `<div class="fs-field"${id}${sa}>\n  ${label}\n  <select id="sel-${name}" name="${name}"${required} class="fs-select">${placeholder}\n${opts}\n  </select>\n</div>`;
    }

    case 'checkbox': {
      const name = escapeAttr(block.props.name || 'checkbox');
      const inputType = block.props.type === 'radio' ? 'radio' : 'checkbox';
      const label = block.props.label ? `<legend class="fs-label">${escapeHTML(block.props.label)}</legend>` : '';
      const options = (block.props.options || []) as Array<{ value: string; label: string }>;
      const opts = options
        .map((o, i) => `  <label class="fs-checkbox-label"><input type="${inputType}" name="${name}" value="${escapeAttr(o.value)}"${i === 0 && block.props.required ? ' required' : ''} /> ${escapeHTML(o.label)}</label>`)
        .join('\n');
      return `<fieldset class="fs-fieldset"${id}${sa}>\n  ${label}\n${opts}\n</fieldset>`;
    }

    // ====== ADVANCED ======
    case 'countdown': {
      const target = escapeAttr(block.props.targetDate || '');
      const msg = escapeAttr(block.props.onCompleteMessage || 'Done!');
      return `<div class="fs-countdown" data-target="${target}" data-complete-msg="${msg}"${id}${sa}>\n  <div class="fs-cd-unit"><span class="fs-cd-num" data-days>00</span><span class="fs-cd-label">Days</span></div>\n  <div class="fs-cd-unit"><span class="fs-cd-num" data-hours>00</span><span class="fs-cd-label">Hours</span></div>\n  <div class="fs-cd-unit"><span class="fs-cd-num" data-minutes>00</span><span class="fs-cd-label">Min</span></div>\n  <div class="fs-cd-unit"><span class="fs-cd-num" data-seconds>00</span><span class="fs-cd-label">Sec</span></div>\n</div>`;
    }

    case 'progressBar': {
      const pct = Math.min(Math.max(block.props.progress || 0, 0), 100);
      const color = block.props.color || '#3b82f6';
      const height = block.props.height || '8px';
      const label = block.props.showLabel ? `<span class="fs-progress-label">${pct}%</span>` : '';
      return `<div class="fs-progress"${id}${sa}>\n  ${label}\n  <div class="fs-progress-track" style="height:${height};background:#e5e7eb;border-radius:4px;overflow:hidden"><div class="fs-progress-bar" style="width:${pct}%;height:100%;background:${escapeAttr(color)};border-radius:4px"></div></div>\n</div>`;
    }

    case 'testimonial': {
      const stars = block.props.rating
        ? `<div class="fs-stars">${'★'.repeat(block.props.rating)}${'☆'.repeat(5 - block.props.rating)}</div>`
        : '';
      const avatar = block.props.image ? `<img src="${escapeAttr(block.props.image)}" alt="${escapeAttr(block.props.author || '')}" class="fs-testimonial-avatar" />` : '';
      return `<div class="fs-testimonial"${id}${sa}>\n  ${stars}\n  <blockquote class="fs-testimonial-quote">"${escapeHTML(block.props.quote || '')}"</blockquote>\n  <div class="fs-testimonial-author">\n    ${avatar}\n    <div><strong>${escapeHTML(block.props.author || '')}</strong>${block.props.role ? `<br><span class="fs-testimonial-role">${escapeHTML(block.props.role)}${block.props.company ? `, ${escapeHTML(block.props.company)}` : ''}</span>` : ''}</div>\n  </div>\n</div>`;
    }

    case 'pricing': {
      const plans = (block.props.plans || []) as Array<{
        name: string; price: string; period?: string; features: string[];
        highlighted?: boolean; buttonText?: string; buttonLink?: string;
      }>;
      const cards = plans
        .map((plan) => {
          const featureList = plan.features.map((f) => `      <li>${escapeHTML(f)}</li>`).join('\n');
          const hl = plan.highlighted ? ' fs-pricing-highlighted' : '';
          return `  <div class="fs-pricing-card${hl}">\n    <h3 class="fs-pricing-name">${escapeHTML(plan.name)}</h3>\n    <div class="fs-pricing-price">${escapeHTML(plan.price)}<span class="fs-pricing-period">${escapeHTML(plan.period || '')}</span></div>\n    <ul class="fs-pricing-features">\n${featureList}\n    </ul>\n    <a href="${escapeAttr(plan.buttonLink || '#')}" class="fs-btn fs-btn-primary fs-btn-md">${escapeHTML(plan.buttonText || 'Get Started')}</a>\n  </div>`;
        })
        .join('\n');
      return `<div class="fs-pricing"${id}${sa}>\n${cards}\n</div>`;
    }

    case 'faq': {
      const items = (block.props.items || []) as Array<{ question: string; answer: string; open?: boolean }>;
      const faqs = items
        .map((item) => {
          const open = item.open ? ' open' : '';
          return `  <details class="fs-faq-item"${open}>\n    <summary class="fs-faq-question">${escapeHTML(item.question)}</summary>\n    <div class="fs-faq-answer">${escapeHTML(item.answer)}</div>\n  </details>`;
        })
        .join('\n');
      return `<div class="fs-faq"${id}${sa}>\n${faqs}\n</div>`;
    }

    case 'html':
      // Raw HTML — rendered as-is (user responsibility for safety)
      return `<div class="fs-html"${id}${sa}>${block.props.html || ''}</div>`;

    // ====== E-COMMERCE ======
    case 'product': {
      const img = block.props.image ? `<img src="${escapeAttr(block.props.image)}" alt="${escapeAttr(block.props.name || '')}" class="fs-product-image" loading="lazy" />` : '';
      const compareAt = block.props.compareAtPrice ? `<span class="fs-product-compare">${escapeHTML(block.props.compareAtPrice)}</span> ` : '';
      return `<div class="fs-product"${id}${sa}>\n  ${img}\n  <h3 class="fs-product-name">${escapeHTML(block.props.name || '')}</h3>\n  ${block.props.description ? `<p class="fs-product-desc">${escapeHTML(block.props.description)}</p>` : ''}\n  <div class="fs-product-price">${compareAt}${escapeHTML(block.props.price || '')}</div>\n  <button class="fs-btn fs-btn-primary fs-btn-md">${escapeHTML(block.props.buttonText || 'Add to Cart')}</button>\n</div>`;
    }

    case 'cart':
      return `<div class="fs-cart"${id}${sa}>\n  <p class="fs-cart-empty">Your cart is empty</p>\n</div>`;

    case 'checkout':
      return `<div class="fs-checkout"${id}${sa}>\n  <p>Checkout form will appear here</p>\n</div>`;

    case 'orderBump': {
      return `<div class="fs-order-bump"${id}${sa}>\n  <label class="fs-order-bump-label">\n    <input type="checkbox" ${block.props.checked ? 'checked ' : ''}/>\n    <div>\n      <strong>${escapeHTML(block.props.name || '')}</strong>\n      <p>${escapeHTML(block.props.description || '')}</p>\n      <span class="fs-order-bump-price">${escapeHTML(block.props.price || '')}</span>\n    </div>\n  </label>\n</div>`;
    }

    default:
      return `<div${id}${sa}>${escapeHTML(block.props.content || '')}</div>`;
  }
}

// ============================================================================
// RESPONSIVE CSS
// ============================================================================

function generateResponsiveCSS(blocks: Block[]): string {
  const tabletRules: string[] = [];
  const mobileRules: string[] = [];

  function collectResponsive(block: Block) {
    const tabletStyles = block.styles?.tablet;
    const mobileStyles = block.styles?.mobile;

    if (tabletStyles && Object.keys(tabletStyles).length > 0) {
      tabletRules.push(`  #block-${block.id} { ${stylesToCSS(tabletStyles)} }`);
    }
    if (mobileStyles && Object.keys(mobileStyles).length > 0) {
      mobileRules.push(`  #block-${block.id} { ${stylesToCSS(mobileStyles)} }`);
    }

    if (block.children) {
      block.children.forEach(collectResponsive);
    }
  }

  blocks.forEach(collectResponsive);

  let css = '';
  if (tabletRules.length > 0) {
    css += `\n@media (max-width: 1024px) {\n${tabletRules.join('\n')}\n}`;
  }
  if (mobileRules.length > 0) {
    css += `\n@media (max-width: 640px) {\n${mobileRules.join('\n')}\n}`;
  }
  return css;
}

// ============================================================================
// BASE STYLES
// ============================================================================

const BASE_CSS = `
/* FlowStack — Generated Site Styles */
*, *::before, *::after { margin: 0; padding: 0; box-sizing: border-box; }
body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #111827; -webkit-font-smoothing: antialiased; }
img { max-width: 100%; height: auto; display: block; }
a { color: inherit; text-decoration: none; }

/* Layout */
.fs-container { max-width: 1200px; margin: 0 auto; padding: 0 20px; }
.fs-columns { display: grid; gap: 20px; }
.fs-columns-2 { grid-template-columns: repeat(2, 1fr); }
.fs-columns-3 { grid-template-columns: repeat(3, 1fr); }
.fs-columns-4 { grid-template-columns: repeat(4, 1fr); }

/* Buttons */
.fs-btn { display: inline-block; text-align: center; border-radius: 8px; font-weight: 600; cursor: pointer; transition: opacity 0.15s; border: none; text-decoration: none; }
.fs-btn:hover { opacity: 0.9; }
.fs-btn-primary { background: #3b82f6; color: #fff; }
.fs-btn-secondary { background: #e5e7eb; color: #111827; }
.fs-btn-outline { background: transparent; border: 2px solid #3b82f6; color: #3b82f6; }
.fs-btn-ghost { background: transparent; color: #3b82f6; }
.fs-btn-sm { padding: 8px 16px; font-size: 0.875rem; }
.fs-btn-md { padding: 12px 24px; font-size: 1rem; }
.fs-btn-lg { padding: 16px 32px; font-size: 1.125rem; }

/* Forms */
.fs-field { display: flex; flex-direction: column; gap: 4px; }
.fs-label { font-weight: 500; font-size: 0.875rem; color: #374151; }
.fs-input, .fs-textarea, .fs-select { width: 100%; padding: 10px 14px; border: 1px solid #d1d5db; border-radius: 6px; font-size: 1rem; color: #111827; background: #fff; }
.fs-input:focus, .fs-textarea:focus, .fs-select:focus { outline: none; border-color: #3b82f6; box-shadow: 0 0 0 3px rgba(59,130,246,.15); }
.fs-fieldset { border: none; display: flex; flex-direction: column; gap: 8px; }
.fs-checkbox-label { display: flex; align-items: center; gap: 8px; cursor: pointer; }

/* Testimonial */
.fs-testimonial { text-align: center; }
.fs-testimonial-avatar { width: 64px; height: 64px; border-radius: 50%; object-fit: cover; margin: 0 auto 12px; }
.fs-testimonial-author { margin-top: 16px; }
.fs-testimonial-role { font-size: 0.875rem; color: #6b7280; }
.fs-stars { color: #fbbf24; font-size: 1.25rem; margin-bottom: 12px; }

/* Pricing */
.fs-pricing { display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 24px; }
.fs-pricing-card { padding: 32px 24px; border: 1px solid #e5e7eb; border-radius: 12px; text-align: center; display: flex; flex-direction: column; gap: 16px; }
.fs-pricing-highlighted { border-color: #3b82f6; box-shadow: 0 4px 20px rgba(59,130,246,.15); position: relative; }
.fs-pricing-name { font-size: 1.25rem; font-weight: 600; }
.fs-pricing-price { font-size: 2.5rem; font-weight: 700; }
.fs-pricing-period { font-size: 1rem; font-weight: 400; color: #6b7280; }
.fs-pricing-features { list-style: none; text-align: left; display: flex; flex-direction: column; gap: 8px; flex: 1; }
.fs-pricing-features li::before { content: "✓ "; color: #10b981; font-weight: 700; }

/* FAQ */
.fs-faq-item { border-bottom: 1px solid #e5e7eb; }
.fs-faq-question { padding: 16px 0; font-weight: 600; cursor: pointer; list-style: none; display: flex; justify-content: space-between; align-items: center; }
.fs-faq-question::after { content: "+"; font-size: 1.5rem; color: #6b7280; }
details[open] .fs-faq-question::after { content: "−"; }
.fs-faq-answer { padding: 0 0 16px; color: #4b5563; line-height: 1.6; }

/* Product */
.fs-product { display: flex; flex-direction: column; gap: 12px; }
.fs-product-image { width: 100%; border-radius: 8px; }
.fs-product-compare { text-decoration: line-through; color: #9ca3af; }

/* Gallery */
.fs-gallery-item img { width: 100%; height: 100%; object-fit: cover; border-radius: 4px; }

/* Countdown */
.fs-countdown { display: flex; justify-content: center; gap: 24px; }
.fs-cd-unit { text-align: center; }
.fs-cd-num { display: block; font-size: 2.5rem; font-weight: 700; }
.fs-cd-label { font-size: 0.75rem; text-transform: uppercase; color: #6b7280; }

/* File Download */
.fs-file-download { display: flex; align-items: center; justify-content: space-between; gap: 12px; }
.fs-file-size { font-size: 0.875rem; color: #6b7280; }

/* Order Bump */
.fs-order-bump { border: 2px solid #fbbf24; border-radius: 8px; background: #fef3c7; padding: 16px; }
.fs-order-bump-label { display: flex; align-items: flex-start; gap: 12px; cursor: pointer; }
.fs-order-bump-price { font-weight: 700; color: #92400e; }

/* Progress */
.fs-progress { display: flex; flex-direction: column; gap: 4px; }
.fs-progress-label { font-size: 0.875rem; font-weight: 600; text-align: right; }

/* Responsive defaults */
@media (max-width: 1024px) {
  .fs-columns-3, .fs-columns-4 { grid-template-columns: repeat(2, 1fr); }
}
@media (max-width: 640px) {
  .fs-columns-2, .fs-columns-3, .fs-columns-4 { grid-template-columns: 1fr; }
  .fs-countdown { gap: 12px; }
  .fs-cd-num { font-size: 1.75rem; }
}
`;

// ============================================================================
// COUNTDOWN JAVASCRIPT
// ============================================================================

const COUNTDOWN_JS = `
(function(){
  document.querySelectorAll('.fs-countdown').forEach(function(el){
    var target = new Date(el.dataset.target).getTime();
    var msg = el.dataset.completeMsg || 'Done!';
    function update(){
      var now = Date.now();
      var diff = target - now;
      if(diff <= 0){
        el.innerHTML = '<div style="font-size:1.5rem;font-weight:700">' + msg + '</div>';
        return;
      }
      var d = Math.floor(diff/86400000);
      var h = Math.floor((diff%86400000)/3600000);
      var m = Math.floor((diff%3600000)/60000);
      var s = Math.floor((diff%60000)/1000);
      var dn = el.querySelector('[data-days]');
      var hn = el.querySelector('[data-hours]');
      var mn = el.querySelector('[data-minutes]');
      var sn = el.querySelector('[data-seconds]');
      if(dn) dn.textContent = String(d).padStart(2,'0');
      if(hn) hn.textContent = String(h).padStart(2,'0');
      if(mn) mn.textContent = String(m).padStart(2,'0');
      if(sn) sn.textContent = String(s).padStart(2,'0');
    }
    update();
    setInterval(update, 1000);
  });
})();
`;

// ============================================================================
// PAGE RENDERER
// ============================================================================

export function renderPageHTML(page: Page, site: Site): string {
  const blocksHTML = page.content.map(renderBlock).join('\n');
  const responsiveCSS = generateResponsiveCSS(page.content);
  const hasCountdown = JSON.stringify(page.content).includes('"countdown"');

  const seoTitle = page.seo?.title || page.title;
  const seoDesc = page.seo?.description || '';
  const ogTitle = page.seo?.ogTitle || seoTitle;
  const ogDesc = page.seo?.ogDescription || seoDesc;
  const ogImage = page.seo?.ogImage || '';

  // Google Fonts
  const fonts = site.settings?.fonts || [];
  const googleFonts = fonts.filter((f) => f.source === 'google');
  const fontLinks = googleFonts.length > 0
    ? `<link rel="preconnect" href="https://fonts.googleapis.com">\n  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>\n  <link href="https://fonts.googleapis.com/css2?${googleFonts.map((f) => `family=${encodeURIComponent(f.family).replace(/%20/g, '+')}`).join('&')}&display=swap" rel="stylesheet">`
    : '';

  // Tracking
  const tracking = site.settings?.tracking || {};
  let trackingHead = '';
  let trackingBody = '';
  if (tracking.googleTagManager) {
    trackingHead += `\n  <script>(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src='https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);})(window,document,'script','dataLayer','${escapeAttr(tracking.googleTagManager)}');</script>`;
    trackingBody += `\n  <noscript><iframe src="https://www.googletagmanager.com/ns.html?id=${escapeAttr(tracking.googleTagManager)}" height="0" width="0" style="display:none;visibility:hidden"></iframe></noscript>`;
  }
  if (tracking.googleAnalytics) {
    trackingHead += `\n  <script async src="https://www.googletagmanager.com/gtag/js?id=${escapeAttr(tracking.googleAnalytics)}"></script>\n  <script>window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','${escapeAttr(tracking.googleAnalytics)}');</script>`;
  }
  if (tracking.facebookPixel) {
    trackingHead += `\n  <script>!function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,document,'script','https://connect.facebook.net/en_US/fbevents.js');fbq('init','${escapeAttr(tracking.facebookPixel)}');fbq('track','PageView');</script>`;
  }

  const favicon = site.settings?.favicon ? `<link rel="icon" href="${escapeAttr(site.settings.favicon)}">` : '';
  const customCSS = site.settings?.customCss || '';
  const customJS = site.settings?.customJs || '';

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escapeHTML(seoTitle)}</title>
  <meta name="description" content="${escapeAttr(seoDesc)}">
  <meta property="og:title" content="${escapeAttr(ogTitle)}">
  <meta property="og:description" content="${escapeAttr(ogDesc)}">
  ${ogImage ? `<meta property="og:image" content="${escapeAttr(ogImage)}">` : ''}
  <meta property="og:type" content="website">
  <meta name="twitter:card" content="summary_large_image">
  ${favicon}
  ${fontLinks}
  <style>${BASE_CSS}${responsiveCSS}${customCSS ? `\n/* Custom CSS */\n${customCSS}` : ''}</style>${trackingHead}
</head>
<body>${trackingBody}
  ${blocksHTML}
  ${hasCountdown ? `<script>${COUNTDOWN_JS}</script>` : ''}
  ${customJS ? `<script>${customJS}</script>` : ''}
</body>
</html>`;
}

// ============================================================================
// SITEMAP GENERATOR
// ============================================================================

export function generateSitemap(site: Site, pages: Page[], baseUrl: string): string {
  const urlEntries = pages
    .filter((page) => page.isPublished)
    .map((page) => {
      const loc = page.path === '/' || page.path === '/index'
        ? baseUrl
        : `${baseUrl}${page.path.startsWith('/') ? page.path : `/${page.path}`}`;
      const lastmod = page.updatedAt instanceof Date
        ? page.updatedAt.toISOString().split('T')[0]
        : new Date(page.updatedAt).toISOString().split('T')[0];
      return `  <url>\n    <loc>${escapeHTML(loc)}</loc>\n    <lastmod>${lastmod}</lastmod>\n    <changefreq>weekly</changefreq>\n    <priority>0.8</priority>\n  </url>`;
    })
    .join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urlEntries}
</urlset>`;
}

// ============================================================================
// 404 PAGE
// ============================================================================

export function generate404Page(site: Site): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Page Not Found — ${escapeHTML(site.name)}</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; display: flex; align-items: center; justify-content: center; min-height: 100vh; margin: 0; background: #f9fafb; color: #111827; }
    .container { text-align: center; padding: 40px; }
    h1 { font-size: 6rem; font-weight: 700; color: #d1d5db; margin-bottom: 0; }
    p { font-size: 1.25rem; color: #6b7280; margin-top: 8px; }
    a { color: #3b82f6; text-decoration: none; font-weight: 600; }
    a:hover { text-decoration: underline; }
  </style>
</head>
<body>
  <div class="container">
    <h1>404</h1>
    <p>The page you're looking for doesn't exist.</p>
    <a href="/">← Back to Home</a>
  </div>
</body>
</html>`;
}

// ============================================================================
// FULL SITE RENDERER — Produces all files needed for deployment
// ============================================================================

export interface RenderedFile {
  path: string;
  content: string;
}

export function renderSite(site: Site, pages: Page[]): RenderedFile[] {
  const files: RenderedFile[] = [];
  const publishedPages = pages.filter((p) => p.isPublished);

  // Render each published page
  for (const page of publishedPages) {
    const html = renderPageHTML(page, site);
    // Convert path to file path: "/" → "index.html", "/about" → "about/index.html"
    let filePath: string;
    if (page.path === '/' || page.path === '' || page.path === '/index') {
      filePath = 'index.html';
    } else {
      const cleanPath = page.path.replace(/^\//, '').replace(/\/$/, '');
      filePath = `${cleanPath}/index.html`;
    }
    files.push({ path: filePath, content: html });
  }

  // Generate sitemap
  const baseUrl = site.customDomain
    ? `https://${site.customDomain}`
    : `https://${site.subdomain || site.name}.pages.dev`;
  files.push({
    path: 'sitemap.xml',
    content: generateSitemap(site, publishedPages, baseUrl),
  });

  // Generate 404 page
  files.push({
    path: '404.html',
    content: generate404Page(site),
  });

  return files;
}
