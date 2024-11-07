
import { decode as atob } from 'base-64';
import * as SecureStore from "expo-secure-store";
import { checkAuth } from "@/../App"

export async function logout() {
    await setToken("", "");
    checkAuth();
}

export function updateUser(changedFields) {
    const user = JSON.parse(SecureStore.getItem(
        "user"
    ))

    SecureStore.setItem("user", JSON.stringify({ ...user, ...changedFields }));
}

export function getUser() {
    const user = JSON.parse(SecureStore.getItem(
        "user"
    ))

    return {
        id: user?.userId,
        displayName: user?.displayName,
        phoneNumber: user?.phoneNumber,
        dateOfBirth: user?.dateOfBirth,
        role: user?.roles[0].authority,
        locale: user?.locale,
        email: user?.sub
    };
}

export async function setToken(jwt, refreshToken) {
    await SecureStore.setItemAsync("jwt", jwt);
    await SecureStore.setItemAsync(
        "refresh-token", refreshToken
    );
    if (jwt) {
        await SecureStore.setItem(
            "user", JSON.stringify(parseJwt(jwt))
        );
    }
}

function parseJwt(token) {
    const base64Url = token.split('.')[1];
    let base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    // Adiciona padding se necessário
    while (base64.length % 4) {
        base64 += '=';
    }
    const jsonPayload = atob(base64);
    return JSON.parse(jsonPayload); null;
}