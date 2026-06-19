/*
  Servico de autenticacao local do MVP.
  Usa localStorage como armazenamento JSON para usuarios e sessao.
*/
window.AuthService = (() => {
  const USERS_KEY = "sp_users";
  const SESSION_KEY = "sp_session";
  const SEED_VERSION_KEY = "sp_users_seed_version";
  const USER_SEED_VERSION = "2";

  const NAVIGATION_VIEWS = [
    "dashboard",
    "companies",
    "evaluations",
    "consultancies",
    "reports",
    "notifications"
  ];

  const DEFAULT_EVALUATOR_PERMISSIONS = [
    "dashboard",
    "companies",
    "evaluations"
  ];

  const normalizeRole = (role, userId) => {
    if (role === "Gestor" || userId === "user-001") {
      return "Gestor";
    }

    return "Avaliador";
  };

  const normalizePermissions = (user) => {
    const role = normalizeRole(user.role, user.id);

    if (role === "Gestor") {
      return [...NAVIGATION_VIEWS];
    }

    const permissions = Array.isArray(user.viewPermissions)
      ? user.viewPermissions
      : user.role === "Agente"
        ? [...DEFAULT_EVALUATOR_PERMISSIONS, "consultancies"]
        : DEFAULT_EVALUATOR_PERMISSIONS;

    const validPermissions = permissions.filter((view) =>
      NAVIGATION_VIEWS.includes(view)
    );

    return validPermissions.length
      ? [...new Set(validPermissions)]
      : [...DEFAULT_EVALUATOR_PERMISSIONS];
  };

  const normalizeUser = (user = {}) => {
    const role = normalizeRole(user.role, user.id);

    return {
      ...user,
      role,
      status: user.status || "Ativo",
      viewPermissions: normalizePermissions({ ...user, role })
    };
  };

  const getUsers = () => {
    const rawUsers = localStorage.getItem(USERS_KEY);

    if (!rawUsers) {
      return [];
    }

    try {
      const users = JSON.parse(rawUsers);
      return Array.isArray(users) ? users.map(normalizeUser) : [];
    } catch (error) {
      localStorage.removeItem(USERS_KEY);
      return [];
    }
  };

  const saveUsers = (users) => {
    localStorage.setItem(USERS_KEY, JSON.stringify(users.map(normalizeUser)));
  };

  const seedDefaultUser = () => {
    const existingUsers = getUsers();

    if (
      localStorage.getItem(SEED_VERSION_KEY) === USER_SEED_VERSION &&
      existingUsers.length > 0
    ) {
      return;
    }

    const createdAt = new Date().toISOString();
    const seedUsers = [
      {
        id: "user-001",
        name: "Fulano",
        email: "gestor@incubadora.com",
        password: "123456",
        role: "Gestor",
        status: "Ativo",
        viewPermissions: [...NAVIGATION_VIEWS],
        createdAt
      },
      {
        id: "user-002",
        name: "Fulana",
        email: "avaliador@incubadora.com",
        password: "123456",
        role: "Avaliador",
        status: "Ativo",
        viewPermissions: [
          "dashboard",
          "companies",
          "evaluations",
          "consultancies"
        ],
        createdAt
      },
      {
        id: "user-003",
        name: "Beltrano",
        email: "relatorios@incubadora.com",
        password: "123456",
        role: "Avaliador",
        status: "Ativo",
        viewPermissions: ["dashboard", "reports"],
        createdAt
      },
      {
        id: "user-004",
        name: "Ciclana",
        email: "agenda@incubadora.com",
        password: "123456",
        role: "Avaliador",
        status: "Ativo",
        viewPermissions: ["dashboard", "consultancies", "notifications"],
        createdAt
      }
    ];

    const currentUsers = existingUsers.map((user) =>
      user.email === "admin@incubadora.com"
        ? {
            ...user,
            name: user.name || "Fulano",
            email: "gestor@incubadora.com"
          }
        : user
    );
    const usersByEmail = new Map(
      currentUsers.map((user) => [user.email.toLowerCase(), user])
    );

    seedUsers.forEach((seedUser) => {
      if (!usersByEmail.has(seedUser.email.toLowerCase())) {
        usersByEmail.set(seedUser.email.toLowerCase(), seedUser);
      }
    });

    saveUsers([...usersByEmail.values()]);
    localStorage.setItem(SEED_VERSION_KEY, USER_SEED_VERSION);
  };

  const registerUser = ({ name, email, password }) => {
    const users = getUsers();
    const normalizedEmail = email.trim().toLowerCase();

    const existingUser = users.find(
      (user) => user.email.toLowerCase() === normalizedEmail
    );

    if (existingUser) {
      throw new Error("Ja existe um usuario cadastrado com este e-mail.");
    }

    const newUser = normalizeUser({
      id: `user-${Date.now()}`,
      name: name.trim(),
      email: normalizedEmail,
      password,
      role: "Avaliador",
      status: "Ativo",
      viewPermissions: [...DEFAULT_EVALUATOR_PERMISSIONS],
      createdAt: new Date().toISOString()
    });

    users.push(newUser);
    saveUsers(users);

    return newUser;
  };

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
      throw new Error("E-mail ou senha invalidos.");
    }

    const sessionUser = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      viewPermissions: normalizePermissions(user)
    };

    localStorage.setItem(SESSION_KEY, JSON.stringify(sessionUser));

    return sessionUser;
  };

  const getSession = () => {
    const rawSession = localStorage.getItem(SESSION_KEY);

    if (!rawSession) {
      return null;
    }

    try {
      const session = JSON.parse(rawSession);
      const currentUser = getUsers().find((user) => user.id === session.id);

      if (!currentUser || currentUser.status === "Inativo") {
        localStorage.removeItem(SESSION_KEY);
        return null;
      }

      return {
        id: currentUser.id,
        name: currentUser.name,
        email: currentUser.email,
        role: currentUser.role,
        viewPermissions: normalizePermissions(currentUser)
      };
    } catch (error) {
      localStorage.removeItem(SESSION_KEY);
      return null;
    }
  };

  const persistCurrentSession = (user) => {
    const rawSession = localStorage.getItem(SESSION_KEY);

    if (!rawSession) {
      return;
    }

    try {
      const session = JSON.parse(rawSession);

      if (session.id !== user.id) {
        return;
      }

      localStorage.setItem(
        SESSION_KEY,
        JSON.stringify({
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          viewPermissions: normalizePermissions(user)
        })
      );
    } catch (error) {
      localStorage.removeItem(SESSION_KEY);
    }
  };

  const hasAnotherActiveManager = (users, userId) =>
    users.some(
      (user) =>
        user.id !== userId &&
        user.role === "Gestor" &&
        user.status !== "Inativo"
    );

  const updateUser = (userId, updates) => {
    const users = getUsers();
    const userIndex = users.findIndex((user) => user.id === userId);

    if (userIndex === -1) {
      throw new Error("Usuario nao encontrado.");
    }

    const currentUser = users[userIndex];
    const nextEmail = String(updates.email || currentUser.email)
      .trim()
      .toLowerCase();
    const duplicatedEmail = users.some(
      (user) => user.id !== userId && user.email.toLowerCase() === nextEmail
    );

    if (duplicatedEmail) {
      throw new Error("Ja existe um usuario cadastrado com este e-mail.");
    }

    const nextRole = normalizeRole(updates.role || currentUser.role, currentUser.id);
    const nextStatus = updates.status || currentUser.status || "Ativo";

    if (
      currentUser.role === "Gestor" &&
      (nextRole !== "Gestor" || nextStatus === "Inativo") &&
      !hasAnotherActiveManager(users, userId)
    ) {
      throw new Error("Mantenha pelo menos um gestor ativo no sistema.");
    }

    const nextPermissions =
      nextRole === "Gestor"
        ? [...NAVIGATION_VIEWS]
        : (Array.isArray(updates.viewPermissions)
            ? updates.viewPermissions
            : currentUser.viewPermissions || DEFAULT_EVALUATOR_PERMISSIONS
          ).filter((view) => NAVIGATION_VIEWS.includes(view));

    if (nextRole !== "Gestor" && nextPermissions.length === 0) {
      throw new Error("O avaliador precisa ter acesso a pelo menos um menu.");
    }

    const updatedUser = normalizeUser({
      ...currentUser,
      name: String(updates.name || currentUser.name).trim(),
      email: nextEmail,
      password: updates.password || currentUser.password,
      role: nextRole,
      status: nextStatus,
      viewPermissions: nextPermissions,
      updatedAt: new Date().toISOString()
    });

    users[userIndex] = updatedUser;
    saveUsers(users);
    persistCurrentSession(updatedUser);

    return updatedUser;
  };

  const deleteUser = (userId) => {
    const session = getSession();

    if (session?.id === userId) {
      throw new Error("O gestor logado nao pode excluir a propria conta.");
    }

    const users = getUsers();
    const user = users.find((item) => item.id === userId);

    if (!user) {
      throw new Error("Usuario nao encontrado.");
    }

    if (user.role === "Gestor" && !hasAnotherActiveManager(users, userId)) {
      throw new Error("Mantenha pelo menos um gestor ativo no sistema.");
    }

    saveUsers(users.filter((item) => item.id !== userId));
  };

  const canAccessView = (viewName, user = getSession()) => {
    if (!user) {
      return false;
    }

    if (user.role === "Gestor") {
      return true;
    }

    return normalizePermissions(user).includes(viewName);
  };

  const getFirstAllowedView = (user = getSession()) => {
    if (!user) {
      return "dashboard";
    }

    if (user.role === "Gestor") {
      return "dashboard";
    }

    return normalizePermissions(user)[0] || "dashboard";
  };

  const logout = () => {
    localStorage.removeItem(SESSION_KEY);
  };

  const isAuthenticated = () => !!getSession();

  return {
    getUsers,
    seedDefaultUser,
    registerUser,
    login,
    getSession,
    updateUser,
    deleteUser,
    canAccessView,
    getFirstAllowedView,
    logout,
    isAuthenticated
  };
})();
