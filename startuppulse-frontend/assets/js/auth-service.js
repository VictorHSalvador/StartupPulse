/*
  Serviço de autenticação local do MVP.
  Ele usa localStorage para cadastrar usuários e manter a sessão no navegador.
  Isso é suficiente para o estágio atual do projeto, sem backend.
*/
window.AuthService = (() => {
  /* Chave onde a lista de usuários ficará salva no navegador. */
  const USERS_KEY = "sp_users";

  /* Chave onde a sessão atual ficará salva. */
  const SESSION_KEY = "sp_session";

  /*
    Lê todos os usuários salvos no navegador.
    Se ainda não existir nada, retorna um array vazio.
  */
  const getUsers = () => {
    const rawUsers = localStorage.getItem(USERS_KEY);

    if (!rawUsers) {
      return [];
    }

    try {
      const users = JSON.parse(rawUsers);
      return Array.isArray(users)
        ? users.map((user) => ({
            ...user,
            role: user.role || (user.id === "user-001" ? "Gestor" : "Agente"),
            status: user.status || "Ativo"
          }))
        : [];
    } catch (error) {
      localStorage.removeItem(USERS_KEY);
      return [];
    }
  };

  /*
    Salva a lista completa de usuários no navegador.
    Recebe um array e converte para JSON.
  */
  const saveUsers = (users) => {
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
  };

  /*
    Cria um usuário padrão para não deixar o sistema sem acesso.
    Só roda quando ainda não existe nenhum usuário salvo.
  */
  const seedDefaultUser = () => {
    const users = getUsers();

    if (users.length > 0) {
      return;
    }

    const defaultUser = {
      id: "user-001",
      name: "Administrador",
      email: "admin@incubadora.com",
      password: "123456",
      role: "Gestor",
      status: "Ativo",
      createdAt: new Date().toISOString()
    };

    saveUsers([defaultUser]);
  };

  /*
    Cadastra um novo usuário no navegador.
    Faz validação simples para impedir e-mail duplicado.
  */
  const registerUser = ({ name, email, password }) => {
    const users = getUsers();

    const normalizedEmail = email.trim().toLowerCase();

    const existingUser = users.find(
      (user) => user.email.toLowerCase() === normalizedEmail
    );

    if (existingUser) {
      throw new Error("Já existe um usuário cadastrado com este e-mail.");
    }

    const newUser = {
      id: `user-${Date.now()}`,
      name: name.trim(),
      email: normalizedEmail,
      password: password,
      role: "Agente",
      status: "Ativo",
      createdAt: new Date().toISOString()
    };

    users.push(newUser);
    saveUsers(users);

    return newUser;
  };

  /*
    Faz o login do usuário.
    Procura um usuário com e-mail e senha compatíveis.
  */
  const login = ({ email, password }) => {
    const users = getUsers();

    const normalizedEmail = email.trim().toLowerCase();

    const user = users.find(
      (item) =>
        item.email.toLowerCase() === normalizedEmail &&
        item.status !== "Inativo" &&
        item.password === password
    );

    if (!user) {
      throw new Error("E-mail ou senha inválidos.");
    }

    const sessionUser = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role || "Agente"
    };

    localStorage.setItem(SESSION_KEY, JSON.stringify(sessionUser));

    return sessionUser;
  };

  /*
    Retorna a sessão atual, se existir.
    Se não existir sessão, retorna null.
  */
  const getSession = () => {
    const rawSession = localStorage.getItem(SESSION_KEY);

    if (!rawSession) {
      return null;
    }

    try {
      const session = JSON.parse(rawSession);
      return {
        ...session,
        role: session.role || (session.id === "user-001" ? "Gestor" : "Agente")
      };
    } catch (error) {
      localStorage.removeItem(SESSION_KEY);
      return null;
    }
  };

  /*
    Remove a sessão atual do navegador.
    Usado no logout.
  */
  const logout = () => {
    localStorage.removeItem(SESSION_KEY);
  };

  /*
    Indica se existe usuário autenticado.
  */
  const isAuthenticated = () => {
    return !!getSession();
  };

  /*
    API pública do serviço.
  */
  return {
    getUsers,
    seedDefaultUser,
    registerUser,
    login,
    getSession,
    logout,
    isAuthenticated
  };
})();
