import { UserModel } from '@/domain/models/user.model';

export interface RefreshTokenDTO {
  refreshToken: string;
}

export interface RefreshTokenResponse {
  user: UserModel;
  accessToken: string;
  accessTokenExpiresAt?: string;
}

export interface RefreshTokenUseCase {
  execute(data: RefreshTokenDTO): Promise<RefreshTokenResponse>;
}
