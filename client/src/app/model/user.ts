export interface User {
    id: number,
    username: string;
    name: string;
    surname: string;
    password: string;
  }
  
  export const USERS: User[] = [
    { id: 0, username: 'admin',  name: '', surname: '',  password: 'password' },
    { id: 1, username: 'AndreaDominici',  name: '', surname: '', password: '12345' },
    { id: 2, username: 'PaoloCelada',  name: '', surname: '', password: '12345' },
  ];