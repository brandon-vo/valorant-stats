function getAuthor(profileInfo, playerID) {
  const userHandle = profileInfo.platformInfo.platformUserHandle;
  const userAvatar = profileInfo.platformInfo.avatarUrl;

  return {
    name: userHandle,
    iconURL: userAvatar,
    url: `https://tracker.gg/valorant/profile/riot/${playerID}/overview`,
  };
}

module.exports = { getAuthor };
