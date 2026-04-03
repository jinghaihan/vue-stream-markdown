export type NodeRenderers<TComponent = unknown, TNodeType extends PropertyKey = string>
  = Partial<Record<TNodeType, TComponent>>

export type UIComponents<TComponent = unknown, TComponentName extends PropertyKey = string>
  = Record<TComponentName, TComponent>

export type Icons<
  TComponent = unknown,
  TIconName extends PropertyKey = string,
  TOptionalIconName extends PropertyKey = never,
> = Record<TIconName, TComponent>
  & Partial<Record<TOptionalIconName, TComponent>>
  & Record<string, TComponent>

export type ControlTransformer<TControl, TProps>
  = (builtin: TControl[], props: TProps) => TControl[]
