$(function() {
    const DEFAULT_INTERVAL_MILLIS = 2000;
    const DEFAULT_TICK_LIMIT = 10;

    let paywallXrayInterval = null;
    let ticks = 0;
    let extractedContent = null;


    const XRAY_CONFIGS = {
        'abc.template': {
            badIds: [],
            badIdRegexes: [],
            badClassNames: [],
            badElementSelectors: [],
            preArticleExtractor: function() {
            },
            articleExtractor: function() {
            },
            tickIntervalMillis: 5000,
            tickLimit: 5
        },
        'www.businessinsider.com': {
            badIds: [
                'checkout-container'
            ],
            badIdRegexes: [],
            badClassNames: [
                'tp-backdrop',
                'tp-modal'
            ],
            badElementSelectors: [
                'aside#l-rightrail',
                'h4.piano-freemium'
            ],
            preArticleExtractor: function() {
            },
            articleExtractor: function() {
                // replace the entire body's content with just the article
                const article = $('article');
                const articleContent = $('div#piano-inline-content-wrapper').css({
                    display: 'block'
                });
                $('body').removeClass('tp-modal-open');
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
            badElementSelectors: [],
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
            badElementSelectors: [],
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
        },
        'www.wired.com': {
            badIds: [],
            badIdRegexes: [],
            badClassNames: [
                'ad',
                'dfp-unit--paywall-modal-full-barrier'
            ],
            badElementSelectors: [],
            preArticleExtractor: function() {
            },
            articleExtractor: function() {
            },
            tickIntervalMillis: 5000,
            tickLimit: 5
        },
        'www.wsj.com': {
            badIds: [
                'cx-what-to-read-next',
                'smartmatch-main'
            ],
            badIdRegexes: [
                /^cx-.*$/,
                /^smartmatch-.*$/
            ],
            badClassNames: [
                'GoogleActiveViewInnerContainer',
                'banner-ad-b',
                'immersive-snippet-rail-ad',
                'snippet-promotion'
            ],
            badElementSelectors: [],
            preArticleExtractor: function() {
            },
            articleExtractor: function() {
                $('main div.column').removeClass('column at-col-8 at12-col7 at16-col9 at16-offset2 at12-offset1');
                // swap out the CSS class in order to remove the faded-out look applied to the pseudo-element :after
                $('.wsj-snippet-body').addClass('wsj-snippet-nofade').removeClass('wsj-snippet-body');
            },
            tickIntervalMillis: 2000,
            tickLimit: 20
        },
    };


    function activatePaywallXray() {
        const location = window.location;
        const hostname = location.hostname;

        const xrayConfig = XRAY_CONFIGS[hostname];

        if (typeof(xrayConfig) !== 'undefined') {
            // attempt to execute immediately upon load, and then periodically
            runXray(xrayConfig);

            const tickIntervalMillis = xrayConfig.tickIntervalMillis || DEFAULT_INTERVAL_MILLIS;

            paywallXrayInterval = setInterval(
                makeXrayTicker(xrayConfig),
                tickIntervalMillis
            );
        }
    }


    function runXray(xrayConfig) {
        xrayConfig.preArticleExtractor();
        removeBadElements(xrayConfig);
        xrayConfig.articleExtractor();
    }


    function makeXrayTicker(xrayConfig) {
        const callback = function()  {
            console.log('Paywall X-ray Extension is loaded');
            const limit = xrayConfig.tickLimit || DEFAULT_TICK_LIMIT;

            if (ticks > limit) {
                clearInterval(paywallXrayInterval);
            } else {
                runXray(xrayConfig);
            }
            ++ticks;
        }
        return callback;
    }


    function removeBadElements(xrayConfig) {
        removeBadDivs(xrayConfig);

        _.forEach(xrayConfig.badElementSelectors, function(selector) {
            $(selector).remove();
        });
    }


    function removeBadDivs(xrayConfig) {
        const divs = $('div');
        _.forEach(divs, function(div) {
            const elt = $(div);
            const id = elt.attr('id');

            let shouldRemove = false;

            if (!shouldRemove && id) {
                // check against badIds
                if (!shouldRemove) {
                    _.forEach(xrayConfig.badIds, function(badId) {
                        shouldRemove = id === badId;

                        // return false to terminate iteration early
                        return !shouldRemove;
                    });
                }

                // check against badIdRegexes
                if (!shouldRemove) {
                    _.forEach(xrayConfig.badIdRegexes, function(badIdRegex) {
                        shouldRemove = !!(id.match(badIdRegex));

                        // return false to terminate iteration early
                        return !shouldRemove;
                    });
                }
            }

            if (!shouldRemove) {
                // check against badClassNames
                _.forEach(xrayConfig.badClassNames, function(badClassName) {
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


    function initEventHandlers() {
    }


    function init() {
        activatePaywallXray();
    }


    initEventHandlers();
    init();
});
