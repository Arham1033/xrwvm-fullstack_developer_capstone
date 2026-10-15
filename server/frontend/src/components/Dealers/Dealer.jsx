import React, { useState,useEffect } from 'react';
import { useParams } from 'react-router-dom';
import "./Dealers.css";
import "../assets/style.css";
import positive_icon from "../assets/positive.png"
import neutral_icon from "../assets/neutral.png"
import negative_icon from "../assets/negative.png"
import review_icon from "../assets/reviewbutton.png"
import Header from '../Header/Header';
import { apiUrl, readJson } from '../../config';

const Dealer = () => {


  const [dealer, setDealer] = useState({});
  const [reviews, setReviews] = useState([]);
  const [unreviewed, setUnreviewed] = useState(false);
  const [loadError, setLoadError] = useState("");
  const [postReview, setPostReview] = useState(<></>)

  let params = useParams();
  let id =params.id;
  let dealer_url = apiUrl(`/djangoapp/dealer/${id}`);
  let reviews_url = apiUrl(`/djangoapp/reviews/dealer/${id}`);
  let post_review = `/postreview/${id}`;

  const get_dealer = async ()=>{
    try {
      const res = await fetch(dealer_url, {
        method: "GET"
      });
      const retobj = await readJson(res);

      if(retobj && retobj.status === 200) {
        let dealerobjs = Array.from(retobj.dealer)
        if(dealerobjs.length > 0) {
          setDealer(dealerobjs[0])
        } else {
          setLoadError("Dealer not found.");
        }
      } else {
        setLoadError("Could not load the dealer.");
      }
    } catch (err) {
      setLoadError("Could not reach the server.");
    }
  }

  const get_reviews = async ()=>{
    try {
      const res = await fetch(reviews_url, {
        method: "GET"
      });
      const retobj = await readJson(res);

      if(retobj && retobj.status === 200) {
        if(retobj.reviews.length > 0){
          setReviews(retobj.reviews)
        } else {
          setUnreviewed(true);
        }
      } else {
        setLoadError("Could not load the reviews.");
      }
    } catch (err) {
      setLoadError("Could not reach the server.");
    }
  }

  const senti_icon = (sentiment)=>{
    let icon = sentiment === "positive"?positive_icon:sentiment==="negative"?negative_icon:neutral_icon;
    return icon;
  }

  useEffect(() => {
    get_dealer();
    get_reviews();
    if(sessionStorage.getItem("username")) {
      setPostReview(<a href={post_review}><img src={review_icon} style={{width:'10%',marginLeft:'10px',marginTop:'10px'}} alt='Post Review'/></a>)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  },[]);


return(
  <div style={{margin:"20px"}}>
      <Header/>
      <div style={{marginTop:"10px"}}>
      <h1 style={{color:"grey"}}>{dealer.full_name}{postReview}</h1>
      <h4  style={{color:"grey"}}>{dealer['city']},{dealer['address']}, Zip - {dealer['zip']}, {dealer['state']} </h4>
      </div>
      {loadError !== "" ? <div role="alert" style={{color: "darkred"}}>{loadError}</div> : null}
      <div className="reviews_panel">
      {reviews.length === 0 && unreviewed === false && loadError === "" ? (
        <span>Loading Reviews....</span>
      ):  unreviewed === true? <div>No reviews yet! </div> :
      reviews.map(review => (
        <div className='review_panel' key={review.id}>
          <img src={senti_icon(review.sentiment)} className="emotion_icon" alt='Sentiment'/>
          <div className='review'>{review.review}</div>
          <div className="reviewer">{review.name} {review.car_make} {review.car_model} {review.car_year}</div>
        </div>
      ))}
    </div>
  </div>
)
}

export default Dealer
