import axios from "axios";

export const api = axios.create({
  baseURL: "https://manwhit.lemonwares.com.ng/api",
  headers: {
    "Content-Type": "application/json",
  },
});
