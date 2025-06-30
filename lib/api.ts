import axios from "axios";

export const baseURL: string = `https://api.manwhitaroes.com`;

export const api = axios.create({
  // baseURL: "https://manwhit.lemonwares.com.ng/api",
  baseURL: "https://api.manwhitaroes.com",
  headers: {
    "Content-Type": "application/json",
  },
});
