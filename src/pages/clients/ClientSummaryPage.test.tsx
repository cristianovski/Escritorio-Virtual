import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it } from 'vitest';
import type { Client } from '../../types';
import { ClientSummaryPage } from './ClientSummaryPage';

const client: Client = {
  id: 7,
  nome: 'Cliente Exemplo',
  cpf: '',
  endereco: 'Endereço de teste',
  status_processo: 'A Iniciar',
  cidade: 'Cidade de Teste',
  created_at: '2026-08-29T12:00:00.000Z',
};

describe('ClientSummaryPage', () => {
  it('indica a próxima pendência e oferece atalhos do atendimento', () => {
    render(
      <MemoryRouter>
        <ClientSummaryPage cliente={client} onBack={() => undefined} />
      </MemoryRouter>,
    );

    expect(screen.getByRole('heading', { name: 'Resumo do cliente' })).toBeInTheDocument();
    expect(screen.getByText('Completar identificação civil')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Completar cadastro/i })).toHaveAttribute('href', '/cliente/7/cadastro');
    expect(screen.getByRole('progressbar', { name: 'Completude do cadastro essencial' })).toHaveAttribute('aria-valuenow', '25');
  });
});
