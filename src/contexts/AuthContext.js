import React, { createContext, useState, useEffect } from "react";
import {
  getAuth,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  sendEmailVerification,
  sendPasswordResetEmail,
  deleteUser,
} from "firebase/auth";
import { initializeApp } from "firebase/app";
import * as SecureStore from "expo-secure-store";
import { firebaseConfig } from "../config/firebaseConfig";

// Inicializar o Firebase
initializeApp(firebaseConfig);

// Inicializar o Auth
const auth = getAuth();

// Criar o contexto
export const AuthContext = createContext();

// Provedor de Autenticação
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Observar mudanças no estado de autenticação
  useEffect(() => {
    const checkUserSession = async () => {
      try {
        const session = await SecureStore.getItemAsync("user_session");
        if (session) {
          const { email, password } = JSON.parse(session);

          // Verifica se a senha está presente
          if (!password) {
            console.error("Senha ausente na sessão. Usuário será deslogado.");
            await SecureStore.deleteItemAsync("user_session");
            setUser(null);
            return;
          }

          // Reautenticar o usuário no Firebase
          try {
            const userCredential = await signInWithEmailAndPassword(
              auth,
              email,
              password
            );

            if (userCredential.user.emailVerified) {
              const updatedSession = {
                email: userCredential.user.email,
                password, // Salva novamente a senha
                uid: userCredential.user.uid,
              };
              setUser(updatedSession);

              // Salvar a sessão atualizada no SecureStore
              await SecureStore.setItemAsync(
                "user_session",
                JSON.stringify(updatedSession)
              );
            } else {
              console.error("E-mail não verificado. Usuário será deslogado.");
              await SecureStore.deleteItemAsync("user_session");
              setUser(null);
            }
          } catch (error) {
            console.error("Erro ao reautenticar: ", error);
            await SecureStore.deleteItemAsync("user_session");
            setUser(null);
          }
        }
      } catch (error) {
        console.error("Erro ao recuperar sessão: ", error);
      } finally {
        setIsLoading(false);
      }
    };

    checkUserSession();
  }, []);

  // Observar mudanças na autenticação e atualizar o SecureStore
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser && firebaseUser.emailVerified) {
        const userSession = {
          email: firebaseUser.email,
          uid: firebaseUser.uid,
        };
        setUser(userSession);

        // Salvar a sessão no SecureStore
        try {
          await SecureStore.setItemAsync(
            "user_session",
            JSON.stringify(userSession)
          );
        } catch (error) {
          console.error("Erro ao salvar sessão: ", error);
        }
      } else {
        setUser(null);

        // Remover a sessão do SecureStore
        try {
          await SecureStore.deleteItemAsync("user_session");
        } catch (error) {
          console.error("Erro ao limpar sessão: ", error);
        }
      }
    });

    return () => unsubscribe();
  }, []);

  // Função de login
  const login = async (email, password, navigation) => {
    try {
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password
      );

      if (!userCredential.user.emailVerified) {
        throw new Error(
          "Por favor, verifique seu e-mail antes de fazer login."
        );
      }

      // Define o usuário
      const userSession = { email, password, uid: userCredential.user.uid };
      setUser(userSession);

      // Salvar a sessão no SecureStore
      try {
        await SecureStore.setItemAsync(
          "user_session",
          JSON.stringify(userSession)
        );
      } catch (error) {
        console.error("Erro ao salvar sessão: ", error);
      }

      // Navega para a tela principal
      navigation.navigate("Parks");

      return userCredential;
    } catch (error) {
      throw error;
    }
  };

  // Função de registro
  const register = async (email, password) => {
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      email,
      password
    );
    await sendEmailVerification(userCredential.user); // Enviar e-mail de verificação
    auth.signOut(); // Desconectar após o registro
    return userCredential;
  };

  // Função de logout
  const logout = async () => {
    await signOut(auth);

    // Limpar sessão no SecureStore
    try {
      await SecureStore.deleteItemAsync("user_session");
    } catch (error) {
      console.error("Erro ao limpar sessão: ", error);
    }

    setUser(null);
  };

  // Função de recuperação de senha
  const resetPassword = async (email) => {
    try {
      await sendPasswordResetEmail(auth, email);
      alert("E-mail de recuperação enviado. Verifique sua caixa de entrada.");
    } catch (error) {
      alert("Erro ao enviar e-mail de recuperação: " + error.message);
    }
  };

  // Função para deletar a conta
  const deleteAccount = async () => {
    const currentUser = auth.currentUser;

    if (!currentUser) {
      throw new Error("Nenhum usuário logado para deletar.");
    }

    try {
      await deleteUser(currentUser);

      // Limpar sessão no SecureStore
      try {
        await SecureStore.deleteItemAsync("user_session");
      } catch (error) {
        console.error("Erro ao limpar sessão durante exclusão: ", error);
      }

      setUser(null);
    } catch (error) {
      console.error("Erro ao deletar conta: ", error.message);
      throw error; // Lança o erro para ser tratado na interface
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        register,
        logout,
        resetPassword,
        deleteAccount,
        isLoading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
