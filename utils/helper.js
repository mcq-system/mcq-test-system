const UAParser = require('ua-parser-js');
const geoip = require('geoip-lite');

const getUserAgentInfo = (userAgent) => {
    const parser = new UAParser(userAgent);
    const result = parser.getResult();
    console.log({
        browser: result.browser.name,      // Chrome, Firefox, Safari...
        browserVersion: result.browser.version,
        os: result.os.name,                // Windows, macOS, Linux...
        osVersion: result.os.version,
        device: result.device.type,        // mobile, tablet, desktop
        deviceName: result.device.name,
        userAgent: userAgent
    });
    return {
        browser: result.browser.name,      // Chrome, Firefox, Safari...
        browserVersion: result.browser.version,
        os: result.os.name,                // Windows, macOS, Linux...
        osVersion: result.os.version,
        device: result.device.type,        // mobile, tablet, desktop
        deviceName: result.device.name,
        userAgent: userAgent
    };
};

const getClientIp = (req) => {
    const d = req.headers['x-forwarded-for']?.split(',')[0]
        || req.socket.remoteAddress
        || req.ip;
    console.log('IP:', d);
    return d
};

const getGeoLocation = (ip) => {
    const geo = geoip.lookup(ip);
    console.log('Geo Location:', geo);
    return geo;
}

module.exports = {
    getUserAgentInfo,
    getClientIp,
    getGeoLocation
};