import React from "react";
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useNavigation, NavigationProp, ParamListBase } from "@react-navigation/native";

type CustomHeaderProps = {
  title: string;
  subtitle?: string;
};

const CustomHeader: React.FC<CustomHeaderProps> = ({ title, subtitle }) => {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<NavigationProp<ParamListBase>>();

  const handleLogoPress = () => {
    if (navigation.canGoBack()) {
      navigation.goBack();
    } else {
      // Fallback por si estás en la raíz: navega a "Inicio"
      navigation.navigate("Inicio");
    }
  };

  return (
    <View style={[styles.headerContainer, { paddingTop: insets.top + 10 }]}>
      {/* Logo */}
      <TouchableOpacity onPress={handleLogoPress} style={styles.logoContainer}>
        <Image source={require("../../assets/logo.webp")} style={styles.logo} />
      </TouchableOpacity>

      {/* Título principal y subtítulo */}
      <View style={styles.textContainer}>
        <Text style={styles.title}>{title}</Text>
        {!!subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  headerContainer: {
    backgroundColor: "#E74C3C",
    padding: 15,
    flexDirection: "row",
    alignItems: "center",
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  logoContainer: {
    marginRight: 10,
  },
  logo: {
    width: 30,
    height: 30,
    borderRadius: 5,
  },
  textContainer: {
    flex: 1,
  },
  title: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
  },
  subtitle: {
    color: "rgba(255, 255, 255, 0.8)",
    fontSize: 12,
  },
});

export default CustomHeader;
