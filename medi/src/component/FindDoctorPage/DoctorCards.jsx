import img from "../../assets/doctor-with-his-arms-crossed-white-background.jpg";
import "../../GeneralStyles/GeneralStyles.css";
import { Link } from "react-router-dom";
export default function DoctorCards({
  firstname,
  price = "0",
  special = "none",
  lastname,
  gender,
  experience = " none",
  id,
}) {
  return (
    <div className="form" style={{ display: "flex" }}>
      <div className="img">
        <img src={img} alt="" className="imgWithNoMargin" />
      </div>
      <div className="">
        <h5>
          {firstname} {lastname}
        </h5>
        <h5>
          <span>{special}</span>
        </h5>

        <p>{experience} years of experience</p>
        <p className="price"> ${price}</p>
        <p className="gender"> {gender}</p>
      </div>

      <Link to={`/DoctorDetails/${id}`}>
        <button className="btn ">View</button>
      </Link>
    </div>
  );
}
