import React, {useReducer, useRef, useState} from 'react'

import { Form } from 'react-bootstrap'
import axios from "axios";

const formReducer = (state, event) => {
    return {
        ...state,
        [event.name]: event.value
    }
}

function Login() {
    const [formData, setFormData] = useReducer(formReducer, {})
    const [formValidated, setFormValidated] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [notLoggedIn, setNotLoggedIn] = useState(true);
    const formRef = useRef(null);
    const usernameRef = useRef("");
    const [formErrors, setFormErrors] = useState(false);

    const handleLogin = (event) => {
        const form = event.currentTarget;
        event.preventDefault();
        if (form.checkValidity() === false) {
            event.stopPropagation();
            setFormValidated(true);
            setFormErrors(true);
        } else {
            setTimeout(() => {
                setSubmitting(false);
                formRef.current.reset();
                usernameRef.current.focus();
                setNotLoggedIn(false);
            }, 1000)
            setSubmitting(true);
            axios
                .post("http://localhost:8080/searchuser", formData)
                .then(res => {
                    if (res.status === 202) {
                        localStorage.setItem('userToken', JSON.stringify(res.data.accessToken));
                        localStorage.setItem('username', JSON.stringify(res.data.username));
                        console.log(localStorage.getItem('username'));
                    } else if (res.status === 203) {
                        alert(res.data);
                    } else if (res.status === 201) {
                        alert(res.data);
                    }
                }).catch(error => {
                alert("Error logging in. Try again.");
            })
            setFormValidated(false);
            setFormErrors(false);
        }
    }

    const handleLogout = () => {
        localStorage.clear();
        setNotLoggedIn(true);
    }

    const handleChange = event => {
        setFormData({
            name: event.target.name,
            value: event.target.value,
        });
    }



    return(


                <div className="login">
                    {notLoggedIn &&
                    <h3>Login or register</h3> &&
                    <Form noValidate validated={formValidated} ref={formRef} onSubmit={handleLogin} className="loginForm">
                        <Form.Group controlId="username" className="inputgroup">
                            <Form.Label>Username</Form.Label>
                            <Form.Control required type="text" onChange={handleChange} name="username" placeholder="Username" ref={usernameRef}/>
                        </Form.Group>
                        <Form.Group controlId="password" className="inputgroup">
                            <Form.Label>Password</Form.Label>
                            <Form.Control required type="password" onChange={handleChange} name="password" placeholder="Password"/>
                            {formErrors &&
                                <p className="formErrorText">Fill all text fields.</p>
                            }
                        </Form.Group>
                        <button type={"submit"} className="loginBtn">Log in / Register</button>
                        {submitting &&
                            <p>Logging in...</p>
                        }
                    </Form>}
                    {!notLoggedIn && <div className='login'> <button onClick={handleLogout} className="loginBtn">Log out</button> </div>}
                </div>



    )
}

export default Login