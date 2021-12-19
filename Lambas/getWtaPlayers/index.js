const knex = require("knex");
const connection = require("/opt/nodejs/connection.json");
const database = knex({
  client: "mysql",
  connection,
});

const sendResponse = (statusCode, body) => ({
  statusCode,
  body,
});

const isArray = (array) => array.length;

const getMostRecentDate = async () => {
  const mostRecentDateQuery = `SELECT ranking_date from rankings\n
                                ORDER BY ranking_date DESC\n
                                LIMIT 1`;
  const date = await database.raw(mostRecentDateQuery);
  return date[0][0].ranking_date;
};

const getPlayers = async (filter, limit, offset) => {
  const { ranking, rankingPoints, date } = filter;
  const [lowRanking, highRanking] = ranking;
  const [lowRankingPoints, highRankingPoints] = rankingPoints;

  const rankingFilterQuery = `WHERE rankings.ranking BETWEEN ${lowRanking} AND ${highRanking}`;
  const rankingPoinstFilterQuery = `AND rankings.ranking_points BETWEEN ${lowRankingPoints} AND ${highRankingPoints}`;
  const mostRecentDate = await getMostRecentDate();

  const dateObject = new Date(mostRecentDate);
  const mostRecentDateFormated = dateObject.toISOString().split("T")[0];

  const query = `SELECT player_id, ranking_date, ranking, ranking_points, first_name, last_name, hand, birth_date, country_code, tours FROM rankings\n
    JOIN players ON players.id = rankings.player_id\n
    ${isArray(ranking) ? rankingFilterQuery : ""}\n
    ${isArray(rankingPoints) ? rankingPoinstFilterQuery : ""} \n
    AND rankings.ranking_date = '${date ? date : mostRecentDateFormated}'\n
    ORDER BY ranking\n
    LIMIT ${limit} OFFSET ${offset}`;

  const players = await database.raw(query);
  const playersToReturn = players[0].map((player) => {
    const {
      first_name,
      last_name,
      player_id,
      ranking_date,
      country_code,
      birth_date,
      ranking_points,
      ...rest
    } = player;
    return {
      ...rest,
      id: player_id,
      rankingPoints: ranking_points,
      firstName: first_name,
      lastName: last_name,
      birthDate: birth_date,
      countryCode: country_code,
    };
  });

  return playersToReturn;
};

exports.handler = async (event) => {
  const { filter, limit, offset } = event;

  try {
    const players = await getPlayers(filter, limit, offset);
    return sendResponse(200, players);
  } catch (error) {
    return sendResponse(400, error);
  }
};
