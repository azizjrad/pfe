# Test unitaire du cas d'utilisation : S'authentifier

Cette section presente un test unitaire du service d'authentification front-end (`authService.login`).

## Objectif du test

Verifier que la methode `login` :

- envoie la requete HTTP vers l'endpoint `/login` avec les bons parametres ;
- normalise la reponse API ;
- sauvegarde l'utilisateur dans `localStorage` en cas de succes ;
- propage l'erreur sans ecrire dans `localStorage` en cas d'echec.

## Code du test

```js
import { beforeEach, describe, expect, it, vi } from "vitest";

import { authService } from "../authService";
import http from "../http";

vi.mock("../http", () => ({
  default: {
    post: vi.fn(),
    get: vi.fn(),
    put: vi.fn(),
  },
}));

describe("authService.login", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    const store = {};
    global.localStorage = {
      getItem: (key) => (key in store ? store[key] : null),
      setItem: (key, value) => {
        store[key] = String(value);
      },
      removeItem: (key) => {
        delete store[key];
      },
      clear: () => {
        Object.keys(store).forEach((key) => delete store[key]);
      },
    };
  });

  it("calls /login and stores user in localStorage", async () => {
    const credentials = { email: "user@test.com", password: "secret" };
    const apiResponse = {
      data: {
        success: true,
        message: "Login successful",
        data: {
          user: {
            id: 1,
            name: "Test User",
            email: "user@test.com",
            role: "client",
          },
        },
      },
    };

    http.post.mockResolvedValue(apiResponse);

    const result = await authService.login(credentials);

    expect(http.post).toHaveBeenCalledWith("/login", credentials);
    expect(result.success).toBe(true);
    expect(result.user).toEqual(apiResponse.data.data.user);
    expect(localStorage.getItem("user")).toBe(
      JSON.stringify(apiResponse.data.data.user),
    );
  });

  it("propagates login error and does not write localStorage", async () => {
    const credentials = { email: "user@test.com", password: "wrong" };
    const apiError = new Error("Request failed with status code 422");

    http.post.mockRejectedValue(apiError);

    await expect(authService.login(credentials)).rejects.toThrow(
      "Request failed with status code 422",
    );
    expect(localStorage.getItem("user")).toBe(null);
  });
});
```

## Resultat attendu

- Test 1 : succes, requete envoyee correctement et utilisateur stocke localement.
- Test 2 : succes, erreur correctement remontee et aucune donnee utilisateur en cache.

## Commande d'execution

Depuis le dossier `frontend` :

```bash
npm install
npm run test
```
