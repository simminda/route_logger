import "../style.css" 
import { Link } from "react-router-dom";
import background from "../img/bruno-van-der-kraan-vm5gksHUQJw-unsplash.jpg";
import mapImage from "../img/map.png"; 
import logImage from "../img/logbook.jpg";
import passportImage from "../img/passport.jpg";


const LandingPage = () => {
    return (
      <div className="landing-page-container">
        <div className="background-overlay" style={{ backgroundImage: `url(${background})` }}></div>
        <div className="landing-content">
          <h1>Welcome to Logger</h1>

          <div className="row card-container">
            <div className="col-md-4 mb-4">
              <div className="card h-100">
                <img src={mapImage} className="card-img-top" alt="map" />
                <div className="card-body">
                  <h5 className="card-title">Plan and View Routes</h5>
                  <p className="card-text">View routes and stops on a map.</p>
                </div>
              </div>
            </div>
            
            <div className="col-md-4 mb-4">
              <div className="card h-100">
                <img src={logImage} className="card-img-top" alt="logbook" />
                <div className="card-body">
                  <h5 className="card-title">Log Time Sheets</h5>
                  <p className="card-text">Auto-populate and download daily logbooks.</p>
                </div>
              </div>
            </div>
            
            <div className="col-md-4 mb-4">
              <div className="card h-100">
                <img src={passportImage} className="card-img-top" alt="travel history" />
                <div className="card-body">
                  <h5 className="card-title">Track Trips and Drive Time</h5>
                  <p className="card-text">Keep detailed records of all your travels in one convenient place.</p>
                </div>
              </div>
            </div>
          </div>

          <br></br>
          <Link to="/login" className="btn btn-primary">Enter</Link>
        </div>
        <div className="image-credit">
          Photo by <a href="https://unsplash.com/@brunovdkraan" target="_blank" rel="noopener noreferrer">Bruno van der Kraan</a> on <a href="https://unsplash.com" target="_blank" rel="noopener noreferrer">Unsplash</a>
        </div>
      </div>
    );
};
  
export default LandingPage;