import { UserModel } from '@/domain/models/user.model';

export interface RefreshTokenDTO {
  refreshToken: string;
}

export interface RefreshTokenResponse {
  user: UserModel;
  accessToken: string;
  /** Rotated refresh token; the one sent in the request is revoked. */
  refreshToken: string;
  accessTokenExpiresAt?: string;
}

export interface RefreshTokenUseCase {
  execute(data: RefreshTokenDTO): Promise<RefreshTokenResponse>;
}
