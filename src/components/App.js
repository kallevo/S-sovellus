import '../App.css'
import axios from 'axios'
import {useEffect, useState} from "react";
import React from "react";

function App() {

    const [data, setData] = useState({});
    const [location, setLocation] = useState('');
    const [savedCities, setSavedCities] = useState([0]);
    const [save, setSave] = useState(false);
    const [validator, setValidator] = useState(false);

    const url = `https://api.openweathermap.org/data/2.5/weather?q=${location}&units=metric&appid=895284fb2d2c50a520ea537456963d9c`

    useEffect(() => {
        if (validator) {
            axios.get(url).then((response) => {
                setData(response.data);
                console.log(response.data);
            });
            setValidator(false);
        }
        console.log("updated: ", location);
    }, [location, validator])

    const searchLocation = (event) => {
        if (event.key === 'Enter' || event.button === 0) {

            axios.get(url)
                .then((response) => {
                    setData(response.data);
                    console.log(response.data);
                }).catch(error => {
                if (error.response.status === 404) {
                    alert("Haulla ei löytynt tuloksia!");
                }
            });
            if (save) {
                const info = {username: 'Kalle123', city: location};
                axios
                    .post("http://localhost:8080/savecity", info)
                    .then(response => {
                        if (response.status === 201) {
                            console.log(response.data);
                        }
                    }).catch(error => {
                    if (error.status === 401) {
                        alert(error.response.data);
                    }
                })
            }
        }
    };

    const handleCheckBoxClick = (event) => {
        if (event.target.checked) {
            setSave(true);
        } else {
            setSave(false);
        }
    }


    function removeCity(save_id) {
        axios
            .post("http://localhost:8080/remove", {save_id})
            .then(response => {
                if (response.status === 201) {
                    console.log(response.data);
                    window.location.reload(false);
                }
            }).catch(error => {
            if (error.response.status === 401) {
                alert(error.response.data);
            }
        })
    }


    useEffect(() => {
        const userinfo = {username: 'Kalle123'};
        axios
            .post("http://localhost:8080/getusercities", userinfo)
            .then(response => {
                if (response.status === 201) {
                    console.log(response.data);
                    setSavedCities(response.data);
                }
            }).catch(error => {
            if (error.response.status === 401) {
                alert(error.response.data);
            }
        })
        console.log(savedCities);
    }, [data]);

    return (
        <div className="App">
            <div className="savedCities">
                <table>
                    <thead>
                    <tr>
                        <th>Saved cities</th>
                    </tr>
                    </thead>
                    <tbody>
                    {savedCities.map(city => (
                        <tr key={"" + city.save_id}>
                            <td onClick={function () {
                                setLocation(() => city.name)
                                setValidator(() => true);
                            }}>{city.name}</td>
                            <td>
                                <button onClick={() => removeCity(city.save_id)}>Remove</button>
                            </td>
                        </tr>
                    ))}
                    </tbody>
                </table>
            </div>
            <div className="search-div">
                <div className="search">
                    <input
                        onChange={event => setLocation(event.target.value)}
                        onKeyPress={searchLocation}
                        placeholder='Write a city here...'
                        type="text"/>
                    Save
                    <input
                        type="checkbox" onClick={handleCheckBoxClick}/>
                </div>
                <div className="container">
                    <div className="top">
                        <div className="location">
                            <p>{data.name}</p>
                        </div>
                        <div className="temp">
                            {data.main ? <h1>{data.main.temp.toFixed()}°C</h1> : null}
                        </div>
                        <div className="description">
                            {data.weather ? <p>{data.weather[0].main}</p> : null}
                        </div>
                    </div>

                    {data.name !== undefined &&
                        <div className="bottom">
                            <div className="feels">
                                <p>Feels like: </p>
                                {data.main ? <p className='bold'>{data.main.feels_like.toFixed()}°c</p> : null}
                            </div>
                            <div className="humidity">
                                <p>Humidity:</p>
                                {data.main ? <p className='bold'>{data.main.humidity}%</p> : null}
                            </div>
                            <div className="wind">
                                <p>Wind speed:</p>{data.wind ?
                                <p className='bold'>{data.wind.speed.toFixed()} m/s</p> : null}
                            </div>
                        </div>
                    }
                </div>
            </div>
        </div>
    );
}

export default App;