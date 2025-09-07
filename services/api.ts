import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";

const api = axios.create({
  baseURL: "http://192.168.0.102:5000/api", // base url
});

api.interceptors.request.use(async (config) => { // interceptor
  const token = await AsyncStorage.getItem("token"); // get token from async storage
  if (token) {
    config.headers.Authorization = `Bearer ${token}`; // add token to headers
  }
  return config; // return config
});

export default api;

