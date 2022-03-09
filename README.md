<h1>Rest-apin kutsut ja niitä vastaavat JSON-muodot</h1> 

<h2>/getusercities</h2>
Kutsu käyttäjän tallennettujen kaupunkien hakemiseen tietokannasta. 
Kutsun JSON-muoto: { username: _username_ }.

<h2>/savecity</h2>
Kutsu uuden tallennettavan kaupungin lähettämiseen tietokantaan. Kutsun JSON-muoto:
{ username: _username_, city: _city_ }

<h2>/searchuser</h2>
Kutsu, jolla etsitään käyttäjä tietokannasta. Jos käyttäjä löytyy, tarkistetaan onko annettu salasana oikea,
tehdään käyttäjälle token ja palautetaan kutsujalle token, sekä käyttäjän käyttäjätunnus. Jos käyttäjää
ei löytynyt, tehdään uusi käyttäjä tietokantaan. Kutsun JSON-muoto: { username: _username_, password: _password_ }.

<h2>/remove</h2>
Kutsu, jolla poistetaan tietokannan city-taulukosta kaupunki. Kaupunki poistetaan pyynnössä annetun save_id:n avulla.
Kutsun JSON-muoto: { save_id: _save_id_ }.

<h2>/verifytoken</h2>
Kutsu, jolla tarkistetaan onko käyttäjän token vielä voimassa. Kutsun JSON-muoto: { username: _username_ }.
Lisäksi tarvitaan authorization header pyyntöön: { headers: { authorization: _token_ }}