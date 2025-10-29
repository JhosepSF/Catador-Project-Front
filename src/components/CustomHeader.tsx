import React from "react";
import { Image, StyleSheet, Text, TouchableOpacity, View, StatusBar } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useNavigation, NavigationProp, ParamListBase } from "@react-navigation/native";

type CustomHeaderProps = {
  title: string;
  subtitle?: string;
};

const PALETTE = {
  primary: "#6B4F3B",      // Marrón cacao (chocolate)
  dark: "#4E342E",         // Cacao tostado
  accent: "#E6D3B1",       // Crema/cocoa
  textPrimary: "#FFF8E7",  // Blanco cálido
  textSecondary: "rgba(255, 248, 231, 0.85)",
  shadow: "#3E2723",
};

const CustomHeader: React.FC<CustomHeaderProps> = ({ title, subtitle }) => {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<NavigationProp<ParamListBase>>();

  const handleLogoPress = () => {
    if (navigation.canGoBack()) {
      navigation.goBack();
    } else {
      navigation.navigate("Inicio");
    }
  };

  return (
    <View
      style={[
        styles.headerContainer,
        {
          paddingTop: insets.top + 10,
          backgroundColor: PALETTE.primary,
          borderBottomColor: PALETTE.dark,
        },
      ]}
    >
      <StatusBar barStyle="light-content" backgroundColor={PALETTE.dark} />

      {/* Logo */}
      <TouchableOpacity onPress={handleLogoPress} style={styles.logoContainer}>
        <Image
          source={require("../../assets/logo.webp")}
          style={[styles.logo, { borderColor: PALETTE.accent }]}
        />
      </TouchableOpacity>

      {/* Título principal y subtítulo */}
      <View style={styles.textContainer}>
        <Text style={[styles.title, { color: PALETTE.textPrimary }]}>{title}</Text>
        {!!subtitle && (
          <Text style={[styles.subtitle, { color: PALETTE.textSecondary }]}>{subtitle}</Text>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  headerContainer: {
    padding: 15,
    flexDirection: "row",
    alignItems: "center",
    elevation: 4,
    shadowColor: "#3E2723",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 5,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  logoContainer: {
    marginRight: 10,
  },
  logo: {
    width: 30,
    height: 30,
    borderRadius: 6,
    borderWidth: 1,
  },
  textContainer: {
    flex: 1,
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    letterSpacing: 0.2,
  },
  subtitle: {
    fontSize: 12,
    marginTop: 2,
  },
});

export default CustomHeader;
