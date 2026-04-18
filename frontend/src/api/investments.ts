// src/api/investments.ts
import { api } from "./axios";

export const getMyInvestments = () => api.get("/investments/me");

export const createInvestment = (data: any) =>
    api.post("/investments", data);

export const updateInvestment = (id: number, data: any) =>
    api.patch(`/investments/${id}`, data);

export const deleteInvestment = (id: number) =>
    api.delete(`/investments/${id}`);

export const getSummary = () =>
    api.get("/investments/me/summary");