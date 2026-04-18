// src/pages/Investments.tsx
import { useEffect, useState } from "react";
import {
    getMyInvestments,
    createInvestment,
    deleteInvestment,
    getSummary,
    updateInvestment,
} from "../api/investments";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

type InvestmentForm = {
    asset: string;
    type: string;
    purchasePrice: string;
    currentPrice: string;
    quantity: string;
    notes: string;
};

export default function Investments() {
    const [editId, setEditId] = useState<number | null>(null);
    const [editAsset, setEditAsset] = useState("");
    const [editQuantity, setEditQuantity] = useState(0);
    const [editPurchasePrice, setEditPurchasePrice] = useState(0);
    const [editCurrentPrice, setEditCurrentPrice] = useState(0);

    const [data, setData] = useState<any[]>([]);
    const [summary, setSummary] = useState<any>(null);

    const [columns, setColumns] = useState(3);

    const [errors, setErrors] = useState<Record<string, string>>({});

    const validate = () => {
        const newErrors: any = {};

        if (!form.asset.trim()) {
            newErrors.asset = "Asset is required";
        }

        if (isNaN(Number(form.purchasePrice)) || Number(form.purchasePrice) <= 0.01) {
            newErrors.purchasePrice = "Enter valid price (> 0.01)";
        }

        if (isNaN(Number(form.currentPrice)) || Number(form.currentPrice) <= 0.01) {
            newErrors.currentPrice = "Enter valid price (> 0.01)";
        }

        if (isNaN(Number(form.quantity)) || Number(form.quantity) <= 0.0001) {
            newErrors.quantity = "Enter valid quantity (> 0.0001)";
        }

        setErrors(newErrors);

        return Object.keys(newErrors).length === 0;
    };

    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
    ) => {
        const { name, value } = e.target;

        const numericFields = [
            "purchasePrice",
            "currentPrice",
            "quantity",
        ];

        if (numericFields.includes(name)) {
            const isValidNumber = value === "" || !isNaN(Number(value));

            setErrors((prev) => ({
                ...prev,
                [name]: isValidNumber ? "" : "Must be a number",
            }));
        }

        setForm((prev) => ({
            ...prev,
            [name]: numericFields.includes(name)
                ? value // оставляем строку для UX
                : value,
        }));
    };

    const [form, setForm] = useState<InvestmentForm>({
        asset: "",
        type: "crypto",
        purchasePrice: "",
        currentPrice: "",
        quantity: "",
        notes: "",
    });

    const { logout} = useAuth();
    const navigate = useNavigate();

    const  userProfile = useNavigate();

    const handleLogout = () => {
        logout();
        navigate("/login");
    }

    const handleProfile = () => {
        userProfile("/profile");
    };

    const loadData = async () => {
        console.log("loading investments...");
        const res = await getMyInvestments();
        console.log(res);
        setData(res.data);
    };

    const loadSummary = async () => {
        const res = await getSummary();
        setSummary(res.data);
    };

    const startEdit = (inv: any) => {
        setEditId(inv.id);
        setEditAsset(inv.asset);
        setEditQuantity(inv.quantity);
        setEditPurchasePrice(inv.purchasePrice);
        setEditCurrentPrice(inv.currentPrice);
    };

    useEffect(() => {
        const updateColumns = () => {
            if (window.innerWidth < 600) {
                setColumns(1);
            } else if (window.innerWidth < 1024) {
                setColumns(2);
            } else {
                setColumns(3);
            }
        };

        loadData();
        loadSummary();
        updateColumns();
        window.addEventListener("resize", updateColumns);

        return () => window.removeEventListener("resize", updateColumns);
    }, []);

    const handleCreate = async () => {
        const token = localStorage.getItem("token");
        if (!validate()) return;
        if (!token) return;

        await createInvestment({
            ...form,
            purchasePrice: Number(form.purchasePrice),
            currentPrice: Number(form.currentPrice),
            quantity: Number(form.quantity),
        });

        setForm({
            asset: "",
            type: "crypto",
            purchasePrice: "",
            currentPrice: "",
            quantity: "",
            notes: "",
        });

        setErrors({
            asset: "",
            purchasePrice: "",
            currentPrice: "",
            quantity: "",
        })

        loadData();
        loadSummary();
    };

    const handleDelete = async (id: number) => {
        await deleteInvestment(id);
        loadData();
        loadSummary();
    };

    const handleUpdate = async () => {
        if (!editId) return;

        await updateInvestment(editId, {
            asset: editAsset,
            quantity: editQuantity,
            purchasePrice: editPurchasePrice,
            currentPrice: editCurrentPrice,
        });

        setEditId(null);
        setEditAsset("");
        setEditQuantity(0);
        setEditPurchasePrice(0);
        setEditCurrentPrice(0);

        loadData();
        loadSummary();
    };

    return (
        <div style={pageStyle}>
            <button onClick={handleLogout} style={logoutBtn}>
                Logout
            </button>

            <button onClick={handleProfile} style={profileBtn}>
                👤 Profile
            </button>

            <h2 style={titleStyle}>📊 Investment Dashboard</h2>

            {/* SUMMARY */}
            <div style={summaryWrap}>
                <div style={cardStyle}>
                    <h4>Total Invested</h4>
                    <p>{summary?.totalInvested ?? 0}</p>
                </div>

                <div style={cardStyle}>
                    <h4>Current Value</h4>
                    <p>{summary?.currentValue ?? 0}</p>
                </div>

                <div style={cardStyle}>
                    <h4>Profit</h4>
                    <p style={{ color: summary?.profitLoss >= 0 ? "#22c55e" : "#ef4444" }}>
                        {summary?.profitLoss ?? 0}
                    </p>
                </div>
            </div>

            {/* CREATE FORM */}
            <div style={formStyle}>
                <h3>➕ Create Investment</h3>

                <div style={{ marginBottom: 10 }}>
                    <input
                        name="asset"
                        placeholder="Asset"
                        value={form.asset}
                        onChange={handleChange}
                        style={inputStyle}
                    />
                    {errors.asset && <div style={{ color: "#ef4444", fontSize: 12 }}>{errors.asset}</div>}
                </div>

                <div style={{ marginBottom: 10 }}>
                    <select
                        name="type"
                        value={form.type}
                        onChange={handleChange}
                        style={inputStyle}
                    >
                        <option value="crypto">Crypto</option>
                        <option value="stock">Stock</option>
                        <option value="etf">ETF</option>
                    </select>
                </div>

                <input
                    name="purchasePrice"
                    placeholder="Purchase Price"
                    value={form.purchasePrice}
                    onChange={handleChange}
                    style={inputStyle}
                />
                {errors.purchasePrice && <div style={{ color: "#ef4444", fontSize: 12 }}>{errors.purchasePrice}</div>}

                <input
                    name="currentPrice"
                    placeholder="Current Price"
                    value={form.currentPrice}
                    onChange={handleChange}
                    style={inputStyle}
                />
                {errors.currentPrice && <div style={{ color: "#ef4444", fontSize: 12 }}>{errors.currentPrice}</div>}

                <input
                    name="quantity"
                    placeholder="Quantity"
                    value={form.quantity}
                    onChange={handleChange}
                    style={inputStyle}
                />
                {errors.quantity && <div style={{ color: "#ef4444", fontSize: 12 }}>{errors.quantity}</div>}

                <input
                    name="notes"
                    placeholder="Notes"
                    value={form.notes}
                    onChange={handleChange}
                    style={inputStyle}
                />

                <button onClick={handleCreate} style={buttonStyle}>
                    Create Investment
                </button>
            </div>

            {/* EDIT */}
            {editId && (
                <div style={editStyle}>
                    <h3>Edit Investment</h3>

                    <input value={editAsset} onChange={(e) => setEditAsset(e.target.value)} style={inputStyle} />
                    <input value={editQuantity} onChange={(e) => setEditQuantity(Number(e.target.value))} style={inputStyle} />
                    <input value={editPurchasePrice} onChange={(e) => setEditPurchasePrice(Number(e.target.value))} style={inputStyle} />
                    <input value={editCurrentPrice} onChange={(e) => setEditCurrentPrice(Number(e.target.value))} style={inputStyle} />

                    <div style={{ display: "flex", gap: 10 }}>
                        <button onClick={handleUpdate} style={buttonStyle}>Save</button>
                        <button onClick={() => setEditId(null)} style={{ ...buttonStyle, background: "#64748b" }}>
                            Cancel
                        </button>
                    </div>
                </div>
            )}

            {/* GRID */}
            <div
                style={{
                    display: "grid",
                    gridTemplateColumns: `repeat(${columns}, 1fr)`,
                    gap: 12,
                    marginTop: 20,
                }}
            >
                {data.map((inv) => {
                    const invested = Number(inv.purchasePrice) * Number(inv.quantity);
                    const current = Number(inv.currentPrice) * Number(inv.quantity);
                    const profit = current - invested;
                    const profitPercent = invested ? ((profit / invested) * 100).toFixed(2) : "0";

                    return (
                        <div key={inv.id} style={invCard}>
                            <h3>{inv.asset}</h3>

                            <p>📊 Type: {inv.type}</p>
                            <p>📦 Qty: {inv.quantity}</p>

                            <p>💰 Invested: {invested.toFixed(2)}</p>
                            <p>📈 Current: {current.toFixed(2)}</p>

                            <p style={{ color: profit >= 0 ? "#22c55e" : "#ef4444", fontWeight: 600 }}>
                                Profit: {profit.toFixed(2)} ({profitPercent}%)
                            </p>

                            <div style={{ display: "flex", gap: 8 }}>
                                <button onClick={() => startEdit(inv)} style={buttonStyle}>
                                    Edit
                                </button>
                                <button onClick={() => handleDelete(inv.id)} style={{ ...buttonStyle, background: "#ef4444" }}>
                                    Delete
                                </button>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

/* ================= STYLES ================= */

const pageStyle: React.CSSProperties = {
    padding: 20,
    background: "#0f172a",
    minHeight: "100vh",
    color: "#e2e8f0",
    fontFamily: "Inter, sans-serif",
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

const profileBtn: React.CSSProperties = {
    position: "absolute",
    top: 20,
    right: 110,
    padding: "8px 12px",
    background: "#3b82f6",
    color: "white",
    border: "none",
    borderRadius: 10,
    cursor: "pointer",
};

const titleStyle: React.CSSProperties = {
    marginBottom: 20,
    fontSize: 24,
    fontWeight: 700,
};

const summaryWrap: React.CSSProperties = {
    display: "flex",
    gap: 12,
    marginBottom: 20,
};

const cardStyle: React.CSSProperties = {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    background: "#1e293b",
    border: "1px solid #334155",
};

const formStyle: React.CSSProperties = {
    marginTop: 20,
    padding: 16,
    borderRadius: 12,
    background: "#1e293b",
    border: "1px solid #334155",
};

const editStyle: React.CSSProperties = {
    marginTop: 20,
    padding: 16,
    borderRadius: 12,
    background: "#0b253a",
    border: "1px solid #3b82f6",
};

const inputStyle: React.CSSProperties = {
    width: "100%",
    padding: 10,
    marginBottom: 10,
    borderRadius: 8,
    border: "1px solid #334155",
    background: "#0f172a",
    color: "#e2e8f0",
    outline: "none",
};

const buttonStyle: React.CSSProperties = {
    padding: "10px 14px",
    background: "#22c55e",
    color: "#fff",
    border: "none",
    borderRadius: 8,
    cursor: "pointer",
};

const invCard: React.CSSProperties = {
    padding: 14,
    borderRadius: 12,
    background: "#1e293b",
    border: "1px solid #334155",
};