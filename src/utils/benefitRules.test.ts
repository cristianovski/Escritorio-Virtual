import { describe, it, expect, beforeAll, afterAll, setSystemTime } from "bun:test";
import { analisarViabilidade, ClientData } from "./benefitRules";

describe("benefitRules - analisarViabilidade", () => {
  // Set system time to a fixed date for reliable age calculation
  beforeAll(() => {
    const fixedDate = new Date('2024-01-01T00:00:00.000Z');
    setSystemTime(fixedDate);
  });

  afterAll(() => {
    setSystemTime(); // Reset to actual time
  });

  const baseClient: ClientData = {
    sexo: 'Masculino',
    data_nascimento: '1980-01-01', // 44 years old in 2024
    profissao: 'Agricultor',
  };

  describe("Global Rules (Impediments)", () => {
    it("should flag attention if client has CNPJ", () => {
      const client = { ...baseClient, possui_cnpj: true };
      const result = analisarViabilidade('Aposentadoria por Idade Rural', client);

      expect(result.status).not.toBe('aprovado'); // Can be atencao or rejeitado depending on other rules
      expect(result.messages.some(m => m.includes("Cliente possui CNPJ ativo"))).toBe(true);
    });

    it("should flag attention if client has other income", () => {
      const client = { ...baseClient, possui_outra_renda: true };
      const result = analisarViabilidade('Aposentadoria por Idade Rural', client);

      expect(result.status).not.toBe('aprovado');
      expect(result.messages.some(m => m.includes("Cliente possui outra fonte de renda"))).toBe(true);
    });
  });

  describe("Aposentadoria por Idade Rural", () => {
    it("should reject male under 60", () => {
      const client = { ...baseClient, sexo: 'Masculino', data_nascimento: '1970-01-01' }; // 54 years old
      const result = analisarViabilidade('Aposentadoria por Idade Rural', client);

      expect(result.status).toBe('rejeitado');
      expect(result.viable).toBe(false);
      expect(result.messages.some(m => m.includes("Idade insuficiente. Atual: 54. Exigido: 60"))).toBe(true);
    });

    it("should approve male 60 or older with enough rural time", () => {
      const client = { ...baseClient, sexo: 'Masculino', data_nascimento: '1960-01-01', tempo_rural_anos: 15 }; // 64 years old
      const result = analisarViabilidade('Aposentadoria por Idade Rural', client);

      expect(result.status).toBe('aprovado');
      expect(result.viable).toBe(true);
      expect(result.messages.some(m => m.includes("Requisito Etário Cumprido (64 anos)"))).toBe(true);
      expect(result.messages.some(m => m.includes("Carência temporal (180 meses) aparentemente cumprida"))).toBe(true);
    });

    it("should reject female under 55", () => {
      const client = { ...baseClient, sexo: 'Feminino', data_nascimento: '1970-01-01' }; // 54 years old
      const result = analisarViabilidade('Aposentadoria por Idade Rural', client);

      expect(result.status).toBe('rejeitado');
      expect(result.viable).toBe(false);
      expect(result.messages.some(m => m.includes("Idade insuficiente. Atual: 54. Exigido: 55"))).toBe(true);
    });

    it("should approve female 55 or older with enough rural time", () => {
      const client = { ...baseClient, sexo: 'Feminino', data_nascimento: '1965-01-01', tempo_rural_anos: 15 }; // 59 years old
      const result = analisarViabilidade('rural_idade', client); // Testing alternative name

      expect(result.status).toBe('aprovado');
      expect(result.viable).toBe(true);
    });

    it("should flag attention if rural time is insufficient but age is met", () => {
      const client = { ...baseClient, sexo: 'Masculino', data_nascimento: '1960-01-01', tempo_rural_anos: 10 }; // 64 years old, only 10 years rural
      const result = analisarViabilidade('Aposentadoria por Idade Rural', client);

      expect(result.status).toBe('atencao');
      expect(result.viable).toBe(true);
      expect(result.messages.some(m => m.includes("Carência Rural: 10.0 anos provados. Meta: 15 anos"))).toBe(true);
    });

    it("should reject if age is not met AND flag attention for insufficient rural time", () => {
      const client = { ...baseClient, sexo: 'Masculino', data_nascimento: '1970-01-01', tempo_rural_anos: 10 }; // 54 years old, only 10 years rural
      const result = analisarViabilidade('Aposentadoria por Idade Rural', client);

      expect(result.status).toBe('rejeitado');
      expect(result.viable).toBe(false);
      expect(result.messages.some(m => m.includes("Idade insuficiente"))).toBe(true);
      expect(result.messages.some(m => m.includes("Carência Rural"))).toBe(true);
    });
  });

  describe("Aposentadoria Híbrida", () => {
    it("should reject male under 65", () => {
      const client = { ...baseClient, sexo: 'Masculino', data_nascimento: '1960-01-01' }; // 64 years old
      const result = analisarViabilidade('Aposentadoria Híbrida', client);

      expect(result.status).toBe('rejeitado');
      expect(result.messages.some(m => m.includes("Idade insuficiente para Híbrida. Atual: 64. Exigido: 65"))).toBe(true);
    });

    it("should reject female under 62", () => {
      const client = { ...baseClient, sexo: 'Feminino', data_nascimento: '1965-01-01' }; // 59 years old
      const result = analisarViabilidade('Aposentadoria Híbrida', client);

      expect(result.status).toBe('rejeitado');
      expect(result.messages.some(m => m.includes("Idade insuficiente para Híbrida. Atual: 59. Exigido: 62"))).toBe(true);
    });

    it("should flag attention if combined time is under 15 years", () => {
      const client = { ...baseClient, sexo: 'Masculino', data_nascimento: '1950-01-01', tempo_rural_anos: 5, tempo_urbano_anos: 5 }; // 74 years old, 10 years total
      const result = analisarViabilidade('hibrida', client);

      expect(result.status).toBe('atencao');
      expect(result.messages.some(m => m.includes("Soma dos tempos (10.0 anos) inferior a 15 anos"))).toBe(true);
    });

    it("should approve if age is met and combined time is at least 15 years", () => {
      const client = { ...baseClient, sexo: 'Masculino', data_nascimento: '1950-01-01', tempo_rural_anos: 8, tempo_urbano_anos: 7 }; // 74 years old, 15 years total
      const result = analisarViabilidade('Aposentadoria Híbrida', client);

      expect(result.status).toBe('aprovado');
      expect(result.messages.some(m => m.includes("Soma Rural + Urbano atinge a carência"))).toBe(true);
    });
  });

  describe("Salário Maternidade Rural", () => {
    it("should flag attention if under 16 years old", () => {
      const client = { ...baseClient, sexo: 'Feminino', data_nascimento: '2010-01-01' }; // 14 years old
      const result = analisarViabilidade('Salário Maternidade Rural', client);

      expect(result.messages.some(m => m.includes("Menor de 16 anos"))).toBe(true);
    });

    it("should flag attention if rural time is less than 10 months (0.83 years)", () => {
      const client = { ...baseClient, sexo: 'Feminino', data_nascimento: '1990-01-01', tempo_rural_anos: 0.5 }; // 6 months
      const result = analisarViabilidade('maternidade', client);

      expect(result.status).toBe('atencao');
      expect(result.messages.some(m => m.includes("É necessário provar atividade rural nos 10 meses anteriores"))).toBe(true);
    });

    it("should pass if rural time is at least 10 months", () => {
      const client = { ...baseClient, sexo: 'Feminino', data_nascimento: '1990-01-01', tempo_rural_anos: 1.0 };
      const result = analisarViabilidade('Salário Maternidade Rural', client);

      expect(result.status).toBe('aprovado');
      expect(result.messages.some(m => m.includes("Período de 10 meses de atividade rural indicado"))).toBe(true);
      expect(result.messages.some(m => m.includes("Qualidade de Segurada Especial na data do parto"))).toBe(true);
    });
  });

  describe("Auxílio por Incapacidade / Doença", () => {
    it("should apply exemption for accidents without requiring rural time", () => {
      const client = { ...baseClient, is_acidente: true, tempo_rural_anos: 0 };
      const result = analisarViabilidade('incapacidade', client); // Use generic match

      expect(result.messages.some(m => m.includes("Isenção de carência aplicada"))).toBe(true);
    });

    it("should reject if not accident and rural time is less than 12 months", () => {
      const client = { ...baseClient, is_acidente: false, tempo_rural_anos: 0.5 };
      const result = analisarViabilidade('doença', client); // Use generic match

      expect(result.status).toBe('rejeitado');
      expect(result.messages.some(m => m.includes("Carência mínima de 12 meses não atingida"))).toBe(true);
    });

    it("should reject if DII is provided but no rural time exists", () => {
      const client = { ...baseClient, data_dii: '2023-01-01', tempo_rural_anos: 0, is_acidente: true }; // Is accident so carencia passes, but DII check fails
      const result = analisarViabilidade('incapacidade', client); // Use generic match

      expect(result.status).toBe('rejeitado');
      expect(result.messages.some(m => m.includes("Não há tempo rural lançado. Impossível verificar qualidade de segurado"))).toBe(true);
    });

    it("should pass if DII provided and rural time exists", () => {
      const client = { ...baseClient, data_dii: '2023-01-01', tempo_rural_anos: 2 };
      const result = analisarViabilidade('doença', client); // Use generic match

      expect(result.status).toBe('aprovado');
      expect(result.messages.some(m => m.includes("Carência de 12 meses cumprida"))).toBe(true);
      expect(result.messages.some(m => m.includes("Verificar documentos rurais próximos a"))).toBe(true);
    });

    it("should flag attention if DII is missing", () => {
      const client = { ...baseClient, tempo_rural_anos: 2 }; // No DII
      const result = analisarViabilidade('doença', client); // Use generic match

      expect(result.status).toBe('aprovado'); // Does not reject based on missing DII
      expect(result.messages.some(m => m.includes("DII não informada. Não é possível fixar o marco da Qualidade de Segurado"))).toBe(true);
    });
  });

  describe("Pensão por Morte Rural", () => {
    it("should flag attention if no rural time for the deceased is indicated", () => {
      const client = { ...baseClient, tempo_rural_anos: 0 };
      const result = analisarViabilidade('Pensão por morte', client);

      expect(result.status).toBe('atencao');
      expect(result.messages.some(m => m.includes("Necessário provar que o falecido trabalhava na roça na Data do Óbito"))).toBe(true);
    });

    it("should acknowledge rural activity if rural time is indicated", () => {
      const client = { ...baseClient, tempo_rural_anos: 5 };
      const result = analisarViabilidade('pensao', client);

      expect(result.messages.some(m => m.includes("Há indícios de atividade rural do instituidor"))).toBe(true);
    });

    it("should flag short marriage under 2 years", () => {
      const client = {
        ...baseClient,
        tempo_rural_anos: 5,
        data_casamento: '2022-01-01',
        data_obito: '2023-01-01' // 12 months marriage
      };
      const result = analisarViabilidade('Pensão por morte', client);

      expect(result.messages.some(m => m.includes("Casamento/União com menos de 2 anos (12 meses). Pensão durará apenas 4 MESES"))).toBe(true);
    });

    it("should acknowledge long marriage over 2 years", () => {
      const client = {
        ...baseClient,
        tempo_rural_anos: 5,
        data_casamento: '2010-01-01',
        data_obito: '2023-01-01'
      };
      const result = analisarViabilidade('Pensão por morte', client);

      expect(result.messages.some(m => m.includes("Casamento/União consolidada (> 2 anos)"))).toBe(true);
    });

    it("should calculate pension duration if age is provided and marriage is long", () => {
      const client = {
        ...baseClient,
        tempo_rural_anos: 5,
        data_casamento: '2010-01-01',
        data_obito: '2023-01-01',
        idade_conjuge_obito: 40 // Should be 15 anos according to calcularDuracaoPensao
      };
      const result = analisarViabilidade('Pensão por morte', client);

      expect(result.messages.some(m => m.includes("Duração estimada (Cônjuge com 40 anos): 15 anos"))).toBe(true);
    });

    it("should calculate pension duration if age is provided and marriage is long - vitalicia", () => {
      const client = {
        ...baseClient,
        tempo_rural_anos: 5,
        data_casamento: '2010-01-01',
        data_obito: '2023-01-01',
        idade_conjuge_obito: 50 // Should be VITALÍCIA according to calcularDuracaoPensao
      };
      const result = analisarViabilidade('Pensão por morte', client);

      expect(result.messages.some(m => m.includes("Duração estimada (Cônjuge com 50 anos): VITALÍCIA"))).toBe(true);
    });

    it("should prompt for age if not provided", () => {
      const client = {
        ...baseClient,
        tempo_rural_anos: 5,
        data_casamento: '2010-01-01',
        data_obito: '2023-01-01',
        // idade_conjuge_obito missing
      };
      const result = analisarViabilidade('Pensão por morte', client);

      expect(result.messages.some(m => m.includes("Informe a idade do viúvo(a) para calcular a duração do benefício"))).toBe(true);
    });
  });

});
