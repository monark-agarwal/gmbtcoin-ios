import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import * as Font from "expo-font";
import { MaterialIcons, Ionicons, Feather } from "@expo/vector-icons";
import { View, ActivityIndicator } from "react-native";
import Nav from "./src/navigation";
import { Buffer } from 'buffer';
global.Buffer = Buffer;

export default function App() {
  const [loaded, setLoaded] = React.useState(false);

  React.useEffect(() => {
    async function loadFonts() {
      await Font.loadAsync({
        ...MaterialIcons.font,
        ...Ionicons.font,
        ...Feather.font,
      });

      setLoaded(true);
    }

    loadFonts();
  }, []);

  if (!loaded) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Nav />
    </NavigationContainer>
  );
}