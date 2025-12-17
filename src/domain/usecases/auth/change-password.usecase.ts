export interface ChangePasswordDTO {
  userId: string;
  currentPassword: string;
  newPassword: string;
}

export interface ChangePasswordUseCase {
  execute(data: ChangePasswordDTO): Promise<void>;
}
