import qrcode from 'qrcode';

export async function generateQRCode(data: string): Promise<string> {
  return qrcode.toDataURL(data);
}
