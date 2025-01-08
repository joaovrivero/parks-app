import React, { useState, useContext } from "react";
import { View, Text, TextInput, Button, StyleSheet } from "react-native";
import { AuthContext } from "../contexts/AuthContext";

export default function ResetPasswordScreen({ navigation }) {
  const [email, setEmail] = useState("");
  const { resetPassword } = useContext(AuthContext);

  const handleResetPassword = async () => {
    try {
      await resetPassword(email);
      navigation.navigate("Login"); // Redirecionar para a tela de login
    } catch (error) {
      alert("Erro: " + error.message);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Recuperar Senha</Text>
      <TextInput
        style={styles.input}
        placeholder="Digite seu e-mail"
        keyboardType="email-address"
        value={email}
        onChangeText={setEmail}
      />
      <Button
        title="Enviar E-mail de Recuperação"
        onPress={handleResetPassword}
      />
      <Button
        title="Voltar ao Login"
        onPress={() => navigation.navigate("Login")}
      />
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
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 8,
    marginBottom: 12,
    borderRadius: 4,
  },
});
