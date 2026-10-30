import { describe, expect, it } from 'vitest';
import { resolveBorrower } from './payer-resolver';

const company = {
  id: 'c1',
  nome: 'Prestadora',
  cnpj: '06.697.621/0001-52',
  email: 'prestadora@x.com',
  cidade: 'Brasília',
  estado: 'DF',
  cep: '71635-550',
  userId: 'u1',
  createdAt: new Date(),
  updatedAt: new Date(),
};

describe('resolveBorrower', () => {
  it('sends the payer Inscrição Municipal for legal entities', () => {
    const borrower = resolveBorrower(company, {
      payer: {
        id: 'p1', name: 'Santa Luzia III', document: '08764612000162', type: 'LEGAL_ENTITY',
        municipalTaxNumber: '12345', stateTaxNumber: '0838719600128', phone: '(61) 3214-1817',
        companyId: 'c1', userId: 'u1', createdAt: new Date(), updatedAt: new Date(),
      },
    });
    expect(borrower).toMatchObject({
      type: 'LegalEntity',
      federalTaxNumber: 8764612000162,
      municipalTaxNumber: '12345',
      phoneNumber: '(61) 3214-1817',
    });
  });

  it('never sends a municipal registration for natural persons', () => {
    const borrower = resolveBorrower(company, {
      payer: {
        id: 'p2', name: 'João', document: '12345678901', type: 'NATURAL_PERSON',
        municipalTaxNumber: 'should-not-leak', companyId: 'c1', userId: 'u1',
        createdAt: new Date(), updatedAt: new Date(),
      },
    });
    expect(borrower.type).toBe('NaturalPerson');
    expect(borrower.municipalTaxNumber).toBeUndefined();
  });
});
