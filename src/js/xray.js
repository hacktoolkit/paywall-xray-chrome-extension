$(function() {
    const INTERVAL_MILLIS = 5000;  // default
    //const INTERVAL_MILLIS = 1000;  // every 1s - uncomment for testing only
    let paywallXrayInterval = null;
    const LIMIT = 5;
    let ticks = 0;
    let extractedContent = null;


    const XRAY_CONFIG = {
        'abc.template': {
            badIds: [],
            badIdRegexes: [],
            badClassNames: [],
            preArticleExtractor: function() {
            },
            articleExtractor: function() {
            }
        },
        'www.businessinsider.com': {
            badIds: [
                'checkout-container'
            ],
            badIdRegexes: [],
            badClassNames: [
                'tp-modal'
            ],
            preArticleExtractor: function() {
            },
            articleExtractor: function() {
                // replace the entire body's content with just the article
                const article = $('article');
                const articleContent = $('div#piano-inline-content-wrapper').css({
                    display: 'block'
                });
            }
        },
        'www.nytimes.com': {
            badIds: [
                'gateway-content',
                'google-one-tap-container',
                'in-story-masthead',
                'top-wrapper'
            ],
            badIdRegexes: [
                /^lire-ui.*$/,
                /^story-ad-\d+-wrapper$/
            ],
            badClassNames: [
                'ad',
                'NYTAppHideMasthead'
            ],
            preArticleExtractor: function() {
            },
            articleExtractor: function() {
                // replace the entire app's content with just the article
                const article = $('article#story');
                const app = $('div#app');
                app.html(article);
            }
        },
        'www.theepochtimes.com': {
            badIds: [],
            badIdRegexes: [
                /^ad_.*$/
            ],
            badClassNames: [
                'bottom_recm',
                'fade-out',
                'meter_container',
                'meter_expired',
                'tool_box',
                'top_ad'
            ],
            preArticleExtractor: function() {
                if (!extractedContent) {
                    const contentElt = $('div.post_content');
                    if (contentElt) {
                        extractedContent = contentElt.html();
                        $('div.post_content').html(extractedContent);
                    }
                }
                $('html').removeClass('js-focus-visible');
            },
            articleExtractor: function() {
                if (extractedContent) {
                    $('div.post_content').html(extractedContent);
                }
                $('div.one_post').css({
                    overflow: 'scroll',  // paywall: 'hidden'
                    height: '', // paywall: 673px
                    maxWidth: 1250  // paywall: 1200px
                });
                $('html').removeClass('js-focus-visible');
            }
        }
    };


    function activatePaywallXray() {
        const location = window.location;
        const hostname = location.hostname;

        const config = XRAY_CONFIG[hostname];

        if (typeof(config) !== 'undefined') {
            config.preArticleExtractor();
            removeBadDivs(config);
            config.articleExtractor();
        }
    }


    function removeBadDivs(config) {
        const divs = $('div');
        _.forEach(divs, function(div) {
            const elt = $(div);
            const id = elt.attr('id');

            let shouldRemove = false;

            if (!shouldRemove && id) {
                // check against badIds
                if (!shouldRemove) {
                    _.forEach(config.badIds, function(badId) {
                        shouldRemove = id === badId;

                        // return false to terminate iteration early
                        return !shouldRemove;
                    });
                }

                // check against badIdRegexes
                if (!shouldRemove) {
                    _.forEach(config.badIdRegexes, function(badIdRegex) {
                        shouldRemove = !!(id.match(badIdRegex));

                        // return false to terminate iteration early
                        return !shouldRemove;
                    });
                }
            }

            if (!shouldRemove) {
                // check against badClassNames
                _.forEach(config.badClassNames, function(badClassName) {
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


    function onTick() {
        console.log('Paywall X-ray Extension is loaded');

        if (ticks > LIMIT) {
            clearInterval(paywallXrayInterval);
        } else {
            activatePaywallXray();
        }
        ++ticks;
    }


    function initEventHandlers() {
    }


    function init() {
        // attempt to execute immediately upon load, and then periodically
        activatePaywallXray();
        paywallXrayInterval = setInterval(onTick, INTERVAL_MILLIS);
    }


    initEventHandlers();
    init();
});
