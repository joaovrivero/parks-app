import React, { useContext } from "react";
import { View, Text, Button, StyleSheet } from "react-native";
import { AuthContext } from "../contexts/AuthContext";

export default function HomeScreen({ navigation }) {
  const { user, logout } = useContext(AuthContext);

  return (
    <View style={styles.container}>
      {user ? (
        <>
          <Text style={styles.title}>Bem-vindo, {user.email}!</Text>
          {/* Botão para acessar a tela de perfil */}
          <Button
            title="Ir para o Perfil"
            onPress={() => navigation.navigate("Perfil")}
          />
          {/* Botão de logout */}
          <Button title="Sair" onPress={logout} />
        </>
      ) : (
        <>
          <Text style={styles.title}>Bem-vindo ao Parks!</Text>
          <Button title="Login" onPress={() => navigation.navigate("Login")} />
        </>
      )}
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
