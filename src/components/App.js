import '../App.css'
import axios from 'axios'
import {useEffect, useReducer, useRef, useState} from "react";
import React from "react";
import {Form} from "react-bootstrap";
import clearIcon from '../icons/clear.svg';
import cloudyIcon from '../icons/cloudy.svg';
import drizzleIcon from '../icons/drizzle.svg';
import foggyIcon from '../icons/foggy.svg';
import rainyIcon from '../icons/rainy.svg';
import snowyIcon from '../icons/snowy.svg';
import thunderIcon from '../icons/thunder.svg';
import Login from '../components/Login';


function App(props) {

    const [data, setData] = useState({});
    const [location, setLocation] = useState('');
    const [savedCities, setSavedCities] = useState([0]);
    const [save, setSave] = useState(false);
    const [validator, setValidator] = useState(false);
    const [weatherStatus, setWeatherStatus] = useState('');
    const [notLoggedIn, setNotLoggedIn] = useState(false);

    const url = `https://api.openweathermap.org/data/2.5/weather?q=${location}&units=metric&appid=895284fb2d2c50a520ea537456963d9c`

    useEffect(() => {
        if (validator) {
            axios.get(url).then((response) => {
                setData(response.data);
                setWeatherStatus(data.weather[0].main);
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
                    alert("Haulla ei löytynyt tuloksia!");
                }
            });
            if (save && !notLoggedIn) {
                const info = {username: JSON.parse(localStorage.getItem("username")), city: location};
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
    
    const setIcon = () => {
       // const weatherState = data.weather[0].main;
      //  console.log("state on:  " + data.weather[0].main);


            switch (data.weather[0].main) {
              case 'Thunder':
                return (<img src={thunderIcon} alt="Logo" />)
              case 'Drizzle':
                return (<img src={drizzleIcon} alt="Logo" />)
              case 'Rain':
                return (<img src={rainyIcon} alt="Logo" />)
              case 'Snow':
                return (<img src={snowyIcon} alt="Logo" />)
              case 'Mist':
                return (<img src={foggyIcon} alt="Logo" />)
              case 'Clear':
                return (<img src={clearIcon} alt="Logo" />)
              case 'Clouds':
                return (<img src={cloudyIcon} alt="Logo" />)
              default:
                return null
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

    const checkIfLoggedIn = () => {
        const token = localStorage.getItem("userToken");
        if (token === null) {
            return false;
        }
        const tokenObj = JSON.parse(token);
        console.log("Token: ", tokenObj);
        axios
            .post("http://localhost:8080/verifytoken", {username: JSON.parse(localStorage.getItem("username"))},
                {headers: {authorization: 'Bearer ' + tokenObj}})
            .then(res => {
                if (res.status === 202) {
                    console.log("Token verification successful.");
                    setNotLoggedIn(false);
                    return true;
                }
            }).catch(error => {
            if (error.response.status === 401) {
                console.log("Token null at verifying stage.");
                setNotLoggedIn(true);
                return false;
            } else if (error.response.status === 403) {
                alert("Session expired. Log in again.");
                setNotLoggedIn(true);
                return false;
        }})
    }

    useEffect(() => {
        if (checkIfLoggedIn() === false) {
            setNotLoggedIn(true);
            return;
        }

        const userinfo = {username: JSON.parse(localStorage.getItem("username"))};
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
    }, [data, notLoggedIn]);

    return (
        <div className="App">
            <p className="cityheader">Saved cities</p>
            <div className="container">
            <div className="savedCities">
                <table>
                    <tbody>
                    {!notLoggedIn && savedCities.map(city => (
                        <tr className="capitalize" key={"" + city.save_id}>
                            <td className="pointer" onClick={function () {
                                setLocation(() => city.name)
                                setValidator(() => true);
                            }}>{city.name}</td>
                            <td>
                                <button className="pointer" onClick={() => removeCity(city.save_id)}>Remove</button>
                            </td>
                        </tr>
                    ))}
                    </tbody>
                </table>
                {notLoggedIn &&<p className="citydefault">Log in to see saved cities</p> }
            </div>
            <div className="search-div">
                <div className="search">
                    <input
                        onChange={event => setLocation(event.target.value)}
                        onKeyPress={searchLocation}
                        placeholder='Write a city here...'
                        type="text"/>
                    <button className="searchButton" onClick={searchLocation}> Search</button>
                    {!notLoggedIn &&
                        <div>
                        Save
                        <input className="pointer" type="checkbox" onClick={handleCheckBoxClick}/>
                        </div>
                    }
                </div>


                    <div className="top">
                        <div className="location">
                            <p>{data.name}</p>
                        </div>
                        <div className="temp">
                            {data.main ? <h1>{data.main.temp.toFixed()}°C</h1> : null}
                        </div>
                        <div className="description">
                            {data.weather ? <p>{data.weather[0].main}<br/>{setIcon()} 
                            </p> : null}
                            
 
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
                <Login/>
        </div>
        </div>
    );
}

export default App;
