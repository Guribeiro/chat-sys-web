import { forwardRef, useState, type ComponentProps } from 'react'
import { EyeIcon, EyeOffIcon } from 'lucide-react'

import { Input } from '../ui/input'

type PasswordInputProps = Omit<ComponentProps<typeof Input>, 'type'> & {
  /** Controlled visibility, to show two fields (password + confirmation) together */
  visible?: boolean
  onVisibleChange?: (visible: boolean) => void
}

export const PasswordInput = forwardRef<HTMLInputElement, PasswordInputProps>(
  ({ visible: controlled, onVisibleChange, ...props }, ref) => {
    const [own, setOwn] = useState(false)
    const visible = controlled ?? own
    const toggle = () => (onVisibleChange ?? setOwn)(!visible)

    return (
      <div className="relative">
        <Input ref={ref} type={visible ? 'text' : 'password'} className="pr-10" {...props} />
        <button
          type="button"
          onClick={toggle}
          aria-label={visible ? 'Ocultar senha' : 'Mostrar senha'}
          aria-pressed={visible}
          className="absolute inset-y-0 right-0 flex w-10 items-center justify-center rounded-r-md text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-2 focus-visible:outline-ring"
        >
          {visible ? <EyeOffIcon className="size-4" /> : <EyeIcon className="size-4" />}
        </button>
      </div>
    )
  },
)
PasswordInput.displayName = 'PasswordInput'
