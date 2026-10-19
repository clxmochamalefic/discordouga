import { SignJWT, jwtVerify } from "jose";
import { config } from "../config.ts";

const secret = new TextEncoder().encode(config.jwt.secret);

export type JwtPayload = {
  sub: string;
};

export const signJwt = async (payload: JwtPayload): Promise<string> => {
  return await new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setIssuer(config.jwt.issuer)
    .setAudience(config.jwt.audience)
    .setExpirationTime(`${config.jwt.expiresInSec}s`)
    .setSubject(payload.sub)
    .sign(secret);
};

export const verifyJwt = async (token: string): Promise<JwtPayload | null> => {
  try {
    const { payload } = await jwtVerify(token, secret, {
      issuer: config.jwt.issuer,
      audience: config.jwt.audience,
    });
    if (typeof payload.sub !== "string") return null;
    return { sub: payload.sub };
  } catch {
    return null;
  }
};
