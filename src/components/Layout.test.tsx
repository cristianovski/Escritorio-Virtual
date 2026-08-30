import { render, screen, within } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';
import { Layout } from './Layout';

vi.mock('../lib/supabase', () => ({
  supabase: {
    auth: {
      signOut: vi.fn(),
    },
  },
}));

describe('Layout', () => {
  it('expõe a navegação global e mantém a área atual identificada', () => {
    render(
      <MemoryRouter initialEntries={['/clientes']}>
        <Routes>
          <Route element={<Layout />}>
            <Route path="clientes" element={<div>Conteúdo dos clientes</div>} />
          </Route>
        </Routes>
      </MemoryRouter>,
    );

    const navigation = screen.getByRole('navigation', { name: 'Navegação principal' });
    expect(within(navigation).getByRole('link', { name: 'Clientes' })).toHaveAttribute('aria-current', 'page');
    expect(within(navigation).getByRole('link', { name: 'Visão geral' })).not.toHaveAttribute('aria-current');
    expect(screen.getByText('Conteúdo dos clientes')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Pular para o conteúdo' })).toHaveAttribute('href', '#main-content');
  });
});
