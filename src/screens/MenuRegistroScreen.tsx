import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';

export default function MenuRegistroScreen() {
  const navigation = useNavigation<any>();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>MucosaView</Text>
      <Text style={styles.subtitle}>¿Qué deseas hacer?</Text>

      <TouchableOpacity style={[styles.btn, styles.btnPrimary]} onPress={() => navigation.navigate('RegistroNuevo')}>
        <Text style={styles.btnText}>Crear nuevo registro</Text>
      </TouchableOpacity>

      <TouchableOpacity style={[styles.btn, styles.btnSecondary]} onPress={() => navigation.navigate('AgregarFotos')}>
        <Text style={styles.btnText}>Agregar fotos a registro existente</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0e1220', alignItems: 'center', justifyContent: 'center', padding: 24 },
  title: { color: '#fff', fontSize: 24, fontWeight: '800' },
  subtitle: { color: '#aab', marginTop: 8, marginBottom: 20 },
  btn: { width: '100%', paddingVertical: 16, borderRadius: 14, alignItems: 'center', marginTop: 12 },
  btnPrimary: { backgroundColor: '#e53935' },
  btnSecondary: { backgroundColor: '#3949ab' },
  btnText: { color: 'white', fontWeight: '700', fontSize: 16 },
});
