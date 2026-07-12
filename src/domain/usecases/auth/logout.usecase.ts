export interface LogoutDTO {
  refreshToken: string;
}

export interface LogoutUseCase {
  execute(data: LogoutDTO): Promise<void>;
}
