import clsx from "clsx"
import React from "react"
import ParameterTypesItems from "./Items"

export type Parameter = {
  name: string
  type: string
  optional?: boolean
  defaultValue?: string
  description?: string
  children?: Parameter[]
}

type ParameterTypesType = {
  parameters: Parameter[]
} & React.HTMLAttributes<HTMLDivElement>

const ParameterTypes = ({
  parameters,
  className,
  ...props
}: ParameterTypesType) => {
  return (
    <div
      className={clsx("bg-docs-bg shadow-card-rest rounded", className)}
      {...props}
    >
      <ParameterTypesItems parameters={parameters} />
    </div>
  )
}

export default ParameterTypes