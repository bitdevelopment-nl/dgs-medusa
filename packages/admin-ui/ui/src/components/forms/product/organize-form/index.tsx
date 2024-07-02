import { Controller } from "react-hook-form"
import NestedMultiselect from "../../../../domain/categories/components/multiselect"
import {
  FeatureFlag,
  useFeatureFlag,
} from "../../../../providers/feature-flag-provider"
import { Option } from "../../../../types/shared"
import { NestedForm } from "../../../../utils/nested-form"
import InputHeader from "../../../fundamentals/input-header"
import {
  NextCreateableSelect,
  NextSelect,
} from "../../../molecules/select/next-select"
import TagInput from "../../../molecules/tag-input"
import useOrganizeData from "./use-organize-data"

export type OrganizeFormType = {
  tags: string[] | null
  categories: string[] | null
}

type Props = {
  form: NestedForm<OrganizeFormType>
}

const OrganizeForm = ({ form }: Props) => {
  const { control, path, setValue } = form
  const {
      categoriesOptions = [],
  } = useOrganizeData()

  const { isFeatureEnabled } = useFeatureFlag()

  return (
    <div>
      {isFeatureEnabled(FeatureFlag.PRODUCT_CATEGORIES) ? (
        <>
          <InputHeader label="Categories" className="mb-2" />
          <Controller
            name={path("categories")}
            control={control}
            render={({ field: { value, onChange } }) => {
              const initiallySelected = (value || []).reduce((acc, val) => {
                acc[val] = true
                return acc
              }, {} as Record<string, true>)

              return (
                <NestedMultiselect
                  placeholder={
                    !!categoriesOptions?.length
                      ? "Choose categories"
                      : "No categories available"
                  }
                  onSelect={onChange}
                  options={categoriesOptions}
                  initiallySelected={initiallySelected}
                />
              )
            }}
          />
        </>
      ) : null}

      <div className="mb-large" />

      <Controller
        control={control}
        name={path("tags")}
        render={({ field: { value, onChange } }) => {
          return <TagInput onChange={onChange} values={value || []} />
        }}
      />
    </div>
  )
}

export default OrganizeForm
