// src/routes/AppRouter.tsx
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "../pages/Login";
import Investments from "../pages/Investments";
import ProtectedRoute from "./ProtectedRoute";
import Register from "../pages/Register";

export default function AppRouter() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<Navigate to="/login" />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route
                    path="/investments"
                    element={
                        <ProtectedRoute>
                            <Investments />
                        </ProtectedRoute>
                    }
                />

            </Routes>
        </BrowserRouter>
    );
}