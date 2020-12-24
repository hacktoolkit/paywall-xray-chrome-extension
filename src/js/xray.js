$(function() {
    let paywallGuardInterval = null;
    const LIMIT = 5;
    let ticks = 0;

    function removePaywall() {
        removePaywallNYT();
    }

    function removePaywallNYT() {
        // NYTimes.com
        $('div#in-story-masthead').remove();
        $('div#google-one-tap-container').remove();
        $('div.NYTAppHideMasthead').remove();
        $('div#gateway-content').remove();
        $('div#top-wrapper').remove();
        $('div.ad').remove();

        const divs = $('div');
        _.forEach(divs, function(div) {
            const elt = $(div);
            const id = elt.attr('id');

            if (id) {
                if (id.match(/^lire-ui.*$/) ||
                    id.match(/^story-ad-\d+-wrapper$/)
                   ) {
                    elt.remove();
                }
            }
        });

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
        ++tick;
    }


    function initEventHandlers() {
    }


    function init() {
        //$('script[type*=javascript]').remove();
        paywallGuardInterval = setInterval(onTick, 5000);
        removePaywall();
    }


    initEventHandlers();
    init();
});
