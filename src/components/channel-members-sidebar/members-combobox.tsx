import { useQuery } from "@tanstack/react-query";
import { Combobox, ComboboxProps } from "../combobox";
import { fetchMembers } from "@/http/fetch-members";

type MembersComboboxProps = Pick<ComboboxProps, 'onChange' | 'value' | 'placeholder' | 'buttonPlaceholder'>

export function MembersCombobox({ value, onChange, placeholder, buttonPlaceholder }: MembersComboboxProps) {

  const { data, isFetching, error } = useQuery({
    queryKey: ['users'],
    initialData: [],
    queryFn: async () => {
      const { data } = await fetchMembers()
      return data
    },
  })

  const options = data.map(item => ({ value: `${item.nome}-${String(item.id)}`, label: item.nome }))

  return (
    <div>
      <Combobox
        options={options}
        value={value}
        disabled={isFetching}
        onChange={onChange}
        placeholder={placeholder}
        buttonPlaceholder={buttonPlaceholder}
      />
    </div>
  )
}