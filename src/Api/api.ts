// /services/api.ts
import axios from "axios";

export const api = axios.create({
  baseURL: "https://mature-meggi-osapicare-33f3af08.koyeb.app",
  //baseURL: "https://magnetic-buzzard-osapicare-a83d5229.koyeb.app",
  // baseURL: "https://drab-pig-osapicare-790df34d.koyeb.app/",
});

// export const api = axios.create({
//   baseURL: "http://localhost:3300",
// })

export const agentUrl = axios.create({
  baseURL: "https://chatkin.osapicare.com",
  // baseURL: "https://osapicare.pythonanywhere.com",
})
