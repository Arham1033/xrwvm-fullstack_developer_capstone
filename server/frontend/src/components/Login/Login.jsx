import React, { useState } from 'react';

import "./Login.css";
import Header from '../Header/Header';
import { apiUrl, readJson } from '../../config';

const Login = ({ onClose }) => {

  const [userName, setUserName] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const gohome = () => {
    window.location.href = "/";
  };

  const login = async (e) => {
    e.preventDefault();

    if (!userName || !password) {
      setError("Please enter both a username and a password.");
      return;
    }
    setError("");

    try {
      const res = await fetch(apiUrl("/djangoapp/login"), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          "userName": userName,
          "password": password
        }),
      });

      const json = await readJson(res);
      if (json && json.status === "Authenticated") {
        sessionStorage.setItem('username', json.userName);
        gohome();
      } else if (json && json.message) {
        setError(json.message);
      } else {
        setError("The user could not be authenticated.");
      }
    } catch (err) {
      setError("Could not reach the server. Please try again later.");
    }
  };

  return (
    <div>
      <Header/>
    <div onClick={onClose}>
      <div
        onClick={(e) => {
          e.stopPropagation();
        }}
        className='modalContainer'
      >
          <form className="login_panel" style={{}} onSubmit={login}>
              <div>
              <span className="input_field">Username </span>
              <input type="text"  name="username" placeholder="Username" className="input_field" onChange={(e) => setUserName(e.target.value)}/>
              </div>
              <div>
              <span className="input_field">Password </span>
              <input name="psw" type="password"  placeholder="Password" className="input_field" onChange={(e) => setPassword(e.target.value)}/>
              </div>
              {error !== "" ? (
                <div role="alert" style={{color: "darkred", fontWeight: "bold"}}>{error}</div>
              ) : null}
              <div>
              <input className="action_button" type="submit" value="Login"/>
              <input className="action_button" type="button" value="Cancel" onClick={gohome}/>
              </div>
              <a className="loginlink" href="/register">Register Now</a>
          </form>
      </div>
    </div>
    </div>
  );
};

export default Login;
