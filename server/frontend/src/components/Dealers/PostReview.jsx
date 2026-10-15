import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import "./Dealers.css";
import "../assets/style.css";
import Header from '../Header/Header';
import { apiUrl, readJson } from '../../config';


const PostReview = () => {
  const [dealer, setDealer] = useState({});
  const [review, setReview] = useState("");
  const [model, setModel] = useState("");
  const [year, setYear] = useState("");
  const [date, setDate] = useState("");
  const [carmodels, setCarmodels] = useState([]);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  let params = useParams();
  let id =params.id;
  let dealer_url = apiUrl(`/djangoapp/dealer/${id}`);
  let review_url = apiUrl(`/djangoapp/add_review`);
  let carmodels_url = apiUrl(`/djangoapp/get_cars`);

  const postreview = async ()=>{
    let name = sessionStorage.getItem("firstname")+" "+sessionStorage.getItem("lastname");
    //If the first and second name are stores as null, use the username
    if(name.includes("null")) {
      name = sessionStorage.getItem("username");
    }
    if(model === "" || review.trim() === "" || date === "" || year === "") {
      setError("All details are mandatory");
      return;
    }
    if(Number(year) < 2015 || Number(year) > 2023) {
      setError("Car year must be between 2015 and 2023");
      return;
    }
    if(!name) {
      setError("Please log in before posting a review");
      return;
    }

    // The select value is the index of the chosen make/model pair
    const chosen = carmodels[Number(model)];

    let jsoninput = JSON.stringify({
      "name": name,
      "dealership": id,
      "review": review,
      "purchase": true,
      "purchase_date": date,
      "car_make": chosen.CarMake,
      "car_model": chosen.CarModel,
      "car_year": year,
    });

    setError("");
    setSubmitting(true);
    try {
      const res = await fetch(review_url, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: jsoninput,
      });

      const json = await readJson(res);
      if (json && json.status === 200) {
        window.location.href = window.location.origin+"/dealer/"+id;
        return;
      }
      if (json && json.status === 403) {
        setError("You must be logged in to post a review.");
      } else {
        setError((json && json.message) || "The review could not be posted.");
      }
    } catch (err) {
      setError("Could not reach the server. Please try again later.");
    }
    setSubmitting(false);
  }
  const get_dealer = async ()=>{
    try {
      const res = await fetch(dealer_url, {
        method: "GET"
      });
      const retobj = await readJson(res);

      if(retobj && retobj.status === 200) {
        let dealerobjs = Array.from(retobj.dealer)
        if(dealerobjs.length > 0)
          setDealer(dealerobjs[0])
      }
    } catch (err) {
      setError("Could not reach the server.");
    }
  }

  const get_cars = async ()=>{
    try {
      const res = await fetch(carmodels_url, {
        method: "GET"
      });
      const retobj = await readJson(res);

      if(retobj && retobj.CarModels) {
        setCarmodels(Array.from(retobj.CarModels))
      }
    } catch (err) {
      setError("Could not reach the server.");
    }
  }
  useEffect(() => {
    get_dealer();
    get_cars();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  },[]);


  return (
    <div>
      <Header/>
      <div  style={{margin:"5%"}}>
      <h1 style={{color:"darkblue"}}>{dealer.full_name}</h1>
      <textarea id='review' cols='50' rows='7' placeholder="Write your review here" onChange={(e) => setReview(e.target.value)}></textarea>
      <div className='input_field'>
      Purchase Date <input type="date" onChange={(e) => setDate(e.target.value)}/>
      </div>
      <div className='input_field'>
      Car Make
      <select name="cars" id="cars" defaultValue="" onChange={(e) => setModel(e.target.value)}>
      <option value="" disabled hidden>Choose Car Make and Model</option>
      {carmodels.map((carmodel, index) => (
          <option key={index} value={index}>{carmodel.CarMake} {carmodel.CarModel}</option>
      ))}
      </select>
      </div >

      <div className='input_field'>
      Car Year <input type="number" onChange={(e) => setYear(e.target.value)} max={2023} min={2015}/>
      </div>

      {error !== "" ? <div role="alert" style={{color: "darkred", fontWeight: "bold"}}>{error}</div> : null}
      <div>
      <button className='postreview' onClick={postreview} disabled={submitting}>Post Review</button>
      </div>
    </div>
    </div>
  )
}
export default PostReview
