// src/pages/Login.tsx
import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";

export default function Login() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const navigate = useNavigate();

    useEffect(() => {
        const token = localStorage.getItem("token");

        if (token) {
            navigate("/investments");
        }
    }, []);

    const login = async () => {
        try {
            setLoading(true);
            setError("");

            const res = await axios.post("http://localhost:3000/api/auth/login", {
                email,
                password,
            });

            localStorage.setItem("token", res.data.access_token);

            window.location.href = "/investments";
        } catch (err: any) {
            setError("Invalid email or password");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={pageStyle}>
            <div style={cardStyle}>
                <h2 style={{ marginBottom: 10 }}>💰 Investment System</h2>
                <p style={{ marginBottom: 20, color: "#666" }}>
                    Login to your dashboard
                </p>

                <input
                    type="email"
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    style={inputStyle}
                />

                <input
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    style={inputStyle}
                />

                {error && <p style={errorStyle}>{error}</p>}

                <button
                    onClick={login}
                    disabled={loading}
                    style={buttonStyle}
                >
                    {loading ? "Logging in..." : "Login"}
                </button>

                <div style={{ marginTop: 10 }}>
                    <span>Don't have an account? </span>
                    <Link to="/register">Register</Link>
                </div>
            </div>
        </div>
    );
}

/* ================= STYLES ================= */

const pageStyle: React.CSSProperties = {
    height: "100vh",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    background: "linear-gradient(135deg, #0f172a, #1e293b)",
};

const cardStyle: React.CSSProperties = {
    width: 350,
    padding: 24,
    borderRadius: 16,
    background: "#fff",
    boxShadow: "0 10px 30px rgba(0,0,0,0.3)",
    textAlign: "center",
};

const inputStyle: React.CSSProperties = {
    width: "100%",
    padding: 10,
    marginBottom: 12,
    borderRadius: 8,
    border: "1px solid #ddd",
    outline: "none",
};

const buttonStyle: React.CSSProperties = {
    width: "100%",
    padding: 10,
    borderRadius: 8,
    border: "none",
    background: "#111",
    color: "#fff",
    cursor: "pointer",
    fontWeight: "bold",
};

const errorStyle: React.CSSProperties = {
    color: "red",
    marginBottom: 10,
};