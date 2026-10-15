import React, { useState, useEffect } from 'react';
import "./Dealers.css";
import "../assets/style.css";
import Header from '../Header/Header';
import review_icon from "../assets/reviewicon.png"
import { apiUrl, readJson } from '../../config';

const Dealers = () => {
  const [dealersList, setDealersList] = useState([]);
  const [states, setStates] = useState([])
  const [loadError, setLoadError] = useState("");

  const dealer_url = apiUrl("/djangoapp/get_dealers");

  const filterDealers = async (state) => {
    const dealer_url_by_state = dealer_url + "/" + encodeURIComponent(state);
    try {
      const res = await fetch(dealer_url_by_state, {
        method: "GET"
      });
      const retobj = await readJson(res);
      if (retobj && retobj.status === 200) {
        setLoadError("");
        setDealersList(Array.from(retobj.dealers));
      } else {
        setLoadError("Could not load the dealerships for " + state + ".");
      }
    } catch (err) {
      setLoadError("Could not reach the server.");
    }
  }

  const get_dealers = async ()=>{
    try {
      const res = await fetch(dealer_url, {
        method: "GET"
      });
      const retobj = await readJson(res);
      if (retobj && retobj.status === 200) {
        let all_dealers = Array.from(retobj.dealers)
        let states = [];
        all_dealers.forEach((dealer)=>{
          states.push(dealer.state)
        });

        setStates(Array.from(new Set(states)))
        setDealersList(all_dealers)
      } else {
        setLoadError("Could not load the dealerships.");
      }
    } catch (err) {
      setLoadError("Could not reach the server.");
    }
  }
  useEffect(() => {
    get_dealers();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  },[]);


let isLoggedIn = sessionStorage.getItem("username") != null ? true : false;
return(
  <div>
      <Header/>
     {loadError !== "" ? <div role="alert" style={{color: "darkred", margin: "10px"}}>{loadError}</div> : null}
     <table className='table'>
      <thead>
      <tr>
      <th>ID</th>
      <th>Dealer Name</th>
      <th>City</th>
      <th>Address</th>
      <th>Zip</th>
      <th>
      <select name="state" id="state" defaultValue="" onChange={(e) => filterDealers(e.target.value)}>
      <option value="" disabled hidden>State</option>
      <option value="All">All States</option>
      {states.map(state => (
          <option key={state} value={state}>{state}</option>
      ))}
      </select>

      </th>
      {isLoggedIn ? (
          <th>Review Dealer</th>
         ):<></>
      }
      </tr>
      </thead>
      <tbody>
     {dealersList.map(dealer => (
        <tr key={dealer['id']}>
          <td>{dealer['id']}</td>
          <td><a href={'/dealer/'+dealer['id']}>{dealer['full_name']}</a></td>
          <td>{dealer['city']}</td>
          <td>{dealer['address']}</td>
          <td>{dealer['zip']}</td>
          <td>{dealer['state']}</td>
          {isLoggedIn ? (
            <td><a href={`/postreview/${dealer['id']}`}><img src={review_icon} className="review_icon" alt="Post Review"/></a></td>
           ):<></>
          }
        </tr>
      ))}
      </tbody>
     </table>
  </div>
)
}

export default Dealers
