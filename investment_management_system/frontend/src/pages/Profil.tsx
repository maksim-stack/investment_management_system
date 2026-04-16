import axios from "axios";
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { useAuth } from "../context/AuthContext";

type RiskType = "conservative" | "moderate" | "aggressive";

type Investment = {
    id: number;
    asset: string;
    type: string;
    quantity: number;
    purchasePrice: number;
    currentPrice: number;
    purchaseDate: string;
};

type Profile = {
    id: number;
    name: string;
    email: string;
    riskProfile: {
        type: RiskType;
        description: string;
    };
    stats: {
        totalInvested: number;
        currentValue: number;
        profit: number;
        profitPercent: number;
        investmentsCount: number;
    };
    recentInvestments: Investment[];
}

export default function Profile() {
    const [profile, setProfile] = useState<Profile | null>(null);
    const [loading, setLoading] = useState(true);

    const { logout } = useAuth();
    const navigator = useNavigate();

    const [showSettings, setShowSettings] = useState(false);

    const [editName, setEditName] = useState("");
    const [editEmail, setEditEmail] = useState("");
    const [editRisk, setEditRisk] = useState("");
    const [saving, setSaving] = useState(false);
    const [deleting, setDeleting] = useState(false);

    const handleLogout = () => {
        logout();
        navigator("/login");
    };

    useEffect(() => {
        const loadProfile = async () => {
            try {
                const res = await axios.get(
                    "http://localhost:3000/api/users/me",
                    {
                        headers: {
                            Authorization: `Bearer ${localStorage.getItem("token")}`,
                        },
                    }
                );

                setProfile(res.data);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        loadProfile();
    }, []);

    useEffect(() => {
        if (profile) {
            setEditName(profile.name);
            setEditEmail(profile.email);
            setEditRisk(profile.riskProfile.type);
        }
    }, [profile]);

    const handleUpdateProfile = async () => {
        try {
            setSaving(true);

            const res = await axios.patch(
                "http://localhost:3000/api/users/me",
                {
                    name: editName,
                    email: editEmail,
                    riskProfile: editRisk,
                },
                {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem("token")}`,
                    },
                }
            );
            setProfile(res.data);
            setShowSettings(false);
        } catch (err) {
            console.error(err);
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async () => {
        try {
            setDeleting(true);

            await axios.delete("http://localhost:3000/api/users/me", {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem("token")}`,
                },
            });

            localStorage.removeItem("token");
            navigator("/login");
        } catch (err) {
            console.error(err);
        } finally {
            setDeleting(false);
        }
    };   

    if (loading) return <p>Loading...</p>;
    if (!profile) return <p>No data</p>;

    const isProfit = profile.stats.profit >= 0;

    return (
        <div style={pageStyle}>
            <button onClick={handleLogout} style={logoutBtn}>
                Logout
            </button>

            <button
                onClick={() => navigator("/investments")} style={navBtn}>
                📈 Back
            </button>

            <button onClick={() => setShowSettings(true)} style={settingsBtn}>
                ⚙️ Settings
            </button>

            {showSettings && (
                <div style={modalOverlay}>
                    <div style={modal}>
                        <h2>⚙️ Settings</h2>

                        <label>Name</label>
                        <input
                            value={editName}
                            onChange={(e) => setEditName(e.target.value)}
                            style={input}
                        />

                        <label>Email</label>
                        <input
                            value={editEmail}
                            onChange={(e) => setEditEmail(e.target.value)}
                            style={input}
                        />

                        <label>Risk</label>
                        <select
                            value={editRisk}
                            onChange={(e) => setEditRisk(e.target.value)}
                            style={input}
                        >
                            <option value="conservative">Conservative</option>
                            <option value="moderate">Moderate</option>
                            <option value="aggressive">Aggressive</option>
                        </select>

                        <div style={{ display: "flex", gap: 35 , justifyContent: "center"}}>
                            <button onClick={handleUpdateProfile} style={saveBtn} disabled={saving}>
                                {saving ? "Saving..." : "Save"}
                            </button>

                            <button onClick={handleDelete} style={deleteBtn} disabled={deleting}>
                                {deleting ? "Deleting..." : "Delete"}
                            </button>

                            <button onClick={() => setShowSettings(false)} style={cancelBtn}>
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <div style={containerStyle}>
                <h1 style={titleStyle}>👤 Profile</h1>

                <div style={cardStyle}>
                    <p><b>Name:</b> {profile.name}</p>
                    <p><b>Email:</b> {profile.email}</p>

                    <p>
                        <b>Risk:</b>{" "}
                        <span style={riskBadge}>
                            {profile.riskProfile.type}
                        </span>{" "}
                        - {profile.riskProfile.description}
                    </p>
                </div>

                <h2 style={sectionTitle}>📊 Portfolio</h2>

                <div style={statsCard}>
                    <div style={statRow}>
                        <span>Total Invested</span>
                        <b>${profile.stats.totalInvested.toFixed(2)}</b>
                    </div>

                    <div style={statRow}>
                        <span>Current Value</span>
                        <b>${profile.stats.currentValue.toFixed(2)}</b>
                    </div>

                    <div
                        style={{
                            ...statRow,
                            color: isProfit ? "#22c55e" : "#ef4444",
                            fontWeight: "bold",
                        }}
                    >
                        <span>Profit</span>
                        <span>
                            ${profile.stats.profit.toFixed(2)} (
                            {profile.stats.profitPercent.toFixed(2)}%)
                        </span>
                    </div>

                    <div style={statRow}>
                        <span>Investments</span>
                        <b>{profile.stats.investmentsCount}</b>
                    </div>
                </div>

                <h2 style={sectionTitle}>🕒 Recent Investments</h2>

                {profile.recentInvestments.length === 0 ? (
                    <p style={{ opacity: 0.6 }}>No investments yet</p>
                ) : (
                    <div style={listStyle}>
                        {profile.recentInvestments.map((inv: any) => (
                            <div key={inv.id} style={investmentCard}>
                                <div style={investmentTop}>
                                    <b>{inv.asset}</b>
                                    <span style={typeBadge}>{inv.type}</span>
                                </div>

                                <div style={investmentBottom}>
                                    <span>Qty: {inv.quantity}</span>
                                    <span>${inv.currentPrice}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

/* STYLES */
const pageStyle: React.CSSProperties = {
    background: "#0f172a",
    minHeight: "100vh",
    padding: "40px 20px",
    color: "#e2e8f0",
    fontFamily: "Arial",
};

const containerStyle: React.CSSProperties = {
    maxWidth: "800px",
    margin: "0 auto",
};

const navBtn: React.CSSProperties = {
    position: "absolute",
    top: 20,
    right: 960,
    padding: "8px 12px",
    background: "#3b82f6",
    color: "white",
    border: "none",
    borderRadius: 10,
    cursor: "pointer",
};

const logoutBtn: React.CSSProperties = {
    position: "absolute",
    top: 20,
    right: 20,
    padding: "8px 12px",
    background: "#ef4444",
    color: "white",
    border: "none",
    borderRadius: 10,
    cursor: "pointer",
};

const titleStyle: React.CSSProperties = {
    fontSize: "28px",
    marginBottom: "20px",
};

const sectionTitle: React.CSSProperties = {
    marginTop: "30px",
    marginBottom: "10px",
    fontSize: "18px",
    opacity: 0.9,
};

const cardStyle: React.CSSProperties = {
    background: "#1e293b",
    padding: "15px",
    borderRadius: "12px",
    marginBottom: "20px",
};

const statsCard: React.CSSProperties = {
    background: "#1e293b",
    padding: "15px",
    borderRadius: "12px",
};

const statRow: React.CSSProperties = {
    display: "flex",
    justifyContent: "space-between",
    marginBottom: "10px",
};

const listStyle: React.CSSProperties = {
    display: "flex",
    flexDirection: "column",
    gap: "10px",
};

const investmentCard: React.CSSProperties = {
    background: "#1e293b",
    padding: "12px",
    borderRadius: "10px",
};

const investmentTop: React.CSSProperties = {
    display: "flex",
    justifyContent: "space-between",
    marginBottom: "6px",
};

const investmentBottom: React.CSSProperties = {
    display: "flex",
    justifyContent: "space-between",
    opacity: 0.8,
};

const riskBadge: React.CSSProperties = {
    background: "#334155",
    padding: "2px 8px",
    borderRadius: "6px",
    marginLeft: "5px",
    fontSize: "12px",
};

const typeBadge: React.CSSProperties = {
    background: "#334155",
    padding: "2px 6px",
    borderRadius: "6px",
    fontSize: "12px",
};

const settingsBtn: React.CSSProperties = {
    position: "absolute",
    top: 20,
    right: 100,
    padding: "8px 12px",
    background: "#6366f1",
    color: "white",
    border: "none",
    borderRadius: 10,
    cursor: "pointer",
};

const modalOverlay: React.CSSProperties = {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: "rgba(0,0,0,0.6)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
};

const modal: React.CSSProperties = {
    background: "#1e293b",
    padding: 20,
    borderRadius: 12,
    width: 300,
};

const input: React.CSSProperties = {
    width: "100%",
    padding: 8,
    marginBottom: 10,
    borderRadius: 6,
    border: "1px solid #334155",
    background: "#0f172a",
    color: "white",
};

const saveBtn: React.CSSProperties = {
    background: "#22c55e",
    color: "white",
    padding: "6px 10px",
    border: "none",
    borderRadius: 6,
};

const deleteBtn: React.CSSProperties = {
    background: "#ef4444",
    color: "white",
    padding: "6px 10px",
    border: "none",
    borderRadius: 6,
};

const cancelBtn: React.CSSProperties = {
    background: "#adb9ff85",
    color: "white",
    padding: "6px 10px",
    border: "none",
    borderRadius: 6,
}