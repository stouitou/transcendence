
import { ErrorFactory } from '../Errors/ErrorFactory';
import { ValidationError } from '../Errors/errors';
import { FastifyRequest } from 'fastify';

export class AuthServiceController {
  private authServiceUrl = 'http://auth_services:3000/internal/auth';

  constructor() {
    this.status2FA = this.status2FA.bind(this);
    this.status2FAById = this.status2FAById.bind(this);
    this.enable2FA = this.enable2FA.bind(this);
    this.disable2FA = this.disable2FA.bind(this);
    this.disable2FAById = this.disable2FAById.bind(this);
    this.verify2FA = this.verify2FA.bind(this);
    this.generate2FAQrCode = this.generate2FAQrCode.bind(this);

    this.updateMePassword = this.updateMePassword.bind(this);
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
  const response = await fetch(`${this.authServiceUrl}/2fa/status/me`, {
      method: 'GET',
      headers: this.getHeaders(req),
    });

    if (!response.ok) {
      const error = await response.json();
      throw ErrorFactory.fromRemoteError(error);
    }

    return await response.json();
  }
  // Vérifier le statut 2FA
  async status2FAById(req: FastifyRequest): Promise<any> {
    const { id } = req.params as { id: number };
    if (!id) {
      throw new Error('User ID is required');
    }
  const response = await fetch(`${this.authServiceUrl}/2fa/status/${id}`, {
      method: 'GET',
      headers: this.getHeaders(req),
    });

    if (!response.ok) {
      const error = await response.json();
      throw ErrorFactory.fromRemoteError(error);
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
      throw ErrorFactory.fromRemoteError(error);
    }

    return await response.json();
  }

  // Désactiver le 2FA
  async disable2FA(req: FastifyRequest): Promise<any> {
    const response = await fetch(`${this.authServiceUrl}/2fa/disable/me`, {
      method: 'PUT',
      headers: this.getHeaders(req),
      body: JSON.stringify({ /* userId: req.authenticatedUser?.id */ }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw ErrorFactory.fromRemoteError(error);
    }

    return await response.json();
  }
// Désactiver le 2FA
  async disable2FAById(req: FastifyRequest): Promise<any> {
    const { id } = req.params as { id: number };
    if (!id) {
      console.error('[disable2FAById] User ID is required');
      throw new ValidationError('User ID is required', 'id');
    }
    const response = await fetch(`${this.authServiceUrl}/2fa/disable/${id}`, {
      method: 'PUT',
      headers: this.getHeaders(req),
      body: JSON.stringify({ }),
    });

    if (!response.ok) {
      console.error('[disable2FAById]----------------------------------------------');
      console.error('[disable2FAById] Failed to disable 2FA');
      console.error('[disable2FAById] Response:', response);
      const error = await response.json();
      console.error('[disable2FAById] Error details:', error);
      throw ErrorFactory.fromRemoteError(error);
    }

    return await response.json();
  }
  // Générer un QR code pour le 2FA
  async generate2FAQrCode(req: FastifyRequest): Promise<any> {
      const response = await fetch(`${this.authServiceUrl}/2fa/qrcode`, { 
        method: 'GET',
        headers: this.getHeaders(req),
      });

      if (!response.ok) {
        const error = await response.json();
        throw ErrorFactory.fromRemoteError(error);
      }
      // Vérifier si le type de contenu est image/png
      const contentType = response.headers.get('Content-Type');
      if (contentType !== 'image/png') {
        throw new ValidationError('Invalid content type for QR code', 'contentType');
      }

      return response;
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
      throw ErrorFactory.fromRemoteError(error);
    }

    return await response.json();
  }


  async updateMePassword(req: FastifyRequest): Promise<any> {

    const { oldPassword,newPassword } = req.body as { oldPassword: string;	newPassword: string; };
    const response = await fetch(`${this.authServiceUrl}/updatePassword/me`, {
      method: 'PUT',
      headers: this.getHeaders(req),
      body: JSON.stringify({ oldPassword,newPassword }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw ErrorFactory.fromRemoteError(error);
    }
    //204 no content
    if (response.status === 204) {
      return { message: 'Password updated successfully' };
    }
    return await response.json();
  }
}