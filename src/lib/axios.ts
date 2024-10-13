import axios from "axios";

export const API_BASE_URL = "https://magnetic-buzzard-osapicare-a83d5229.koyeb.app";

export const ___api = axios.create({
  baseURL: API_BASE_URL,
});

/*
api.get('/endpoint')
  .then(response => {
    console.log(response.data);
  })
  .catch(error => {
    console.error('Erro:', error);
  });

// Para fazer uma requisição POST
api.post('/endpoint', { dados: 'exemplo' })
  .then(response => {
    console.log(response.data);
  })
  .catch(error => {
    console.error('Erro:', error);
  });
  */
