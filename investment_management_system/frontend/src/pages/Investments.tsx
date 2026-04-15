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

    const { logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate("/login");
    }

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
        <div style={{ padding: 20, background: "#f5f6fa", minHeight: "100vh" }}>

            <button
                onClick={handleLogout}
                style={{
                    position: "absolute",
                    top: 20,
                    right: 20,
                    padding: "8px 12px",
                    background: "#ef4444",
                    color: "white",
                    border: "none",
                    borderRadius: 8,
                    cursor: "pointer",
                }}
            >
                Logout
            </button>

            <h2 style={{ marginBottom: 20 }}>📊 Investment Dashboard</h2>

            {/* SUMMARY */}
            <div style={{ display: "flex", gap: 12, marginBottom: 20 }}>
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
                    <p style={{ color: summary?.profitLoss >= 0 ? "green" : "red" }}>
                        {summary?.profitLoss ?? 0}
                    </p>
                </div>
            </div>

            {/* CREATE FORM */}
            <div style={formStyle}>
                <h3>➕ Create Investment</h3>

                {/* ASSET */}
                <div style={{ marginBottom: 10 }}>
                    <input
                        name="asset"
                        placeholder="Asset"
                        value={form.asset}
                        onChange={handleChange}
                        style={{
                            ...inputStyle,
                            border: errors.asset ? "1px solid red" : inputStyle.border,
                        }}
                    />
                    {errors.asset && (
                        <div style={{ color: "red", fontSize: 12, marginTop: 4 }}>
                            {errors.asset}
                        </div>
                    )}
                </div>

                {/* TYPE */}
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

                {/* PURCHASE PRICE */}
                <div style={{ marginBottom: 10 }}>
                    <input
                        name="purchasePrice"
                        type="text"
                        placeholder="Purchase Price"
                        value={form.purchasePrice}
                        onChange={handleChange}
                        style={{
                            ...inputStyle,
                            border: errors.purchasePrice ? "1px solid red" : inputStyle.border,
                        }}
                    />
                    {errors.purchasePrice && (
                        <div style={{ color: "red", fontSize: 12, marginTop: 4 }}>
                            {errors.purchasePrice}
                        </div>
                    )}
                </div>

                {/* CURRENT PRICE */}
                <div style={{ marginBottom: 10 }}>
                    <input
                        name="currentPrice"
                        type="text"
                        placeholder="Current Price"
                        value={form.currentPrice}
                        onChange={handleChange}
                        style={{
                            ...inputStyle,
                            border: errors.currentPrice ? "1px solid red" : inputStyle.border,
                        }}
                    />
                    {errors.currentPrice && (
                        <div style={{ color: "red", fontSize: 12, marginTop: 4 }}>
                            {errors.currentPrice}
                        </div>
                    )}
                </div>

                {/* QUANTITY */}
                <div style={{ marginBottom: 10 }}>
                    <input
                        name="quantity"
                        type="text"
                        placeholder="Quantity"
                        value={form.quantity}
                        onChange={handleChange}
                        style={{
                            ...inputStyle,
                            border: errors.quantity ? "1px solid red" : inputStyle.border,
                        }}
                    />
                    {errors.quantity && (
                        <div style={{ color: "red", fontSize: 12, marginTop: 4 }}>
                            {errors.quantity}
                        </div>
                    )}
                </div>

                {/* NOTES */}
                <div style={{ marginBottom: 10 }}>
                    <input
                        name="notes"
                        placeholder="Notes"
                        value={form.notes}
                        onChange={handleChange}
                        style={inputStyle}
                    />
                </div>

                {/* BUTTON */}
                <button onClick={handleCreate} style={buttonStyle}>
                    Create Investment
                </button>
            </div>

            {/* EDIT FORM */}
            {editId && (
                <div style={editStyle}>
                    <h3>Edit Investment</h3>

                    <input
                        value={editAsset}
                        onChange={(e) => setEditAsset(e.target.value)}
                        style={inputStyle}
                    />

                    <input
                        type="number"
                        value={editQuantity}
                        onChange={(e) => setEditQuantity(Number(e.target.value))}
                        placeholder="Quantity"
                        style={inputStyle}
                    />

                    <input
                        type="number"
                        value={editPurchasePrice}
                        onChange={(e) => setEditPurchasePrice(Number(e.target.value))}
                        placeholder="Purchase Price"
                        style={inputStyle}
                    />

                    <input
                        type="number"
                        value={editCurrentPrice}
                        onChange={(e) => setEditCurrentPrice(Number(e.target.value))}
                        placeholder="Current Price"
                        style={inputStyle}
                    />

                    <div style={{ display: "flex", gap: 10 }}>
                        <button onClick={handleUpdate} style={buttonStyle}>
                            Save
                        </button>
                        <button onClick={() => setEditId(null)}>
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
                }}
            >
                {data.map((inv) => {
                    const invested =
                        Number(inv.purchasePrice) * Number(inv.quantity);
                    const current =
                        Number(inv.currentPrice) * Number(inv.quantity);
                    const profit = current - invested;
                    const profitPercent = invested
                        ? ((profit / invested) * 100).toFixed(2)
                        : "0";

                    return (
                        <div key={inv.id} style={invCard}>
                            <h3>{inv.asset}</h3>

                            <p>📊 Type: {inv.type}</p>
                            <p>📦 Qty: {inv.quantity}</p>

                            <p>💰 Invested: {invested.toFixed(2)}</p>
                            <p>📈 Current: {current.toFixed(2)}</p>

                            <p
                                style={{
                                    color: profit >= 0 ? "green" : "red",
                                    fontWeight: "bold",
                                }}
                            >
                                Profit: {profit.toFixed(2)} ({profitPercent}%)
                            </p>

                            <div style={{ display: "flex", gap: 8 }}>
                                <button onClick={() => startEdit(inv)}>
                                    Edit
                                </button>
                                <button onClick={() => handleDelete(inv.id)}>
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

/* STYLES */

const cardStyle: React.CSSProperties = {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    border: "1px solid #ddd",
    background: "#fff",
    boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
};

const formStyle: React.CSSProperties = {
    padding: 16,
    borderRadius: 12,
    border: "1px solid #ddd",
    marginBottom: 20,
    background: "#fff",
};

const editStyle: React.CSSProperties = {
    padding: 16,
    borderRadius: 12,
    border: "1px solid #007bff",
    marginBottom: 20,
    background: "#eef6ff",
};

const inputStyle: React.CSSProperties = {
    display: "block",
    width: "100%",
    padding: 8,
    marginBottom: 10,
};

const buttonStyle: React.CSSProperties = {
    padding: "8px 16px",
    background: "#111",
    color: "#fff",
    border: "none",
    borderRadius: 6,
    cursor: "pointer",
};

const invCard: React.CSSProperties = {
    padding: 12,
    borderRadius: 12,
    border: "1px solid #ddd",
    background: "#fff",
    boxShadow: "0 1px 6px rgba(0,0,0,0.05)",
};