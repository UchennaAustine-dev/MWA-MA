import axios from "axios";

export const api = axios.create({
  // baseURL: "https://manwhit.lemonwares.com.ng/api",
  baseURL: "https://api.manwhitaroes.com",
  headers: {
    "Content-Type": "application/json",
  },
});
