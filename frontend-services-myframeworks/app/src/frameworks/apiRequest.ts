import { ApiError } from "./base-error";

/**
 *  * Fonction générique pour effectuer des requêtes API
 * @param url : string - L'URL de l'API
 * @param method : "GET" | "POST" | "PUT" | "DELETE" - La méthode HTTP à utiliser
 * @param body : B - Le corps de la requête (facultatif)
 * @param headers : Record<string, string> - Les en-têtes de la requête (facultatif)
 * @param csrfProtection : boolean - Indique si la protection CSRF est activée (par défaut : true)
 * @template T - Le type de la réponse attendue
 * @template B - Le type du corps de la requête (facultatif)
 * @throws {ApiError} - Lève une erreur si la requête échoue
 * @returns 
 * 
 * @example
 * const data = await apiRequest<MyResponseType>("https://api.example.com/data", "GET");
 * const postData = await apiRequest<MyResponseType, MyRequestBody>("https://api.example.com/data", "POST", { key: "value" });
 */
export const apiRequest = async <T, B = unknown>(
  url: string,
  method: "GET" | "POST" | "PUT" | "DELETE" = "GET",
  body?: B,
  headers: Record<string, string> = {},
  csrfProtection: boolean = true
): Promise<T> => {
  try {
    const finalHeaders: Record<string, string> = {
      "Content-Type": "application/json",
      ...headers,
    };

    const needsCSRF = csrfProtection && ["POST", "PUT", "DELETE"].includes(method);
    const hasCSRFHeader = "x-csrf-token" in finalHeaders;

    if (needsCSRF && !hasCSRFHeader) {
      try {
        const { csrfToken } = await fetch("/api/auth/csrf", {
          credentials: "include",
        }).then(res => res.json());

        finalHeaders["x-csrf-token"] = csrfToken;
      } catch (err) {
        console.error("❌ Failed to retrieve CSRF token:", err);
        throw new ApiError(403, "CSRF token missing or invalid");
      }
    }

    const options: RequestInit = {
      method,
      headers: finalHeaders,
      credentials: "include",
    };

    if (body) {
      options.body = JSON.stringify(body);
    }

    const response = await fetch(url, options);

    if (!response.ok) {
      const errorData = await response.json();
      throw new ApiError(response.status, errorData.error || "An error occurred");
    }

    return await response.json();
  } catch (error) {
    console.error("API Request Error:", error);
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError(500, "Unexpected error occurred");
  }
};