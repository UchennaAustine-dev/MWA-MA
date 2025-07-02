import axios from "axios";

export const baseURL: string = `https://api.manwhitaroes.com`;
// export const baseURL = "http://192.168.1.100:8000";

export const api = axios.create({
  // baseURL: "http://192.168.1.100:8000",
  baseURL: "https://api.manwhitaroes.com",
  headers: {
    "Content-Type": "application/json",
  },
});
