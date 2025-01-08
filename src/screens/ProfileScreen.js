import React, { useContext } from "react";
import { View, Text, Button, StyleSheet, Alert } from "react-native";
import { AuthContext } from "../contexts/AuthContext";

export default function ProfileScreen({ navigation }) {
  const { user, logout, deleteAccount } = useContext(AuthContext); // Obtém a função de deletar do contexto

  const handleLogout = async () => {
    await logout();
    navigation.navigate("Login");
  };

  const handleDeleteAccount = () => {
    Alert.alert("Deletar Conta", "Tem certeza que deseja excluir sua conta?", [
      {
        text: "Cancelar",
        style: "cancel",
      },
      {
        text: "Deletar",
        onPress: async () => {
          try {
            await deleteAccount(); // Chama a função do contexto
            alert("Conta excluída com sucesso!");
            navigation.navigate("Login"); // Redireciona para login
          } catch (error) {
            alert("Erro ao excluir conta: " + error.message);
          }
        },
      },
    ]);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Perfil</Text>
      <Text>Email: {user?.email}</Text>

      {/* Botão para editar perfil */}
      <Button
        title="Editar Perfil"
        onPress={() => alert("Função de edição a ser implementada!")}
      />

      {/* Botão para deletar conta */}
      <Button title="Deletar Conta" onPress={handleDeleteAccount} />

      {/* Botão para deslogar */}
      <Button title="Sair" onPress={handleLogout} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 16,
    textAlign: "center",
  },
});
