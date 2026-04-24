export const initialCategories = [
  "Geografía",
  "Historia",
  "Sociales",
  "Naturales",
  "Prácticas del Lenguaje",
  "Inglés",
  "Taller",
  "Electrónica",
  "Notebooks",
  "Equipamiento"
];

export const initialBooks = [
  {
    id: 1,
    title: "Geografía Universal",
    author: "Juan Pérez",
    description: "Un recorrido completo por los continentes y sus culturas.",
    category: "Geografía",
    available_count: 5,
    total_count: 5,
    image: "https://images.unsplash.com/photo-1521295121783-8a321d551ad2?auto=format&fit=crop&q=80&w=400",
    type: "book",
    typeCode: "001",
    categoryCode: "001",
    itemCode: "001"
  },
  {
    id: 2,
    title: "Historia Argentina",
    author: "Felipe Pigna",
    description: "Los mitos de la historia argentina explicados para jóvenes.",
    category: "Historia",
    available_count: 2,
    total_count: 3,
    image: "https://images.unsplash.com/photo-1505664194779-8beaceb93744?auto=format&fit=crop&q=80&w=400",
    type: "book",
    typeCode: "001",
    categoryCode: "002",
    itemCode: "001"
  },
  {
    id: 101,
    title: "Notebook Lenovo 01",
    author: "Escuela",
    description: "Notebook para uso escolar en aula.",
    category: "Notebooks",
    available_count: 1,
    total_count: 1,
    image: "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?auto=format&fit=crop&q=80&w=400",
    type: "equipment",
    typeCode: "002",
    categoryCode: "010",
    itemCode: "001"
  }
];

export const initialStudents = [
  { id: 1, name: "Lucas García", grade: "1°A", email: "lucas@example.com" },
  { id: 2, name: "Marta Rodríguez", grade: "1°B", email: "marta@example.com" },
  { id: 3, name: "Julián Martínez", grade: "2°A", email: "julian@example.com" }
];

export const initialLoans = [
  {
    id: 1,
    bookId: 2,
    studentId: 1,
    loanDate: "2024-04-10",
    returnDate: null,
    status: "active",
    observations: ""
  }
];

export const initialAdmins = [
  { id: 1, username: "ipavelek", password: "1234" }
];

export const initialCourses = ["1°A", "1°B", "1°C", "2°A", "2°B", "2°C"];
