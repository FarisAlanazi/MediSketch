import img from "../../assets/doctor-with-his-arms-crossed-white-background.jpg";
import '../../GeneralStyles/GeneralStyles.CSS'
export default function DoctorCards({ name , price , special}){
    
    return (
        <div className='form' style={{display: 'flex'}}>
            <div className="img">
                <img src={img} alt="" className="imgWithNoMargin"/>
                
            </div>
            <div className="">

            <h3>Name</h3>
            <h4><span>Special</span></h4>

            <h4>experience</h4>
            <p className="price"> 120$</p>

            
            </div>
                <button className="btn ">View</button>
        </div>
    )

}


