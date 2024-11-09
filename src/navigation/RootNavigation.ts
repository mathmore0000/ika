// navigation/RootNavigation.ts
import { createNavigationContainerRef } from "@react-navigation/native";

export const navigationRef = createNavigationContainerRef();
export let currentScreen: string;

export function setCurrentScreen(newCurrentScreen: string){
  return currentScreen = newCurrentScreen;
}

export function isCurrentScreenInAuth(){
  const authStack = ["Login", "SignUp"]
  return authStack.includes(currentScreen)
}