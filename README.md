# Rest-apin kutsut ja niitä vastaavat JSON-muodot

## /getusercities
Kutsu käyttäjän tallennettujen kaupunkien hakemiseen tietokannasta.
Kutsun JSON-muoto: `{ username: username }`.

## /savecity
Kutsu uuden tallennettavan kaupungin lähettämiseen tietokantaan. Kutsun JSON-muoto:
`{ username: username , city: city }`.

## /searchuser
Kutsu, jolla etsitään käyttäjä tietokannasta. Jos käyttäjä löytyy, tarkistetaan onko annettu salasana oikea,
tehdään käyttäjälle token ja palautetaan kutsujalle token, sekä käyttäjän käyttäjätunnus. Jos käyttäjää
ei löytynyt, tehdään uusi käyttäjä tietokantaan. Kutsun JSON-muoto: `{ username: username, password: password }`.

## /remove
Kutsu, jolla poistetaan tietokannan city-taulukosta kaupunki. Kaupunki poistetaan pyynnössä annetun save_id:n avulla.
Kutsun JSON-muoto: `{ save_id: save_id }`.

## /verifytoken
Kutsu, jolla tarkistetaan onko käyttäjän token vielä voimassa. Kutsun JSON-muoto: `{ username: username }`.
Lisäksi tarvitaan authorization header pyyntöön: `{ headers: { authorization: token }}`