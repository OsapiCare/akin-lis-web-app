
interface User {
  access_token: string;
  id: string;
  refresh_token: string;
}
interface UserData {
  id: string;
  nome: string,
  email: string,
  senha: string,
  tipo: string,
  status: string
}

interface userDataLogged {
  id: string;
  nome: string,
  email: string,
  status: string,
  tipo: string,
  contacto_telefonico: string,
  id_unidade_de_saude: string,
  unidade_de_saude: {
    id: string,
    nome: string,
    endereco: string,
    descricao?: string,
    servicos?: string,
    horarios?: string,
    contacto_telefonico: string,
    email: string,
    rede_social: string,
    website: string,
    tipo: string,
    caminho_imagem?: string,
    criado_aos: Date,

  }
}