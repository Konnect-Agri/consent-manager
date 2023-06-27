import { JwtPayload } from "jsonwebtoken";

export function parseJwt(signedJwtAccessToken: string) {
    if (!signedJwtAccessToken) return null;
    const base64Payload = signedJwtAccessToken.split('.')[1];
    const payloadBuffer = Buffer.from(base64Payload, 'base64');
    const updatedJwtPayload: JwtPayload = JSON.parse(payloadBuffer.toString()) as JwtPayload;
    const expires = updatedJwtPayload.exp;
    return updatedJwtPayload
}