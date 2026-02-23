import fs from 'fs';

const apiCode = fs.readFileSync('src/lib/api.ts', 'utf8');

const methodsToCheck = [
    'getMasterActivities',
    'getMasterTransports',
    'getMasterPlans',
    'getMasterRoomTypes',
    'getMasterMealPlans',
    'getMasterLeadSources',
    'getMasterTermsTemplates',
    'getCMSBanners',
    'getCMSTestimonials',
    'getCMSGalleryImages',
    'getCMSPosts',
    'getFollowUps',
    'getProposals',
    'getDailyTargets',
    'getTimeSessions',
    'getAssignmentRules',
    'getUserActivities',
    'getAuditLogs'
];

methodsToCheck.forEach(m => {
    if (!apiCode.includes(`${m}:`)) {
        console.error(`MISSING METHOD: ${m}`);
    } else {
        console.log(`FOUND: ${m}`);
    }
});
