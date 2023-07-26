const express = require("express");
const app = express();
app.use(express.json());
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const path = require("path");

let db = null;

let dbPath = path.join(__dirname, "cricketTeam.db");

const initializeDBAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("Server Running at http://localhost:3000/");
    });
  } catch (e) {
    console.log(`DB Error: ${e.message}`);
    process.exit(1);
  }
};

initializeDBAndServer();

let ans = (playersArray) => ({
  playerId: playersArray.player_id,
  playerName: playersArray.player_name,
  jerseyNumber: playersArray.jersey_number,
  role: playersArray.role,
});

app.get("/players/", async (require, response) => {
  const getPlayerQuery = `
    SELECT 
    *
    FROM
    cricket_team
    ORDER BY 
    player_id
    `;
  const playersArray = await db.all(getPlayerQuery);

  response.send(playersArray.map((eachPlayer) => ans(eachPlayer)));
});

app.post("/players/", async (request, response) => {
  const playerDetails = request.body;
  const { playerName, jerseyNumber, role } = playerDetails;
  //   let playerName = player_name;
  //   let jerseyNumber = jersey_number;
  const addPlayerQuery = `
    INSERT INTO 
    cricket_team (player_name,jersey_number,role)
    VALUES
    (
        
        '${playerName}',
         ${jerseyNumber},
       ' ${role}'
    );

  `;

  //   try {
  const dbResponse = await db.run(addPlayerQuery);
  const addedId = dbResponse.lastId;

  response.send("Player Added to Team");
  //   } catch (e) {
  //     response.send(`Db Error: ${e}`);
  //   }
});

app.get("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;
  const getPlayerQuery = `
    SELECT *
    FROM
    cricket_team
    WHERE
    player_id = ${playerId}`;

  const playerDetail = await db.get(getPlayerQuery);

  let a = {
    playerId: playerDetail.player_id,
    playerName: playerDetail.player_name,
    jerseyNumber: playerDetail.jersey_number,
    role: playerDetail.role,
  };
  response.send(a);
});

app.put("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;
  const playerDetails = request.body;
  const { playerName, jerseyNumber, role } = playerDetails;
  //   let playerName = player_name;
  //   let jerseyNumber = jersey_number;

  const updatePlayerQuery = `
     UPDATE
     cricket_team
     SET
     player_name = '${playerName}',
     jersey_number = ${jerseyNumber},
     role = '${role}'
     WHERE
     player_id = ${playerId};

     `;

  //   try {
  await db.run(updatePlayerQuery);
  response.send("Player Details Updated");
  //   } catch (e) {
  //     response.send(`DB Error:", ${e}`);
  //     // response.status(500).json({ error: "Internal Server Error" });
  //   }
});

app.delete("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;

  const deleteQuery = `
    DELETE
    
    FROM
    cricket_team
    WHERE
    player_id = ${playerId}
    `;
  await db.run(deleteQuery);
  response.send("Player Removed");
});

module.exports = app;
