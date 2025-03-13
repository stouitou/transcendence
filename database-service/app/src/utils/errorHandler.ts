
import { CustomEntityNotFoundError, CustomIdNotFoundError, DatabaseNotFoundError } from "@src/config/Databases";
import { 
	EntityNotFoundError,
	QueryFailedError,
	EntityPropertyNotFoundError,
	CannotCreateEntityIdMapError,
	TypeORMError, } from "typeorm";
/**
 * 
 * @param error 
 * 
 * @returns 
 * 
 */
export function handleDatabaseErrors(error: any) {
	const timestamp = new Date().toISOString();
	if (error instanceof TypeORMError) {
	    
	  // ❌ Mauvaise requête (champ inexistant)
	  if (error instanceof EntityPropertyNotFoundError) {
	    return {
	  	status: 400,
	  	type: "EntityPropertyNotFoundError",
	  	message: "Propriété inconnue dans l'entité.",
	  	details: error.message,
		timestamp,
	    };
	  }
	  // ❌ Erreur serveur (échec SQL)
	  if (error instanceof QueryFailedError) {
	    return {
	  	status: 500,
	  	type:  error.name,
	  	message: error.message,//"Erreur SQL",
	  	parameters:{ ...error.parameters },
	  	details: {...error.driverError, query:error.query}, // Détails de l'erreur SQL a verifier
		timestamp,
	    };
	  }
	  // ❌ Ressource non trouvée
	  if (error instanceof EntityNotFoundError) {
	    return {
	  	status: 404,
	  	type: "EntityNotFoundError",
	  	message: "L'entité demandée est introuvable.",
		  timestamp,
	    };
	  }
	  // ❌ Mauvaise requête (ID mal formé)
	  if (error instanceof CannotCreateEntityIdMapError) {
	  	return {
	  	  status: 400, 
	  	  type: "CannotCreateEntityIdMapError",
	  	  message: "Impossible de créer un ID pour cette entité.",
			timestamp,
	  	};
	  }  
	  }

	  // ❌ Erreur Custom

	  if (error instanceof DatabaseNotFoundError) {
	    return {
	  	status: 404,
	  	type: error.name,
	  	message: error.message,
		code: error.code,
		timestamp,
	    };
	  }
	  if (error instanceof CustomEntityNotFoundError 
			|| error instanceof CustomIdNotFoundError) {
	    return {
			status: 404,
			type: error.name,
			message: error.message,
		    code: error.code,
			timestamp,
	    };
	}
	if (error instanceof SyntaxError) {
		return {
			status: 400,
			type: error.name,
			message: "Requête mal formée : syntaxe invalide.",
			code: "SYNTAX_ERROR",
			details: error.message,
			timestamp,
		  };
	}
	  // Autres erreurs génériques
	  // ❌ Erreur inconnue instance de Error
	  return {
	    status: error.code || 500,
	    type: error.name || "UnknownError",
	    message: error.message || "Une erreur inconnue s'est produite.",
		code: error.code || "UNKNOWN_ERROR",
		timestamp,
	  };
  }  
 







/*
      EntityNotFoundError	        404 🔍	L'entité n'existe pas
      EntityPropertyNotFoundError	400 ⚠️	 Champ inconnu dans l'entité
      QueryFailedError	            500 🔥	Échec SQL (requête incorrecte, contrainte...)
      CannotCreateEntityIdMapError	400 🚫	ID invalide ou non généré
      ❓ Autres erreurs inconnues   500 🛑  Erreur interne du serveur
*/









 
 /**
   * Gestion des erreurs de la base de données
   * @param error Erreur de la base de données
   * @returns Un objet avec le statut, le type, le message et les détails de l'erreur.
   */
  const databaseErrors:any = {
	EntityPropertyNotFoundError: { status: 400, message: "Propriété inconnue dans l'entité." },
	QueryFailedError: { status: 500, message: "Erreur SQL lors de l'exécution de la requête." },
	EntityNotFoundError: { status: 404, message: "Entité introuvable." },
	// Ajouter d'autres erreurs ici
  };
  
export function handleDatabaseError(error: any) { //ajouter a generateErrorResponse
   if (error instanceof TypeORMError) {
	return {
	  status: 500,
	  type: error.name,
	  message: "Erreur inconnue.",
	  details: error.message,
	};
  }
  
	const baseError = databaseErrors[error.name] || { status: 500, message: "Erreur inconnue." };
  
	return {
	  status: baseError.status,
	  type: error.name,
	  message: baseError.message,
	  details: error.message, // Conserve l'explication originale
	};
  }