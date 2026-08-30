import { z } from "zod";

// Schema para dados civis
export const civilSchema = z.object({
  nome: z.string().trim().min(3, "Informe o nome completo"),
  cpf: z.string().length(14, "CPF inválido"),
  data_nascimento: z.string()
    .min(1, "Informe a data de nascimento")
    .refine((val) => !isNaN(Date.parse(val)), "Data inválida"),
  sexo: z.enum(["Masculino", "Feminino"]),
  analfabeto: z.boolean(),
  capacidade_civil: z.enum(["Plena", "Relativamente Incapaz", "Absolutamente Incapaz"]),

  // Representante legal (opcionais)
  rep_nome: z.string().optional(),
  rep_cpf: z.string().optional(),
  rep_rg: z.string().optional(),
  rep_parentesco: z.string().optional(),
  rep_endereco: z.string().optional(),
  rep_telefone: z.string().optional(),

  // Documentos
  rg: z.string().optional(),
  orgao_expedidor: z.string().optional(),
  data_expedicao: z.string().optional(),
  nit: z.string().optional(),
  ctps: z.string().optional(),

  // Filiação
  nome_mae: z.string().optional(),
  nome_pai: z.string().optional(),
  estado_civil: z.enum(["Solteiro(a)", "Casado(a)", "Divorciado(a)", "Viúvo(a)", "União Estável"]).optional(),
  nome_conjuge: z.string().optional(),
  cpf_conjuge: z.string().optional(),

  // Endereço e contato (REMOVIDAS AS TRAVAS DE CARACTERES MÍNIMOS)
  cep: z.string().optional(),
  endereco: z.string().optional(),
  bairro: z.string().optional(),
  cidade: z.string().optional(),
  telefone: z.string().optional(),
  telefone_recado: z.string().optional(),

  // Análise
  resumo_cnis: z.string().optional(),
  historico_beneficios: z.string().optional(),
  possui_cnpj: z.boolean().optional(),
  detalhes_cnpj: z.string().optional(),
  possui_outra_renda: z.boolean().optional(),
  detalhes_renda: z.string().optional(),
  endereco_divergente: z.boolean().optional(),
  justificativa_endereco: z.string().optional(),

  status_processo: z.enum(["A Iniciar", "Em Andamento", "Finalizado", "Suspenso"]).optional(),
});

export type CivilFormValues = z.infer<typeof civilSchema>;

// Schema para dados rurais
export const ruralSchema = z.object({
  nome_imovel: z.string().optional(),
  municipio_uf: z.string().optional(),
  itr_nirf: z.string().optional(),
  area_total: z.string().optional(),
  area_util: z.string().optional(),
  condicao_posse: z.enum(["proprietario", "posseiro", "arrendatario", "parceiro", "comodatario", "assentado"]).optional(),
  outorgante_nome: z.string().optional(),
  outorgante_cpf: z.string().optional(),
  culturas: z.string().optional(),
  animais: z.string().optional(),
  destinacao: z.string().optional(),
  locais_venda: z.string().optional(),
  tem_empregados: z.enum(["sim", "nao"]).optional(),
  tempo_empregados: z.string().optional(),
  grupo_familiar: z.string().optional(),
});

export type RuralFormValues = z.infer<typeof ruralSchema>;
