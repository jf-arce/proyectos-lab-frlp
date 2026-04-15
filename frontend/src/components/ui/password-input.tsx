import * as React from 'react';
import { Eye, EyeOff } from 'lucide-react';
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from '@/components/ui/input-group';

function PasswordInput({
  ...props
}: Omit<React.ComponentProps<'input'>, 'type'>) {
  const [show, setShow] = React.useState(false);

  return (
    <InputGroup>
      <InputGroupInput type={show ? 'text' : 'password'} {...props} />
      <InputGroupAddon align="inline-end">
        <InputGroupButton
          size="icon-sm"
          aria-label={show ? 'Ocultar contraseña' : 'Mostrar contraseña'}
          onClick={() => setShow((v) => !v)}
          tabIndex={-1}
        >
          {show ? <EyeOff /> : <Eye />}
        </InputGroupButton>
      </InputGroupAddon>
    </InputGroup>
  );
}

export { PasswordInput };
