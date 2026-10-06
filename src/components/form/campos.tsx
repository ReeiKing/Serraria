"use client"

import type { ReactNode } from "react"
import { Controller, useFormContext } from "react-hook-form"

import { Field, FieldDescription, FieldError, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
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
  ...input
}: Base & Omit<React.ComponentProps<typeof Input>, "name"> & { acao?: ReactNode }) {
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
