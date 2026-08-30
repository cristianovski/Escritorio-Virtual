import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { CivilDataForm } from './CivilDataForm';

describe('CivilDataForm', () => {
  it('avisa o contêiner quando o usuário altera um campo', async () => {
    const user = userEvent.setup();
    const onDirtyChange = vi.fn();

    render(
      <CivilDataForm
        initialData={{
          nome: 'Maria da Silva',
          sexo: 'Feminino',
          capacidade_civil: 'Plena',
        }}
        onSubmit={() => undefined}
        onDirtyChange={onDirtyChange}
      />,
    );

    await user.type(screen.getByLabelText(/Nome completo/i), ' Souza');

    await waitFor(() => {
      expect(onDirtyChange).toHaveBeenCalledWith(true);
    });
  });
});
