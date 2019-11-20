const knex = require("knex");
const connection = require("/opt/nodejs/connection.json");
const database = knex({
  client: "mysql",
  connection
});

const sendResponse = (statusCode, body) => ({
  statusCode,
  body
});

const getPlayerDetails = async playerId => {
  const query = `SELECT id, first_name, last_name, country_code, ranking_date, ranking_points, ranking, birth_date, hand FROM rankings, players
        WHERE rankings.player_id = ${playerId}
        AND players.id = ${playerId};`;

  const players = await database.raw(query);

  const performances = players[0].map(player => {
    const { ranking_date, ranking_points, ranking } = player;
    return {
      date: ranking_date,
      rankingPoints: ranking_points,
      ranking
    };
  });

  const {
    first_name,
    last_name,
    id,
    country_code,
    birth_date,
    hand
  } = players[0][0];

  return {
    id,
    firstName: first_name,
    lastName: last_name,
    birthDate: birth_date,
    countryCode: country_code,
    hand,
    performances
  };
};

exports.handler = async event => {
  const { playerId } = event;
  try {
    const players = await getPlayerDetails(playerId);
    return sendResponse(200, players);
  } catch (error) {
    return sendResponse(400, error);
  }
};
