const axios = require('axios').default;

async function getProfile(playerID) {
    try {
        trackerProfile = await axios.get(process.env.TRACKER_PROFILE + `${playerID}`);
    } catch (error) {
        if (error.response.status === 403) {
            return '403_error';
        }
        return 'default_error';
    }
    return trackerProfile;
}

async function getMatch(playerID) {
    try {
        trackerMatch = await axios.get(process.env.TRACKER_MATCH + `${playerID}`);
    } catch (error) {
        if (error.response.status === 403) {
            return '403_error';
        }
        return 'default_error';
    }
    return trackerMatch;
}

async function getMap(playerID) {
    try {
        trackerMap = await axios.get(process.env.TRACKER_PROFILE + `${playerID}` + '/segments/map');
    } catch (error) {
        if (error.response.status === 403) {
            return '403_error';
        }
        return 'default_error';
    }
    return trackerMap;
}

async function getWeapon(playerID) {
    try {
        trackerWeapon = await axios.get(process.env.TRACKER_PROFILE + `${playerID}` + '/segments/weapon');
    } catch (error) {
        if (error.response.status === 403) {
            return '403_error';
        }
        return 'default_error';
    }
    return trackerWeapon;
}

async function getMatchInfo(matchID) {
    try {
        matchInfo = await axios.get(process.env.MATCH_INFO + `${matchID}`)
    } catch(error) {
        return 'default_error';
    }
    return matchInfo;
}

module.exports = {getProfile, getMatch, getMap, getWeapon, getMatchInfo};