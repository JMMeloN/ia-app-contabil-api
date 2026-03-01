import axios from 'axios';
import { CepAddress, CepServiceProtocol } from '@/data/protocols/cep.service';

export class ViaCepService implements CepServiceProtocol {
  private readonly baseUrl = 'https://viacep.com.br/ws';

  async getAddressByCep(cep: string): Promise<CepAddress | null> {
    try {
      const cleanCep = cep.replace(/\D/g, '');
      if (cleanCep.length !== 8) return null;

      const response = await axios.get(`${this.baseUrl}/${cleanCep}/json/`);
      
      if (response.data.erro) {
        return null;
      }

      return response.data as CepAddress;
    } catch (error) {
      console.error(`[ViaCepService] Erro ao buscar CEP ${cep}:`, error);
      return null;
    }
  }
}
