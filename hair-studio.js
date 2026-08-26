/* The Hair Studio — navigation and CTA behavior */

const analyticsConfig = window.HAIR_STUDIO_ANALYTICS_CONFIG || {};
const GA4_MEASUREMENT_ID = analyticsConfig.ga4MeasurementId || '';
let analyticsLoaded = false;

function getAnalyticsConsent() {
    try {
        return localStorage.getItem('hairStudioAnalyticsConsent') === 'granted';
    } catch (error) {
        return false;
    }
}

function loadAnalyticsWhenConfigured() {
    if (analyticsLoaded || !getAnalyticsConsent() || !/^G-[A-Z0-9]+$/i.test(GA4_MEASUREMENT_ID)) return;
    window.dataLayer = window.dataLayer || [];
    window.gtag = window.gtag || function gtag() { window.dataLayer.push(arguments); };
    const script = document.createElement('script');
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${GA4_MEASUREMENT_ID}`;
    document.head.appendChild(script);
    window.gtag('js', new Date());
    window.gtag('config', GA4_MEASUREMENT_ID, { anonymize_ip: true });
    analyticsLoaded = true;
}

function trackEvent(name, parameters = {}) {
    if (!analyticsLoaded || typeof window.gtag !== 'function') return;
    window.gtag('event', name, parameters);
}

function initNavigation() {
    const toggle = document.querySelector('.site-menu-toggle');
    const nav = document.querySelector('.site-nav');
    if (!toggle || !nav) return;

    const closeMenu = () => {
        nav.classList.remove('is-open');
        toggle.setAttribute('aria-expanded', 'false');
        document.body.classList.remove('menu-open');
    };

    toggle.addEventListener('click', () => {
        const isOpen = nav.classList.toggle('is-open');
        toggle.setAttribute('aria-expanded', String(isOpen));
        document.body.classList.toggle('menu-open', isOpen);
    });

    nav.addEventListener('click', (event) => {
        if (event.target.closest('a')) closeMenu();
    });

    document.addEventListener('keydown', (event) => {
        if (event.key === 'Escape' && nav.classList.contains('is-open')) {
            closeMenu();
            toggle.focus();
        }
    });
}

function initCtaTracking() {
    document.addEventListener('click', (event) => {
        const link = event.target.closest('a');
        if (!link) return;
        const href = link.getAttribute('href') || '';
        const ctaLocation = link.dataset.ctaLocation || 'unspecified';
        if (href.includes('wa.me')) trackEvent('whatsapp_click', { cta_location: ctaLocation });
        else if (href.startsWith('tel:')) trackEvent('phone_click', { cta_location: ctaLocation });
        else if (link.classList.contains('btn')) trackEvent('cta_click', { cta_location: ctaLocation });
    });
}

document.addEventListener('DOMContentLoaded', () => {
    initNavigation();
    initCtaTracking();
    loadAnalyticsWhenConfigured();
});
