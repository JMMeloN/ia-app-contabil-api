import fs from 'fs/promises';
import path from 'path';
import axios from 'axios';
import XLSX from 'xlsx';

type CnaeLevel = 'section' | 'division' | 'group' | 'class' | 'subclass';

type CnaeRecord = {
  code: string;
  level: CnaeLevel;
  description: string;
  normalizedDescription: string;
  sectionCode?: string;
  sectionDescription?: string;
  divisionCode?: string;
  divisionDescription?: string;
  groupCode?: string;
  groupDescription?: string;
  classCode?: string;
  classDescription?: string;
  subclassCode?: string;
  subclassDescription?: string;
};

const SOURCE_URL =
  'https://concla.ibge.gov.br/images/concla/documentacao/CNAE_Subclasses_2_3_Estrutura_Detalhada.xlsx';
const SHEET_NAME = 'Estrutura Det. CNAE Subclass2.3';
const OUTPUT_PATH = path.resolve(
  '/Users/admin/Documents/iacontabil/iacontabil-api/src/data/reference/cnaes.json'
);

function normalizeText(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();
}

function hasValue(value: unknown): value is string {
  return typeof value === 'string' && value.trim().length > 0;
}

async function main() {
  const response = await axios.get<ArrayBuffer>(SOURCE_URL, {
    responseType: 'arraybuffer',
    timeout: 60000,
  });

  const workbook = XLSX.read(Buffer.from(response.data), { type: 'buffer' });
  const sheet = workbook.Sheets[SHEET_NAME];
  if (!sheet) {
    throw new Error(`Aba não encontrada: ${SHEET_NAME}`);
  }

  const rows = XLSX.utils.sheet_to_json<string[]>(sheet, { header: 1, defval: '' });
  const records: CnaeRecord[] = [];

  let sectionCode = '';
  let sectionDescription = '';
  let divisionCode = '';
  let divisionDescription = '';
  let groupCode = '';
  let groupDescription = '';
  let classCode = '';
  let classDescription = '';

  for (const row of rows.slice(4)) {
    const [rawSection, rawDivision, rawGroup, rawClass, rawSubclass, rawDescription] = row;
    const description = String(rawDescription || '').trim();
    if (!description) continue;

    if (hasValue(rawSection)) {
      sectionCode = rawSection.trim();
      sectionDescription = description;
      records.push({
        code: sectionCode,
        level: 'section',
        description,
        normalizedDescription: normalizeText(description),
        sectionCode,
        sectionDescription,
      });
      continue;
    }

    if (hasValue(rawDivision)) {
      divisionCode = rawDivision.trim();
      divisionDescription = description;
      records.push({
        code: divisionCode,
        level: 'division',
        description,
        normalizedDescription: normalizeText(description),
        sectionCode,
        sectionDescription,
        divisionCode,
        divisionDescription,
      });
      continue;
    }

    if (hasValue(rawGroup)) {
      groupCode = rawGroup.trim();
      groupDescription = description;
      records.push({
        code: groupCode,
        level: 'group',
        description,
        normalizedDescription: normalizeText(description),
        sectionCode,
        sectionDescription,
        divisionCode,
        divisionDescription,
        groupCode,
        groupDescription,
      });
      continue;
    }

    if (hasValue(rawClass)) {
      classCode = rawClass.trim();
      classDescription = description;
      records.push({
        code: classCode,
        level: 'class',
        description,
        normalizedDescription: normalizeText(description),
        sectionCode,
        sectionDescription,
        divisionCode,
        divisionDescription,
        groupCode,
        groupDescription,
        classCode,
        classDescription,
      });
      continue;
    }

    if (hasValue(rawSubclass)) {
      const subclassCode = rawSubclass.trim();
      records.push({
        code: subclassCode,
        level: 'subclass',
        description,
        normalizedDescription: normalizeText(description),
        sectionCode,
        sectionDescription,
        divisionCode,
        divisionDescription,
        groupCode,
        groupDescription,
        classCode,
        classDescription,
        subclassCode,
        subclassDescription: description,
      });
    }
  }

  await fs.writeFile(OUTPUT_PATH, JSON.stringify(records, null, 2), 'utf8');
  console.log(`CNAEs importados: ${records.length}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
