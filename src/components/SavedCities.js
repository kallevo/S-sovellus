import React, {useEffect, useState} from "react";
import axios from "axios";
import '../SavedCities.css';

function Cities() {
    const [savedCities, setSavedCities] = useState([0]);
    //const [updateCities, setUpdateCities] = useState(false);

    useEffect(() => {
        const userinfo = {username: 'Kalle123'};
        axios
            .post("http://localhost:8080/getusercities", userinfo)
            .then(response => {
                console.log(response.data);
                setSavedCities(response.data);
            })
        console.log(savedCities);
    }, []);
    
    return (
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
                        <td>{city.name}</td>
                    </tr>
                ))}
                </tbody>
            </table>
        </div>
    );
}

export default Cities;