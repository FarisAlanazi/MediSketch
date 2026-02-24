import React from "react";
import { useState } from "react";
import "../../SearchAndCardStyle/searchComponentStyle.css";
import doctorImg from "../../assets/imgs/DoctorOnPhone.png";
function SearchComponent() {
  const [searchValue, setSearchValue] = useState();
  return (
    <div className="container">
      <div className="divWithInput">
        <h1>
          Find your doctor & <span>book instantly</span>
        </h1>
        <p id="paragraph">
          Lorem ipsum dolor sit amet consectetur adipisicing elit. Enim sunt
          repudiandae error consequatur a. Officiis ut velit vel ipsam expedita
          nisi, nostrum ducimus aliquid, atque assumenda exercitationem nihil
          tenetur. Expedita.
        </p>
        <input
          type="search"
          value={searchValue}
          onChange={(e) => setSearchValue(e.target.value)}
        />
      </div>
      <div className="imgClass">
        <img src={doctorImg} alt="" className="doctorImg" />
      </div>
    </div>
  );
}

export default SearchComponent;
