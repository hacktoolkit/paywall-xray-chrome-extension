$(function () {
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
            badClassRegexes: [],
            badElementSelectors: [],
            obfuscatingIds: [],
            obfuscatingClassNames: [],
            obfuscatingClassRegexes: [],
            preArticleExtractor: function () {},
            articleExtractor: function () {},
            tickIntervalMillis: 5000,
            tickLimit: 5,
        },
        'fortune.com': {
            badIds: ['article_overlay'],
            badIdRegexes: [],
            badClassNames: ['tp-container-inner'],
            badClassRegexes: [],
            badElementSelectors: [],
            preArticleExtractor: function () {
                if (!extractedContent) {
                    const contentElt = $('div#instream-content-0');
                    if (contentElt) {
                        extractedContent = contentElt.html();
                        $('div#instream-content-0').html(extractedContent);
                    }
                }
            },
            articleExtractor: function () {
                if (extractedContent) {
                    $('div#instream-content-0').html(extractedContent);
                }
                // <div class="paywall paywallActive" style="filter: grayscale(0.5) blur(10px); z-index: -1; pointer-events: none; user-select: none;">
                $('.paywall').removeClass('paywallActive').css({
                    filter: '',
                    pointerEvents: '',
                    userSelect: '',
                    zIndex: '',
                });
            },
            tickIntervalMillis: 5000,
            tickLimit: 5,
        },
        'platformer.news': {
            badIds: [],
            badIdRegexes: [],
            badClassNames: ['modal', 'subscribe-dialog'],
            badElementSelectors: [],
            obfuscatingIds: [],
            obfuscatingClassNames: [],
            obfuscatingClassRegexes: [],
            preArticleExtractor: function () {},
            articleExtractor: function () {},
            tickIntervalMillis: 5000,
            tickLimit: 5,
        },
        'www.bbc.com': {
            badIds: [],
            badIdRegexes: [],
            badClassNames: ['zephr-overlay'],
            badClassRegexes: [],
            badElementSelectors: [],
            obfuscatingIds: [],
            obfuscatingClassNames: [],
            obfuscatingClassRegexes: [],
            preArticleExtractor: function () {},
            articleExtractor: function () {},
            tickIntervalMillis: 5000,
            tickLimit: 5,
        },
        'www.bloomberg.com': {
            badIds: ['expandableBanner'],
            badIdRegexes: [],
            badClassNames: [],
            badClassRegexes: [],
            badElementSelectors: [],
            obfuscatingIds: [],
            obfuscatingClassNames: [],
            obfuscatingClassRegexes: [
                /^nearly-transparent-text-blur__[a-f0-9]+$/,
            ],
            preArticleExtractor: function () {},
            articleExtractor: function () {},
            tickIntervalMillis: 5000,
            tickLimit: 5,
        },
        'www.businessinsider.com': {
            badIds: ['checkout-container'],
            badIdRegexes: [],
            badClassNames: ['back-to-home', 'tp-backdrop', 'tp-modal'],
            badClassRegexes: [],
            badElementSelectors: ['aside#l-rightrail', 'h4.piano-freemium'],
            preArticleExtractor: function () {},
            articleExtractor: function () {
                // replace the entire body's content with just the article
                const article = $('article');
                const articleContent = $(
                    'div#piano-inline-content-wrapper'
                ).css({
                    display: 'block',
                });
                $('body').removeClass('tp-modal-open');
            },
        },
        'www.economist.com': {
            badIds: ['layout-article-regwall'],
            badIdRegexes: [/^tp-regwall$/],
            badClassNames: [],
            badClassRegexes: [],
            badElementSelectors: [],
            preArticleExtractor: function () {
                if (!extractedContent) {
                    const contentElt = $('article.article');
                    if (contentElt) {
                        extractedContent = contentElt.html();
                        $('article.article').html(extractedContent);
                    }
                }
            },
            articleExtractor: function () {
                if (extractedContent) {
                    $('article.article').html(extractedContent);
                }
            },
            tickIntervalMillis: 5000,
            tickLimit: 5,
        },
        'www.flexpackmag.com': {
            badIds: ['metered-message', 'metered_notice'],
            badIdRegexes: [],
            badClassNames: [
                'article-preview-banner',
                'article-subscription-banner-free',
            ],
            badClassRegexes: [],
            badElementSelectors: [],
            preArticleExtractor: function () {
                if (!extractedContent) {
                    const contentElt = $('.page-article-show');
                    if (contentElt) {
                        extractedContent = contentElt.html();
                        $('article.main-body').html(extractedContent);
                    }
                }
            },
            articleExtractor: function () {
                if (extractedContent) {
                    $('article.main-body').html(extractedContent);
                    $('artlcle.main-body').removeClass('page-article-teaser');
                    $('artlcle.main-body').addClass('page-article-show');
                }
            },
            tickIntervalMillis: 5000,
            tickLimit: 5,
        },
        'www.ft.com': {
            badIds: [],
            badIdRegexes: [],
            badClassNames: [],
            badClassRegexes: [],
            badElementSelectors: [],
            obfuscatingIds: [],
            obfuscatingClassNames: [],
            obfuscatingClassRegexes: [],
            preArticleExtractor: function () {},
            articleExtractor: function () {},
            tickIntervalMillis: 5000,
            tickLimit: 5,
        },
        'www.law360.com': {
            badIds: ['NewsletterModal', 'FreeTrialModal'],
            badIdRegexes: [],
            badClassNames: ['modal-backdrop'],
            badClassRegexes: [],
            badElementSelectors: [],
            obfuscatingIds: ['teaser'],
            obfuscatingClassNames: [
                'fade1',
                'fade2',
                'fade3',
                'fade4',
                'fade5',
            ],
            obfuscatingClassRegexes: [],
            preArticleExtractor: function () {},
            articleExtractor: function () {
                const articleBody = $('#article-body');
                articleBody.css({
                    '-moz-user-select': null,
                    '-webkit-user-select': null,
                    '-ms-user-select': null,
                    'user-select': null,
                    '-o-user-select': null,
                });
                articleBody.attr('unselectable', null);
                articleBody.attr('onselectstart', null);
                articleBody.attr('onmousedown', null);
            },
            tickIntervalMillis: 5000,
            tickLimit: 5,
        },
        'www.nytimes.com': {
            badIds: [
                'gateway-content',
                'google-one-tap-container',
                'in-story-masthead',
                'top-wrapper',
            ],
            badIdRegexes: [/^lire-ui.*$/, /^story-ad-\d+-wrapper$/],
            badClassRegexes: [],
            badClassNames: ['ad', 'NYTAppHideMasthead'],
            badElementSelectors: [],
            preArticleExtractor: function () {},
            articleExtractor: function () {
                const app = $('div#app');
                const article = $('article#story');
                const content = $('main#site-content');
                const isArticle = article.length > 0;
                const isContent = content.length > 0;

                // replace the entire app's content with just the article
                if (isArticle) {
                    app.html(article);
                } else if (isContent) {
                    app.html(content);
                }
            },
        },
        'www.ocregister.com': {
            badIds: [
                'registration__wrapper',
                'registrationWall',
                'stick-trigger',
            ],
            badIdRegexes: [],
            badClassNames: [
                'hide-on-success',
                'modal-scrollable',
                'connext-modal-backdrop',
                'sidebar-content',
                'header-banners',
                'sign-up-follow',
            ],
            badClassRegexes: [],
            badElementSelectors: [],
            preArticleExtractor: function () {
                if (!extractedContent) {
                    const contentElt = $('div.article-body');
                    if (contentElt) {
                        extractedContent = contentElt.html();
                        $('div.article-body').html(extractedContent);
                    }
                }
            },
            articleExtractor: function () {
                if (extractedContent) {
                    $('div.article-body').html(extractedContent);
                }
                $('body').removeClass('modal-open');
            },
            tickIntervalMillis: 5000,
            tickLimit: 5,
        },
        'www.theepochtimes.com': {
            badIds: [],
            badIdRegexes: [/^ad_.*$/],
            badClassNames: [
                'bottom_recm',
                'fade-out',
                'main-wrapper',
                'meter_container',
                'meter_expired',
                'tool_box',
                'top_ad',
            ],
            badClassRegexes: [],
            badElementSelectors: [],
            preArticleExtractor: function () {
                if (!extractedContent) {
                    const contentElt = $('div.post_content');
                    if (contentElt) {
                        extractedContent = contentElt.html();
                        $('div.post_content').html(extractedContent);
                    }
                }
                $('html').removeClass('js-focus-visible');
            },
            articleExtractor: function () {
                if (extractedContent) {
                    $('div.post_content').html(extractedContent);
                }
                var unsetScrollBlockerCfg = {
                    overflow: 'scroll', // paywall: 'hidden'
                    height: '', // paywall: 673px
                    maxWidth: 1250, // paywall: 1200px
                };
                var scrollBlockerElts = ['div.one_post', 'main#main'];
                _.forEach(scrollBlockerElts, function (elt) {
                    $(elt).css(unsetScrollBlockerCfg);
                });
                $('html').removeClass('js-focus-visible');
            },
            tickIntervalMillis: 5000,
            tickLimit: 5,
        },
        'www.smh.com.au': {
            badIds: ['soft-reg-wall-piano-id'],
            badIdRegexes: [],
            badClassNames: ['tp-container-inner'],
            badClassRegexes: [],
            badElementSelectors: [],
            obfuscatingIds: [],
            obfuscatingClassNames: [],
            obfuscatingClassRegexes: [],
            preArticleExtractor: function () {},
            articleExtractor: function () {},
            tickIntervalMillis: 5000,
            tickLimit: 5,
        },
        'www.washingtonpost.com': {
            badIds: [],
            badIdRegexes: [/^paywall-.*$/, /^softwall-.*$/],
            badClassNames: ['hide-for-print', 'center'],
            badClassRegexes: [],
            badElementSelectors: [],
            preArticleExtractor: function () {},
            articleExtractor: function () {
                const mainContainer = $('#__next');
                mainContainer.css({
                    position: 'inherit',
                });
            },
            tickIntervalMillis: 5000,
            tickLimit: 5,
        },
        'www.wired.com': {
            badIds: [],
            badIdRegexes: [],
            badClassNames: ['ad', 'dfp-unit--paywall-modal-full-barrier'],
            badClassRegexes: [],
            badElementSelectors: [],
            preArticleExtractor: function () {},
            articleExtractor: function () {},
            tickIntervalMillis: 5000,
            tickLimit: 5,
        },
        'www.wsj.com': {
            badIds: ['cx-what-to-read-next', 'smartmatch-main'],
            badIdRegexes: [/^cx-.*$/, /^smartmatch-.*$/],
            badClassNames: [
                'GoogleActiveViewInnerContainer',
                'banner-ad-b',
                'immersive-snippet-rail-ad',
                'snippet-promotion',
            ],
            badClassRegexes: [],
            badElementSelectors: [],
            preArticleExtractor: function () {},
            articleExtractor: function () {
                $('main div.column').removeClass(
                    'column at-col-8 at12-col7 at16-col9 at16-offset2 at12-offset1'
                );
                // swap out the CSS class in order to remove the faded-out look applied to the pseudo-element :after
                $('.wsj-snippet-body')
                    .addClass('wsj-snippet-nofade')
                    .removeClass('wsj-snippet-body');
            },
            tickIntervalMillis: 2000,
            tickLimit: 20,
        },
    };

    function activatePaywallXray() {
        const location = window.location;
        const hostname = location.hostname;

        const xrayConfig = XRAY_CONFIGS[hostname];

        if (typeof xrayConfig !== 'undefined') {
            // attempt to execute immediately upon load, and then periodically
            runXray(xrayConfig);

            const tickIntervalMillis =
                xrayConfig.tickIntervalMillis || DEFAULT_INTERVAL_MILLIS;

            paywallXrayInterval = setInterval(
                makeXrayTicker(xrayConfig),
                tickIntervalMillis
            );
        }
    }

    function runXray(xrayConfig) {
        xrayConfig.preArticleExtractor();
        removeBadElements(xrayConfig);
        stripObfuscatingStyles(xrayConfig);
        xrayConfig.articleExtractor();
    }

    function makeXrayTicker(xrayConfig) {
        const callback = function () {
            console.log('Paywall X-ray Extension is loaded');
            const limit = xrayConfig.tickLimit || DEFAULT_TICK_LIMIT;

            if (ticks > limit) {
                clearInterval(paywallXrayInterval);
            } else {
                runXray(xrayConfig);
            }
            ++ticks;
        };
        return callback;
    }

    function removeBadElements(xrayConfig) {
        removeBadDivs(xrayConfig);

        _.forEach(xrayConfig.badElementSelectors, function (selector) {
            $(selector).remove();
        });
    }

    function removeBadDivs(xrayConfig) {
        const divs = $('div');
        _.forEach(divs, function (div) {
            const elt = $(div);
            const id = elt.attr('id');

            let shouldRemove = false;

            if (!shouldRemove && id) {
                // check against badIds
                if (!shouldRemove) {
                    _.forEach(xrayConfig.badIds, function (badId) {
                        shouldRemove = id === badId;

                        // return false to terminate iteration early
                        return !shouldRemove;
                    });
                }

                // check against badIdRegexes
                if (!shouldRemove) {
                    _.forEach(xrayConfig.badIdRegexes, function (badIdRegex) {
                        shouldRemove = !!id.match(badIdRegex);

                        // return false to terminate iteration early
                        return !shouldRemove;
                    });
                }
            }

            if (!shouldRemove) {
                // check against badClassNames
                _.forEach(xrayConfig.badClassNames, function (badClassName) {
                    shouldRemove = elt.hasClass(badClassName);

                    // return false to terminate iteration early
                    return !shouldRemove;
                });
            }

            if (!shouldRemove) {
                // check against obfuscatingClassRegexes
                const classes = (elt.attr('class') || '').split(/\s+/);
                _.forEach(classes, function (className) {
                    _.forEach(
                        xrayConfig.badClassRegexes,
                        function (badClassRegex) {
                            if (className.match(badClassRegex)) {
                                shouldRemove = true;

                                // return false to terminate iteration early
                                return !shouldRemove;
                            }
                        }
                    );
                });
            }

            if (shouldRemove) {
                elt.remove();
            }
        });
    }

    function stripObfuscatingStyles(xrayConfig) {
        _.forEach(xrayConfig.obfuscatingIds, function (id) {
            const elt = $('#' + id);
            elt.attr('id', '');
        });

        _.forEach(xrayConfig.obfuscatingClassNames, function (className) {
            $('.' + className).removeClass(className);
        });

        const divs = $('div');
        _.forEach(divs, function (div) {
            const elt = $(div);
            const classes = (elt.attr('class') || '').split(/\s+/);
            _.forEach(classes, function (className) {
                _.forEach(
                    xrayConfig.obfuscatingClassRegexes,
                    function (obfuscatingClassRegex) {
                        if (className.match(obfuscatingClassRegex)) {
                            elt.removeClass(className);
                        }
                    }
                );
            });
        });
    }

    function initEventHandlers() {}

    function init() {
        activatePaywallXray();
    }

    initEventHandlers();
    init();
});
