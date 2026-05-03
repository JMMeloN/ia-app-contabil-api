import { CnaeModel } from '@/data/protocols/cnae.repository';
import { CnaeRepository } from '@/data/protocols/cnae.repository';
import { CnaeExternalService } from '@/data/protocols/cnae-external.service';

export class DbListCnaes {
  constructor(
    private readonly cnaeRepository: CnaeRepository,
    private readonly cnaeExternalService: CnaeExternalService,
  ) {}

  async execute(search?: string): Promise<CnaeModel[]> {
    const total = await this.cnaeRepository.count();

    if (total === 0) {
      const external = await this.cnaeExternalService.fetchAll();
      if (external.length > 0) {
        await this.cnaeRepository.createMany(external);
      }
    }

    return this.cnaeRepository.findAll(search);
  }
}
