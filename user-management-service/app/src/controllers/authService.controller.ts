
import { FastifyRequest } from 'fastify';

export class AuthServiceController {
  private authServiceUrl = 'http://auth_services:3000/internal/auth';

  constructor() {
    this.status2FA = this.status2FA.bind(this);
    this.enable2FA = this.enable2FA.bind(this);
    this.disable2FA = this.disable2FA.bind(this);
    this.generate2FAQrCode = this.generate2FAQrCode.bind(this);
  }

  // Transférer les cookies et les en-têtes
  private getHeaders(req: FastifyRequest): Record<string, string> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    // Transférer les cookies
    if (req.headers.cookie) {
      headers['Cookie'] = req.headers.cookie;
    }

    // Transférer les en-têtes spécifiques (par exemple, CSRF token ou Authorization)
    if (req.headers['x-csrf-token']) {
      headers['X-CSRF-Token'] = req.headers['x-csrf-token'] as string;
    }
    if (req.headers.authorization) {
      headers['Authorization'] = req.headers.authorization as string;
    }

    return headers;
  }

  // Vérifier le statut 2FA
  async status2FA(req: FastifyRequest): Promise<any> {
  const response = await fetch(`${this.authServiceUrl}/2fa/status`, {
    //  const response = await fetch(`http://auth_services:3000/api/auth/2fa/status`, {
      method: 'GET',
      headers: this.getHeaders(req),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`Failed to fetch 2FA status: ${error.message}`);
    }

    return await response.json();
  }

  // Activer le 2FA
  async enable2FA(req: FastifyRequest): Promise<any> {
    const { enable, method } = req.body as { enable: boolean; method: string };
    const response = await fetch(`${this.authServiceUrl}/2fa/enable`, {
      method: 'PUT',
      headers: this.getHeaders(req),
      body: JSON.stringify({ enable, method/* userId: req.authenticatedUser?.id  */}),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`Failed to enable 2FA: ${error.message}`);
    }

    return await response.json();
  }

  // Désactiver le 2FA
  async disable2FA(req: FastifyRequest): Promise<any> {
    const response = await fetch(`${this.authServiceUrl}/2fa/disable`, {
      method: 'PUT',
      headers: this.getHeaders(req),
      body: JSON.stringify({ /* userId: req.authenticatedUser?.id */ }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`Failed to disable 2FA: ${error.message}`);
    }

    return await response.json();
  }

  // Générer un QR code pour le 2FA
  async generate2FAQrCode(req: FastifyRequest): Promise<any> {
    const response = await fetch(`${this.authServiceUrl}/2fa/qrcode`, {
      method: 'GET',
      headers: this.getHeaders(req),
    //  body: JSON.stringify({ userId: req.authenticatedUser?.id }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`Failed to generate 2FA QR code: ${error.message}`);
    }

    return await response.json();
  }

    async verify2FA(req: FastifyRequest): Promise<any> {
    const { code } = req.body as { code: string };
    const response = await fetch(`${this.authServiceUrl}/2fa/verify`, {
      method: 'POST',
      headers: this.getHeaders(req),
      body: JSON.stringify({ code }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`Failed to verify 2FA: ${error.message}`);
    }

    return await response.json();
  }
}