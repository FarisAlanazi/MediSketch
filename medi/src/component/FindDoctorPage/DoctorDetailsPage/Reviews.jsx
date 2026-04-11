import React from "react";
import "./detailsStyles/styles.css";
import "./detailsStyles/reviews.css";
function Reviews() {
  return (
    <div className="reviewsContainer">
      <div className="review" style={{ width: "18rem" }}>
        <div className="review-header">
          <h5 className="review-name">username</h5>
          <div className="review-rating">rate</div>
        </div>
        <p className="review-comment">
          Some quick example text to build on the card title and make up the
          bulk of the card's content.
        </p>
        <small className="review-date ">2023-10-10</small>
      </div>
    </div>
  );
}

export default Reviews;
