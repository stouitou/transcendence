/// <reference types="vite/client" />

interface ImportMetaEnv {
	readonly VITE_BACKEND_SERVER_URL: string;
	readonly VITE_BACKEND_SERVER_WS_URL: string;
 }
interface ImportMeta {
	readonly env: ImportMetaEnv;
}