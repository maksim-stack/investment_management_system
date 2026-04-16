import { useState } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";

export default function Register() {
    const [form, setForm] = useState({
        name: "",
        email: "",
        password: "",
        riskProfile: "conservative",
    });

    const navigate = useNavigate();

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const [errors, setErrors] = useState<Record<string, string>>({});

    const handleSubmit = async () => {
        if (!validate()) {
            return;
        }

        try {
            await axios.post("http://localhost:3000/api/users/register", form);
            navigate("/login");
        } catch (err: any) {
            console.log(err.response?.data);

            const msg = err.response?.data?.message?.[0];
            if (msg) {
                setErrors({ general: msg });
            }
        }
    };

    const validate = () => {
        const newErrors: Record<string, string> = {};

        if (!form.name.trim()) {
            newErrors.name = "Name is required";
        }

        if (!form.email.trim()) {
            newErrors.email = "Email is required";
        } else if (!/\S+@\S+\.\S+/.test(form.email)) {
            newErrors.email = "Invalid email";
        }

        if (!form.password) {
            newErrors.password = "Password is required";
        } else if (form.password.length < 6) {
            newErrors.password = "Min 6 characters";
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    return (
        <div style={pageStyle}>
            <div style={cardStyle}>
                <h2 style={{ marginBottom: 20 }}>Create Account</h2>

                {/* NAME */}
                <div style={{ marginBottom: 10 }}>
                    <input
                        name="name"
                        placeholder="Name"
                        value={form.name}
                        onChange={handleChange}
                        style={{
                            ...inputStyle,
                            border: errors.name ? "1px solid red" : inputStyle.border,
                        }}
                    />
                    {errors.name && (
                        <div style={{ color: "red", fontSize: 12 }}>
                            {errors.name}
                        </div>
                    )}
                </div>

                {/* EMAIL */}
                <div style={{ marginBottom: 10 }}>
                    <input
                        name="email"
                        placeholder="Email"
                        value={form.email}
                        onChange={handleChange}
                        style={{
                            ...inputStyle,
                            border: errors.email ? "1px solid red" : inputStyle.border,
                        }}
                    />
                    {errors.email && (
                        <div style={{ color: "red", fontSize: 12 }}>
                            {errors.email}
                        </div>
                    )}
                </div>

                {/* PASSWORD */}
                <div style={{ marginBottom: 10 }}>
                    <input
                        name="password"
                        type="password"
                        placeholder="Password"
                        value={form.password}
                        onChange={handleChange}
                        style={{
                            ...inputStyle,
                            border: errors.password ? "1px solid red" : inputStyle.border,
                        }}
                    />
                    {errors.password && (
                        <div style={{ color: "red", fontSize: 12 }}>
                            {errors.password}
                        </div>
                    )}
                </div>

                {/* 🔥 RISK PROFILE UI */}
                <div style={{ marginBottom: 15 }}>
                    <div style={{ marginBottom: 6, fontWeight: "bold" }}>
                        Risk Profile
                    </div>

                    <div style={{ display: "flex", gap: 10 }}>
                        {[
                            { value: "conservative", label: "🟢 Conservative", color: "#22c55e" },
                            { value: "moderate", label: "🟡 Moderate", color: "#f59e0b" },
                            { value: "aggressive", label: "🔴 Aggressive", color: "#ef4444" },
                        ].map((item) => {
                            const isActive = form.riskProfile === item.value;

                            return (
                                <div
                                    key={item.value}
                                    onClick={() =>
                                        setForm({ ...form, riskProfile: item.value })
                                    }
                                    style={{
                                        ...riskCardStyle,
                                        border: isActive
                                            ? `2px solid ${item.color}`
                                            : "1px solid #ddd",
                                        background: isActive
                                            ? `${item.color}20`
                                            : "#fff",
                                    }}
                                    onMouseEnter={(e) =>
                                        (e.currentTarget.style.transform = "scale(1.05)")
                                    }
                                    onMouseLeave={(e) =>
                                        (e.currentTarget.style.transform = "scale(1)")
                                    }
                                >
                                    <div style={{ fontWeight: "bold" }}>
                                        {item.label}
                                    </div>

                                    <div style={riskTextStyle}>
                                        {item.value === "conservative" && "Low risk"}
                                        {item.value === "moderate" && "Balanced"}
                                        {item.value === "aggressive" && "High risk"}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                <button onClick={handleSubmit} style={buttonStyle}>
                    Register
                </button>

                <div style={{ marginTop: 15, textAlign: "center" }}>
                    <span>Already have an account? </span>
                    <Link to="/login" style={{ color: "#3b82f6" }}>
                        Login
                    </Link>
                </div>
            </div>
        </div>
    );
}

/* STYLES */

const pageStyle: React.CSSProperties = {
    height: "100vh",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    background: "linear-gradient(135deg, #0f172a, #1e293b)",
};

const cardStyle: React.CSSProperties = {
    width: 360,
    padding: 24,
    borderRadius: 16,
    background: "#fff",
    boxShadow: "0 10px 30px rgba(0,0,0,0.3)",
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

const riskCardStyle: React.CSSProperties = {
    flex: 1,
    padding: 10,
    borderRadius: 10,
    cursor: "pointer",
    textAlign: "center",
    transition: "all 0.2s ease",
};

const riskTextStyle: React.CSSProperties = {
    fontSize: 11,
    marginTop: 4,
    color: "#555",
};