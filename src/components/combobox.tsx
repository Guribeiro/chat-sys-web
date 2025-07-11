import * as React from "react";
import { Check, ChevronsUpDown } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandList,
  CommandItem,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

// Define a type for your options to ensure consistency
export interface ComboboxOption {
  value: string;
  label: string;
}

// Define the props for your reusable Combobox component
export interface ComboboxProps {
  options: ComboboxOption[];
  value: string; // The currently selected value
  onChange: (value: string) => void; // Callback when the value changes
  placeholder?: string; // Optional placeholder text for the input
  buttonPlaceholder?: string; // Optional placeholder text for the button
  className?: string; // Optional className for the button
  disabled?: boolean;
}

export function Combobox({
  options,
  value,
  onChange,
  placeholder = "Buscar...",
  buttonPlaceholder = "Selecione um membro...",
  className,
  disabled
}: ComboboxProps) {
  const [open, setOpen] = React.useState(false);

  const selectedLabel = options.find((option) => option.value === value)?.label;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild className="w-full">
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn("w-full justify-between", className)} // Apply custom className
        >
          {value ? selectedLabel : buttonPlaceholder}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0">
        <Command shouldFilter >
          <CommandInput placeholder={placeholder} className="h-9" />
          <CommandList aria-disabled>
            <CommandEmpty>Nenhum resultado encontrado...</CommandEmpty>
            <CommandGroup className="w-full">
              {options.map((option) => (
                <CommandItem
                  key={option.value}
                  value={option.value}
                  disabled={disabled}
                  onSelect={(currentValue) => {
                    if (currentValue !== value) {
                      onChange(currentValue);
                    }
                    setOpen(false);
                  }}
                >
                  {option.label}
                  <Check
                    className={cn(
                      "ml-auto h-4 w-4",
                      value === option.value ? "opacity-100" : "opacity-0"
                    )}
                  />
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
