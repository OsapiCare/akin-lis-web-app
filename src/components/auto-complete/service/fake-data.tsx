export const FakeService = {
  getData() {
    return [
      { value: "Ana Silva", id: "1" },
      { value: "Carlos Santos", id: "2" },
      { value: "Beatriz Costa", id: "3" },
      { value: "Eduardo Almeida", id: "4" },
      { value: "Fernanda Oliveira", id: "5" },
      { value: "Gabriel Souza", id: "6" },
      { value: "Helena Pereira", id: "7" },
      { value: "Igor Ribeiro", id: "8" },
      { value: "Juliana Ferreira", id: "9" },
      { value: "Luiz Rocha", id: "10" },
      { value: "Mariana Mendes", id: "11" },
      { value: "Nathalia Duarte", id: "12" },
      { value: "Otávio Lima", id: "13" },
      { value: "Paula Monteiro", id: "14" },
      { value: "Ricardo Fonseca", id: "15" },
      { value: "Sara Martins", id: "16" },
      { value: "Thiago Barros", id: "17" },
      { value: "Vanessa Campos", id: "18" },
      { value: "Wesley Carvalho", id: "19" },
      { value: "Yasmin Neves", id: "20" },
    ];
  },

  getCountries() {
    return Promise.resolve(this.getData());
  },
};
