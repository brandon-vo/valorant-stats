function Overview(profileOverview) {
  greenSquare = Math.round(profileOverview.matchesWinPct.value / 8.33);
  return {
    rankName: profileOverview.rank?.metadata?.tierName,
    kdrRatio: profileOverview.kDRatio.displayValue,
    kadRatio: profileOverview.kADRatio.displayValue,
    headshotPct: profileOverview.headshotsPercentage.displayValue,
    damagePerRound: profileOverview.damagePerRound.displayValue,
    kills: profileOverview.kills.displayValue,
    deaths: profileOverview.deaths.displayValue,
    assists: profileOverview.assists.displayValue,
    mostKills: profileOverview.mostKillsInMatch.displayValue,
    timePlayed: profileOverview.timePlayed.displayValue,
    winRatePct: profileOverview.matchesWinPct.displayValue,
    matchesWon: profileOverview.matchesWon.displayValue,
    matchesLost: profileOverview.matchesLost.displayValue,
    matchesTied: profileOverview.matchesTied.displayValue,
    killsPerMatch: profileOverview.killsPerMatch.displayValue,
    deathsPerMatch: profileOverview.deathsPerMatch.displayValue,
    assistsPerMatch: profileOverview.assistsPerMatch.displayValue,
    killsPerRound: profileOverview.killsPerRound.displayValue,
    avgCombatScore: profileOverview.scorePerRound.displayValue,
    plantCount: profileOverview.plants.displayValue,
    defuseCount: profileOverview.defuses.displayValue,
    avgEconRating: profileOverview.econRatingPerMatch.displayValue,
    aceCount: profileOverview.aces.displayValue,
    oneVsOneClutches: profileOverview.clutches1v1.displayValue,
    firstBloodCount: profileOverview.firstBloods.displayValue,
    firstDeathsCount: profileOverview.firstDeaths.displayValue,
    // Setting the win rate visual bar
    winRateBar:
      '<:greenline:839562756930797598>'.repeat(greenSquare) +
      '<:redline:839562438760071298>'.repeat(12 - greenSquare),
  };
}

module.exports = { Overview };
