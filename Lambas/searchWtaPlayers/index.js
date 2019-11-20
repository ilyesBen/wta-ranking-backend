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

const searchPlayers = async search => {
  if (!search) {
    return [];
  }

  const query = `SELECT id, first_name, last_name FROM players\n
    WHERE first_name  like '%${search}%'\n
    OR last_name  like '%${search}%'\n
    LIMIT 10 OFFSET 0`;

  const players = await database.raw(query);
  const playersToReturn = players[0].map(player => {
    const { first_name, last_name, ...rest } = player;
    return {
      ...rest,
      firstName: first_name,
      lastName: last_name
    };
  });

  return playersToReturn;
};

exports.handler = async event => {
  const { search } = event;
  try {
    const players = await searchPlayers(search);
    return sendResponse(200, players);
  } catch (error) {
    return sendResponse(400, error);
  }
};
