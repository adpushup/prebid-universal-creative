import constants from "./constants";

function getPageFeedbackData() {
    const adp = window.parent.adpushup;
    const { siteId, platform, pageGroup, packetId, country, siteDomain } = adp.config;
    return {
        url: adp.utils.getURLForFeedback(),
        platform,
        pageGroup,
        siteDomain,
        siteId,
        packetId,
        country
    };
}

function getCurrentApSlot() {
    const adp = window.parent.adpushup;
    /**
     * TODO: 
     * Currently only one slot will be present in every iframe so taking only the first element
     * of adpSlots object,
     * But will need to change this in future with prebid request batching support
     */
    const slot = Object.values(adp.adpTags.adpSlots)[0];
    return slot;
}

export function sendApBidWonFeedback(auctionData, bidObject) {
    const adp = window.parent.adpushup;
    const mode = adp.config.mode;
    const errorCode = constants.ERROR_CODES.NO_ERROR;
    const renderedAdSize = auctionData.size;
    const winner = auctionData.bidderCode || constants.FEEDBACK.DEFAULT_WINNER;
    const winningRevenue = (bidObject.price || auctionData.hbPb) / 1000;
    const winnerNetworkRelation = constants.NETWORK_RELATIONS.DIRECT;
    const winnerAdUnitId = bidObject.adid || auctionData.adId || null;
    const formatType = (bidObject.ext && bidObject.ext.prebid && bidObject.ext.prebid.type) || constants.DEFAULT_FORMAT_TYPE;
    const slot = getCurrentApSlot();
    const services = slot.services;
    const refreshcount = slot.refreshcount || parseInt(auctionData.targetingMap.refreshcount) || constants.DEFAULT_REFRESH_COUNT;
    const sectionId = slot.sectionId || (slot.optionalParam && (slot.optionalParam.originalId || slot.optionalParam.adId));
    const sectionName = slot.sectionName;

    const slotFeedbackData = {
        bids: [
            {
                bidder: winner,
                revenue: winningRevenue,
                networkRelation: winnerNetworkRelation
            }
        ],
        mode,
        errorCode,
        renderedAdSize,
        winner,
        winningRevenue,
        winnerNetworkRelation,
        winnerAdUnitId,
        formatType,
        services,
        refreshcount,
        sectionId,
        sectionName
    };

    const feedbackData = adp.$.extend({}, getPageFeedbackData(), slotFeedbackData);

    return adp.$.get(constants.FEEDBACK.HB_FEEDBACK_URL + adp.utils.base64Encode(JSON.stringify(feedbackData)));
}

export function transformAdpushupTargetingData(tagData) {
    let auctionData = {};
    Object.keys(tagData).forEach(key => {
        if (key === 'targetingMap') {
            auctionData[key] = transformAdpushupTargetingData(tagData[key]);
        } else if (Array.isArray(tagData[key])) {
            auctionData[key] = tagData[key][0];
        } else {
            auctionData[key] = tagData[key];
        }
    })
    return auctionData;
}

export function resizeGoogleAdIframe(size) {
    const win = window.parent;
    const [ width, height ] = size.split('x').map(Number);
    const parentAdIframes = Array.from(win.document.getElementsByTagName("iframe"));
    parentAdIframes.forEach(frame => {
        if(frame.name.indexOf(constants.GOOGLE_AD_IFRAME_NAME) === -1) {
            return;
        }
        frame.width = width;
        frame.height = height;
    });
}