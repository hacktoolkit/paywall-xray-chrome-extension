$(function() {
    //const INTERVAL_MILLIS = 5000;  // default
    const INTERVAL_MILLIS = 1000;  // every 1s - uncomment for testing only
    let paywallGuardInterval = null;
    const LIMIT = 5;
    let ticks = 0;


    function removePaywall() {
        const location = window.location;
        const hostname = location.hostname;

        if (hostname.match(/^www\.businessinsider\.com$/)) {
            removePaywallBusinessInsider();
        } else if (hostname.match(/^www\.nytimes\.com$/)) {
            removePaywallNYTimes();
        }
    }


    function removeBadDivs(badIds, badIdRegexes, badClassNames) {
        const divs = $('div');
        _.forEach(divs, function(div) {
            const elt = $(div);
            const id = elt.attr('id');

            let shouldRemove = false;

            if (!shouldRemove && id) {
                // check against badIds
                if (!shouldRemove) {
                    _.forEach(badIds, function(badId) {
                        shouldRemove = id === badId;

                        // return false to terminate iteration early
                        return !shouldRemove;
                    });
                }

                // check against badIdRegexes
                if (!shouldRemove) {
                    _.forEach(badIdRegexes, function(badIdRegex) {
                        shouldRemove = !!(id.match(badIdRegex));

                        // return false to terminate iteration early
                        return !shouldRemove;
                    });
                }
            }

            if (!shouldRemove) {
                // check against badClassNames
                _.forEach(badClassNames, function(badClassName) {
                    shouldRemove = elt.hasClass(badClassName);

                    // return false to terminate iteration early
                    return !shouldRemove;
                });
            }

            if (shouldRemove) {
                elt.remove();
            }
        });
    }


    function removePaywallBusinessInsider() {
        const badIds = [
            'checkout-container'
        ];
        const badIdRegexes = [];
        const badClassNames = [
            'tp-modal'
        ];

        removeBadDivs(badIds, badIdRegexes, badClassNames);

        // replace the entire body's content with just the article

        const article = $('article');
        const articleContent = $('div#piano-inline-content-wrapper').css({
            display: 'block'
        });
    }


    function removePaywallNYTimes() {
        const badIds = [
            'gateway-content',
            'google-one-tap-container',
            'in-story-masthead',
            'top-wrapper'
        ];
        const badIdRegexes = [
            /^lire-ui.*$/,
            /^story-ad-\d+-wrapper$/
        ];
        const badClassNames = [
            'ad',
            'NYTAppHideMasthead'
        ];

        removeBadDivs(badIds, badIdRegexes, badClassNames);

        // replace the entire app's content with just the article
        const article = $('article#story');
        const app = $('div#app');
        app.html(article);
    }


    function onTick() {
        console.log('Paywall X-ray Extension is loaded');

        if (ticks > LIMIT) {
            clearInterval(paywallGuardInterval);
        } else {
            removePaywall();
        }
        ++ticks;
    }


    function initEventHandlers() {
    }


    function init() {
        // attempt to remove immediately upon load, and then periodically
        removePaywall();
        paywallGuardInterval = setInterval(onTick, INTERVAL_MILLIS);
    }


    initEventHandlers();
    init();
});
