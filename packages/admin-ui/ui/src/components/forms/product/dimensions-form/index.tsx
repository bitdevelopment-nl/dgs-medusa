import FormValidator from "../../../../utils/form-validator"
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

const validateDimensionInCentimeter = {
    positive: (v: string) => parseInt(v.toString().replace(',', '.')) >= 0,
};

const validateDimensionInMillimeter = {
    positive: (v: string) => (new RegExp('[.,]', 'g')).exec(v) === null && parseInt(v) >= 0,
};



const validateWeight = {
    positive: (v: string) => parseInt(v) >= 0,
};

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
                    validate: validateDimensionInCentimeter,
                    setValueAs: (value) => value * 10,
                })}
                errors={errors}
            />
            <InputField
                label="Lengte (in cm)"
                placeholder="100..."
                type="text"
                {...register(path("length"), {
                    validate: validateDimensionInCentimeter,
                    setValueAs: (value) => value * 10,
                })}
                errors={errors}
            />
            <InputField
                label="Hoogte (in cm)"
                placeholder="100..."
                type="text"
                {...register(path("height"), {
                    validate: validateDimensionInCentimeter,
                    setValueAs: (value) => value * 10,
                })}
                errors={errors}
            />
            <InputField
                label="Diameter (in mm)"
                placeholder="100..."
                type="text"
                {...register(path("diameter"), {
                    validate: validateDimensionInMillimeter,
                    setValueAs: (value) => value * 1,
                })}
                errors={errors}
            />
            <InputField
                label="Gewicht (in gram)"
                placeholder="100..."
                type="text"
                {...register(path("weight"), {
                    validate: validateWeight,
                    setValueAs: (value) => parseInt(value) ?? 0,
                    pattern: /([0-9]+)/
                })}
                errors={errors}
            />
        </div>
    )
}

export default DimensionsForm
