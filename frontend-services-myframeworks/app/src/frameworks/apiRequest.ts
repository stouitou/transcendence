import { ApiError, ApiErrorBase } from "./base-error";
import { t } from "./i18n/index";

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
  csrfProtection: boolean = true,
  contentType: boolean = true,
): Promise<T> => {
  try {
    const finalHeaders: Record<string, string> = {
      "Content-Type": "application/json",
      ...headers,
    };

    const needsCSRF = csrfProtection && ["POST", "PUT", "DELETE"].includes(method);
    const hasCSRFHeader = "x-csrf-token" in finalHeaders;
    //remove content-type if contentType is false
    if (!contentType) {
      delete finalHeaders["Content-Type"];
    }

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
      if (contentType) {
        options.body = JSON.stringify(body);
      } else if (
        typeof body === "string" ||
        body instanceof Blob ||
        body instanceof FormData ||
        body instanceof URLSearchParams ||
        body instanceof ArrayBuffer ||
        body instanceof ReadableStream
      ) {
        options.body = body as BodyInit;
      } else {
        throw new ApiError(400, "Invalid body type for fetch request when contentType is false");
      }
    }

    const response = await fetch(url, options);

    if (!response.ok) {
      const errorData = await response.json();
      console.log("API Request Error Data:", errorData);
      throw new ApiErrorBase(errorData);
     // throw new ApiError(response.status, errorData.error || "An error occurred");
    }

    return await response.json();
  } catch (error) {
    console.error("API Request Error:", error);
    if (error instanceof ApiErrorBase) {
      throw error;
    }
    throw new ApiError(500, "Unexpected error occurred");
  }
};