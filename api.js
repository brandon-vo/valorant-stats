const axios = require('axios').default;
const { ErrorType, DataType } = require('./constants/types');

async function getData(playerID, dataType, matchID = null) {
  let data;

  try {
    if (dataType === DataType.PROFILE) {
      data = await axios.get(process.env.TRACKER_PROFILE + playerID);
    } else if (dataType === DataType.RANK) {
      data = await axios.get(process.env.TRACKER_PROFILE + playerID + process.env.RANK_HEADER);
    } else if (dataType === DataType.COMP_OVERVIEW) {
      // prettier-ignore
      data = await axios.get(
        process.env.TRACKER_PROFILE + playerID + process.env.OVERVIEW_HEADER + 'competitive' + process.env.SOURCE_HEADER,
      );
    } else if (dataType === DataType.UNRATED_OVERVIEW) {
      data = await axios.get(
        process.env.TRACKER_PROFILE + playerID + process.env.OVERVIEW_HEADER + 'unrated'
      );
    } else if (dataType === DataType.SPIKE_RUSH_OVERVIEW) {
      data = await axios.get(
        process.env.TRACKER_PROFILE + playerID + process.env.OVERVIEW_HEADER + 'spikerush'
      );
    } else if (dataType === DataType.DEATHMATCH_OVERVIEW) {
      data = await axios.get(
        process.env.TRACKER_PROFILE + playerID + process.env.OVERVIEW_HEADER + 'deathmatch'
      );
    } else if (dataType === DataType.REPLICATION_OVERVIEW) {
      data = await axios.get(
        process.env.TRACKER_PROFILE + playerID + process.env.OVERVIEW_HEADER + 'replication'
      );
    } else if (dataType === DataType.ESCALATION_OVERVIEW) {
      data = await axios.get(
        process.env.TRACKER_PROFILE + playerID + process.env.OVERVIEW_HEADER + 'escalation'
      );
    } else if (dataType === DataType.SWIFTPLAY_OVERVIEW) {
      data = await axios.get(
        process.env.TRACKER_PROFILE + playerID + process.env.OVERVIEW_HEADER + 'swiftplay'
      );
    } else if (dataType === DataType.SNOWBALL_OVERVIEW) {
      data = await axios.get(
        process.env.TRACKER_PROFILE + playerID + process.env.OVERVIEW_HEADER + 'snowball'
      );
    } else if (dataType === DataType.WEAPON) {
      data = await axios.get(process.env.TRACKER_PROFILE + playerID + process.env.WEAPON_HEADER);
    } else if (dataType === DataType.SEASON_REPORT) {
      data = await axios.get(process.env.TRACKER_PROFILE + playerID + process.env.SEASON_REPORT);
    } else if (dataType === DataType.MATCH) {
      data = await axios.get(process.env.TRACKER_MATCH + `riot/${playerID}`);
    } else if (dataType === DataType.MATCH_INFO) {
      data = await axios.get(process.env.TRACKER_MATCH + matchID);
    } else {
      console.error('You should not reach here. There is a typo in the code :|');
    }
  } catch (error) {
    if (error.response && error.response.status === 403) {
      return ErrorType.FORBIDDEN;
    }
    return ErrorType.DEFAULT;
  }

  return data;
}

module.exports = { getData };
