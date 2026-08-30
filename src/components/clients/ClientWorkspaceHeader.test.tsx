import { cleanup, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, describe, expect, it } from 'vitest';
import type { Client } from '../../types';
import { ClientWorkspaceHeader } from './ClientWorkspaceHeader';

const client: Client = {
  id: 42,
  nome: 'Cliente de Teste',
  cpf: '',
  status_processo: 'Em Andamento',
  created_at: '2026-08-29T12:00:00.000Z',
};

afterEach(cleanup);

describe('ClientWorkspaceHeader', () => {
  it('mantém o cliente visível e oferece as áreas do atendimento', () => {
    render(
      <MemoryRouter initialEntries={['/cliente/42']}>
        <ClientWorkspaceHeader client={client} />
      </MemoryRouter>,
    );

    expect(screen.getByRole('heading', { name: 'Cliente de Teste' })).toBeInTheDocument();
    expect(screen.getByText('CPF não informado')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Resumo' })).toHaveAttribute('aria-current', 'page');
    expect(screen.getByRole('link', { name: 'Cadastro' })).toHaveAttribute('href', '/cliente/42/cadastro');
    expect(screen.getByRole('link', { name: 'Entrevista rural' })).toHaveAttribute('href', '/cliente/42/entrevista');
    expect(screen.getByRole('link', { name: 'Documentos' })).toHaveAttribute('href', '/documentos/42');
  });

  it('não repete a ação de editar dentro da própria tela de cadastro', () => {
    render(
      <MemoryRouter initialEntries={['/cliente/42/cadastro']}>
        <ClientWorkspaceHeader client={client} />
      </MemoryRouter>,
    );

    expect(screen.getByRole('link', { name: 'Cadastro' })).toHaveAttribute('aria-current', 'page');
    expect(screen.queryByRole('link', { name: 'Editar cadastro' })).not.toBeInTheDocument();
  });
});
