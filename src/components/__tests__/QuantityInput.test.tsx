import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useState } from 'react';
import { describe, expect, it, vi } from 'vitest';
import QuantityInput from '../QuantityInput';

const ControlledQuantity = ({
  initial = 1,
  min = 1,
  max = 3,
  onChange,
}: {
  initial?: number;
  min?: number;
  max?: number;
  onChange?: (value: number) => void;
}) => {
  const [value, setValue] = useState(initial);
  return (
    <QuantityInput
      value={value}
      min={min}
      max={max}
      onChange={(next) => {
        setValue(next);
        onChange?.(next);
      }}
    />
  );
};

describe('QuantityInput', () => {
  it('disables decrement button at the minimum value and increments correctly', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<ControlledQuantity min={1} max={2} initial={1} onChange={onChange} />);

    const decrement = screen.getByRole('button', { name: '-' });
    const increment = screen.getByRole('button', { name: '+' });

    expect(decrement).toBeDisabled();

    await user.click(increment);
    expect(onChange).toHaveBeenLastCalledWith(2);
    expect(decrement).not.toBeDisabled();
  });

  it('clamps the value when trying to go above the maximum', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<ControlledQuantity min={1} max={2} initial={2} onChange={onChange} />);

    const increment = screen.getByRole('button', { name: '+' });

    expect(increment).toBeDisabled();

    await user.click(increment);
    expect(onChange).not.toHaveBeenCalled();
  });
});


