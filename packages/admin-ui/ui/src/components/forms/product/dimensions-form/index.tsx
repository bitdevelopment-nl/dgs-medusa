import {NestedForm} from "../../../../utils/nested-form"
import InputField from "../../../molecules/input"

export type DimensionsFormType = {
    length: number | null
    width: number | null
    height: number | null
    weight: number | null,
    diameter: number | null,
}

type DimensionsFormProps = {
    form: NestedForm<DimensionsFormType>
}

const parseCentimeterInput = (value: string | undefined): number|null => value !== undefined && value !== ""
    ? parseFloat(value?.toString()?.replace(',', '.') ?? "") * 10
    : null;

const parseMillimeterInput = (value: string | undefined): number|null => value !== undefined && value !== ""
    ? parseInt(value ?? "")
    : null;

/**
 * Re-usable nested form used to submit dimensions information for products and their variants.
 * @example
 * <DimensionsForm form={nestedForm(form, "dimensions")} />
 */
const DimensionsForm = ({form}: DimensionsFormProps) => {
    const {
        register,
        path,
        formState: {errors},
    } = form

    return (
        <div className="gap-large grid grid-cols-3">
            <InputField
                label="Breedte (in cm)"
                placeholder="100..."
                type="text"
                {...register(path("width"), {
                    required: false,
                    min: 1,
                    setValueAs: parseCentimeterInput,
                })}
                errors={errors}
            />
            <InputField
                label="Lengte (in cm)"
                placeholder="100..."
                type="text"
                {...register(path("length"), {
                    required: false,
                    min: 1,
                    setValueAs: parseCentimeterInput,
                })}
                errors={errors}
            />
            <InputField
                label="Hoogte (in cm)"
                placeholder="100..."
                type="text"
                {...register(path("height"), {
                    required: false,
                    min: 1,
                    setValueAs: parseCentimeterInput,
                })}
                errors={errors}
            />
            <InputField
                label="Diameter (in mm)"
                placeholder="100..."
                type="text"
                {...register(path("diameter"), {
                    required: false,
                    min: 1,
                    setValueAs: parseMillimeterInput,
                    pattern: /([0-9]+)/
                })}
                errors={errors}
            />
            <InputField
                label="Gewicht (in gram)"
                placeholder="100..."
                type="text"
                {...register(path("weight"), {
                    min: 1,
                    required: true,
                    setValueAs: (value) => parseInt(value) ?? 0,
                    pattern: /([0-9]+)/
                })}
                errors={errors}
            />
        </div>
    )
}

export default DimensionsForm
