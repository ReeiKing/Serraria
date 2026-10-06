"use client"

import { Check, ChevronsUpDown } from "lucide-react"
import { useState, type ReactNode } from "react"
import { Controller, useFormContext } from "react-hook-form"

import { Button } from "@/components/ui/button"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import { Field, FieldDescription, FieldError, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import { cn } from "@/lib/utils"

type Base = {
  name: string
  label: string
  descricao?: ReactNode
  className?: string
  disabled?: boolean
}

function useCampo(name: string) {
  const { control, formState } = useFormContext()
  const erro = name
    .split(".")
    .reduce<unknown>(
      (acc, k) => (acc as Record<string, unknown> | undefined)?.[k],
      formState.errors
    ) as { message?: string } | undefined
  return { control, erro }
}

export function CampoTexto({
  name,
  label,
  descricao,
  className,
  disabled,
  acao,
  inputClassName,
  ...input
}: Base &
  Omit<React.ComponentProps<typeof Input>, "name"> & {
    acao?: ReactNode
    inputClassName?: string
  }) {
  const { control, erro } = useCampo(name)
  return (
    <Field data-invalid={!!erro} className={className}>
      <FieldLabel htmlFor={name}>{label}</FieldLabel>
      <Controller
        name={name}
        control={control}
        render={({ field }) => (
          <div className="flex gap-2">
            <Input
              id={name}
              aria-invalid={!!erro}
              disabled={disabled}
              className={inputClassName}
              {...input}
              {...field}
              value={field.value ?? ""}
            />
            {acao}
          </div>
        )}
      />
      {descricao && <FieldDescription>{descricao}</FieldDescription>}
      <FieldError errors={[erro]} />
    </Field>
  )
}

/** Campo numérico que aceita vírgula (1,8). O valor fica como texto até a validação. */
export function CampoNumero({
  sufixo,
  ...props
}: Base & { placeholder?: string; sufixo?: string; autoFocus?: boolean }) {
  const { control, erro } = useCampo(props.name)
  return (
    <Field data-invalid={!!erro} className={props.className}>
      <FieldLabel htmlFor={props.name}>{props.label}</FieldLabel>
      <Controller
        name={props.name}
        control={control}
        render={({ field }) => (
          <div className="relative">
            <Input
              id={props.name}
              inputMode="decimal"
              autoComplete="off"
              aria-invalid={!!erro}
              disabled={props.disabled}
              placeholder={props.placeholder}
              autoFocus={props.autoFocus}
              className={cn("tabular-nums", sufixo && "pr-12")}
              {...field}
              value={field.value ?? ""}
              onChange={(e) => field.onChange(e.target.value.replace(/[^\d.,-]/g, ""))}
            />
            {sufixo && (
              <span className="text-muted-foreground pointer-events-none absolute inset-y-0 right-3 flex items-center text-sm">
                {sufixo}
              </span>
            )}
          </div>
        )}
      />
      {props.descricao && <FieldDescription>{props.descricao}</FieldDescription>}
      <FieldError errors={[erro]} />
    </Field>
  )
}

export function CampoTextoLongo({
  rows = 3,
  ...props
}: Base & { rows?: number; placeholder?: string }) {
  const { control, erro } = useCampo(props.name)
  return (
    <Field data-invalid={!!erro} className={props.className}>
      <FieldLabel htmlFor={props.name}>{props.label}</FieldLabel>
      <Controller
        name={props.name}
        control={control}
        render={({ field }) => (
          <Textarea
            id={props.name}
            rows={rows}
            placeholder={props.placeholder}
            disabled={props.disabled}
            {...field}
            value={field.value ?? ""}
          />
        )}
      />
      {props.descricao && <FieldDescription>{props.descricao}</FieldDescription>}
      <FieldError errors={[erro]} />
    </Field>
  )
}

export type OpcaoSelect = { valor: string; rotulo: string }

const VAZIO = "__vazio__"

export function CampoSelect({
  opcoes,
  placeholder = "Selecione",
  permitirVazio,
  aoMudar,
  ...props
}: Base & {
  opcoes: OpcaoSelect[]
  placeholder?: string
  permitirVazio?: boolean
  aoMudar?: (v: string) => void
}) {
  const { control, erro } = useCampo(props.name)
  return (
    <Field data-invalid={!!erro} className={props.className}>
      <FieldLabel htmlFor={props.name}>{props.label}</FieldLabel>
      <Controller
        name={props.name}
        control={control}
        render={({ field }) => (
          <Select
            value={field.value ? String(field.value) : permitirVazio ? VAZIO : ""}
            onValueChange={(v) => {
              const valor = v === VAZIO ? "" : v
              field.onChange(valor)
              aoMudar?.(valor)
            }}
            disabled={props.disabled}
          >
            <SelectTrigger
              id={props.name}
              aria-invalid={!!erro}
              className="w-full"
              onBlur={field.onBlur}
            >
              <SelectValue placeholder={placeholder} />
            </SelectTrigger>
            <SelectContent>
              {permitirVazio && <SelectItem value={VAZIO}>— Nenhum —</SelectItem>}
              {opcoes.map((o) => (
                <SelectItem key={o.valor} value={o.valor}>
                  {o.rotulo}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      />
      {props.descricao && <FieldDescription>{props.descricao}</FieldDescription>}
      <FieldError errors={[erro]} />
    </Field>
  )
}

export function CampoSwitch(props: Base) {
  const { control } = useCampo(props.name)
  return (
    <Field orientation="horizontal" className={cn("items-center", props.className)}>
      <Controller
        name={props.name}
        control={control}
        render={({ field }) => (
          <Switch
            id={props.name}
            checked={!!field.value}
            onCheckedChange={field.onChange}
            disabled={props.disabled}
          />
        )}
      />
      <FieldLabel htmlFor={props.name} className="font-normal">
        {props.label}
      </FieldLabel>
    </Field>
  )
}

/** Select com busca (digite para filtrar) — bom para listas longas: fornecedores, placas… */
export function CampoBusca({
  opcoes,
  placeholder = "Selecione",
  vazio = "Nada encontrado.",
  permitirVazio,
  aoMudar,
  ...props
}: Base & {
  opcoes: (OpcaoSelect & { detalhe?: string })[]
  placeholder?: string
  vazio?: string
  permitirVazio?: boolean
  aoMudar?: (v: string) => void
}) {
  const { control, erro } = useCampo(props.name)
  const [aberto, setAberto] = useState(false)
  return (
    <Field data-invalid={!!erro} className={props.className}>
      <FieldLabel htmlFor={props.name}>{props.label}</FieldLabel>
      <Controller
        name={props.name}
        control={control}
        render={({ field }) => {
          const atual = opcoes.find((o) => o.valor === field.value)
          return (
            <Popover open={aberto} onOpenChange={setAberto}>
              <PopoverTrigger asChild>
                <Button
                  id={props.name}
                  type="button"
                  variant="outline"
                  role="combobox"
                  aria-expanded={aberto}
                  aria-invalid={!!erro}
                  disabled={props.disabled}
                  className="h-11 w-full justify-between font-normal"
                >
                  <span className={cn("truncate", !atual && "text-muted-foreground")}>
                    {atual?.rotulo ?? placeholder}
                  </span>
                  <ChevronsUpDown className="opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-(--radix-popover-trigger-width) p-0" align="start">
                <Command
                  filter={(valor, busca) => (semAcento(valor).includes(semAcento(busca)) ? 1 : 0)}
                >
                  <CommandInput placeholder="Digite para buscar…" />
                  <CommandList>
                    <CommandEmpty>{vazio}</CommandEmpty>
                    <CommandGroup>
                      {permitirVazio && (
                        <CommandItem
                          value="— nenhum —"
                          onSelect={() => {
                            field.onChange("")
                            aoMudar?.("")
                            setAberto(false)
                          }}
                        >
                          — Nenhum —
                        </CommandItem>
                      )}
                      {opcoes.map((o) => (
                        <CommandItem
                          key={o.valor}
                          value={`${o.rotulo} ${o.detalhe ?? ""} ${o.valor}`}
                          onSelect={() => {
                            field.onChange(o.valor)
                            aoMudar?.(o.valor)
                            setAberto(false)
                          }}
                        >
                          <Check
                            className={cn(
                              "size-4",
                              o.valor === field.value ? "opacity-100" : "opacity-0"
                            )}
                          />
                          <span className="flex flex-col">
                            {o.rotulo}
                            {o.detalhe && (
                              <span className="text-muted-foreground text-xs">{o.detalhe}</span>
                            )}
                          </span>
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
          )
        }}
      />
      {props.descricao && <FieldDescription>{props.descricao}</FieldDescription>}
      <FieldError errors={[erro]} />
    </Field>
  )
}

const semAcento = (s: string) => s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase()
