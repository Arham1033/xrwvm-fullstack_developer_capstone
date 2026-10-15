import React, { useState } from "react";

import "./Register.css";
import user_icon from "../assets/person.png"
import email_icon from "../assets/email.png"
import password_icon from "../assets/password.png"
import confirm_icon from "../assets/password confirm.png"
import close_icon from "../assets/close.png"
import { apiUrl, readJson } from "../../config";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const Register = () => {
  const [userName, setUserName] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [email, setEmail] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const gohome = () => {
    window.location.href = window.location.origin;
  };

  // Returns an error message, or "" when the form is valid
  const validate = () => {
    if (!userName.trim() || !firstName.trim() || !lastName.trim() ||
        !email.trim() || !password) {
      return "All fields are required.";
    }
    if (!EMAIL_PATTERN.test(email.trim())) {
      return "Please enter a valid email address.";
    }
    if (password.length < 8) {
      return "Password must be at least 8 characters long.";
    }
    if (password !== confirmPassword) {
      return "Passwords do not match.";
    }
    return "";
  };

  const register = async (e) => {
    e.preventDefault();
    const problem = validate();
    if (problem) {
      setError(problem);
      return;
    }
    setError("");
    setSubmitting(true);

    try {
      const res = await fetch(apiUrl("/djangoapp/register"), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          "userName": userName.trim(),
          "password": password,
          "firstName": firstName.trim(),
          "lastName": lastName.trim(),
          "email": email.trim()
        }),
      });

      const json = await readJson(res);
      if (json && json.status === "Authenticated") {
        sessionStorage.setItem('username', json.userName);
        window.location.href = window.location.origin;
      } else if (json && json.error === "Already Registered") {
        setError("A user with the same username is already registered.");
      } else {
        setError((json && json.message) ||
          "Registration failed. Please try again.");
      }
    } catch (err) {
      setError("Could not reach the server. Please try again later.");
    }
    setSubmitting(false);
  };

  return (
    <div className="register_container" style={{ width: "50%" }}>
      <div className="header" style={{ display: "flex", flexDirection: "row", justifyContent: "space-between" }}>
        <span className="text" style={{ flexGrow: "1" }}>SignUp</span>
        <div style={{ display: "flex", flexDirection: "row", justifyContent: "space-between", alignItems: "end" }}>
          <a href="/" onClick={(e) => { e.preventDefault(); gohome(); }} style={{ justifyContent: "space-between", alignItems: "flex-end" }}>
            <img style={{ width: "1cm" }} src={close_icon} alt="X" />
          </a>
        </div>
        <hr />
      </div>

      <form onSubmit={register}>
        <div className="inputs">
          <div className="input">
            <img src={user_icon} className="img_icon" alt='Username' />
            <input type="text" name="username" placeholder="Username" className="input_field" onChange={(e) => setUserName(e.target.value)} />
          </div>
          <div className="input">
            <img src={user_icon} className="img_icon" alt='First Name' />
            <input type="text" name="first_name" placeholder="First Name" className="input_field" onChange={(e) => setFirstName(e.target.value)} />
          </div>
          <div className="input">
            <img src={user_icon} className="img_icon" alt='Last Name' />
            <input type="text" name="last_name" placeholder="Last Name" className="input_field" onChange={(e) => setLastName(e.target.value)} />
          </div>
          <div className="input">
            <img src={email_icon} className="img_icon" alt='Email' />
            <input type="email" name="email" placeholder="Email" className="input_field" onChange={(e) => setEmail(e.target.value)} />
          </div>
          <div className="input">
            <img src={password_icon} className="img_icon" alt='Password' />
            <input name="psw" type="password" placeholder="Password" className="input_field" onChange={(e) => setPassword(e.target.value)} />
          </div>
          <div className="input">
            <img src={confirm_icon} className="img_icon" alt='Confirm Password' />
            <input name="psw2" type="password" placeholder="Confirm Password" className="input_field" onChange={(e) => setConfirmPassword(e.target.value)} />
          </div>
        </div>
        {error !== "" ? (
          <div role="alert" style={{ color: "darkred", textAlign: "center", fontWeight: "bold" }}>{error}</div>
        ) : null}
        <div className="submit_panel">
          <input className="submit" type="submit" value={submitting ? "Registering..." : "Register"} disabled={submitting} />
        </div>
      </form>
    </div>
  )
}

export default Register;
