import { useState, useContext } from "react";
import { useNavigate, Link } from "react-router-dom";
import AuthContext from "../context/AuthContext";

const Register = () => {
    const auth = useContext(AuthContext);

    if (!auth) {
        console.error("AuthContext is undefined in Register.jsx");
        return <p className="text-danger">Error: AuthContext is not available</p>;
    }

    const { register } = auth;
    const navigate = useNavigate();

    const [userData, setUserData] = useState({
        username: "",
        email: "",
        password: "",
        is_driver: false,
        profile_picture: null,
    });

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setUserData((prev) => ({
            ...prev,
            [name]: type === "checkbox" ? checked : value,
        }));
    };

    const handleFileChange = (e) => {
        setUserData((prev) => ({
            ...prev,
            profile_picture: e.target.files[0],
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const formData = new FormData();
        formData.append("username", userData.username);
        formData.append("email", userData.email);
        formData.append("password", userData.password);
        formData.append("is_driver", userData.is_driver);
        if (userData.profile_picture) {
            formData.append("profile_picture", userData.profile_picture);
        }

        const success = await register(formData);
        if (success) {
            navigate("/login");
        } else {
            alert("Registration failed");
        }
    };

    return (
        <div className="container d-flex justify-content-center align-items-center vh-100">
            <div className="card p-4 shadow-lg" style={{ maxWidth: "400px", width: "100%" }}>
                <h2 className="text-center mb-4">Register</h2>
                <form onSubmit={handleSubmit}>
                    <div className="mb-3">
                        <label className="form-label">Username</label>
                        <input
                            type="text"
                            name="username"
                            className="form-control"
                            placeholder="Enter username"
                            value={userData.username}
                            onChange={handleChange}
                            required
                        />
                    </div>
                    <div className="mb-3">
                        <label className="form-label">Email</label>
                        <input
                            type="email"
                            name="email"
                            className="form-control"
                            placeholder="Enter email"
                            value={userData.email}
                            onChange={handleChange}
                            required
                        />
                    </div>
                    <div className="mb-3">
                        <label className="form-label">Password</label>
                        <input
                            type="password"
                            name="password"
                            className="form-control"
                            placeholder="Enter password"
                            value={userData.password}
                            onChange={handleChange}
                            required
                        />
                    </div>
                    <div className="form-check mb-3">
                        <input
                            type="checkbox"
                            name="is_driver"
                            className="form-check-input"
                            checked={userData.is_driver}
                            onChange={handleChange}
                        />
                        <label className="form-check-label">Register as a Driver</label>
                    </div>
                    <div className="mb-3">
                        <label className="form-label">Profile Picture</label>
                        <input
                            type="file"
                            name="profile_picture"
                            className="form-control"
                            accept="image/*"
                            onChange={handleFileChange}
                        />
                    </div>
                    <button type="submit" className="btn btn-primary w-100">
                        Register
                    </button>
                </form>
                <div className="text-center mt-3">
                    <small>Already have an account? <Link to="/login">Login here</Link></small>
                </div>
            </div>
        </div>
    );
};

export default Register;
