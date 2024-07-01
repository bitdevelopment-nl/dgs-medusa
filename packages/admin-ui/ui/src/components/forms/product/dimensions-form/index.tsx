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

const validateDimension = {
    positive: v => parseInt(v) > 0,
};

const validateWeight = {
    positive: v => parseInt(v) > 0,
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
                    validate: validateDimension,
                    setValueAs: (value) => value * 10,
                    pattern: /([0-9]+)([.,][0-9]{0,2})?/
                })}
                errors={errors}
            />
            <InputField
                label="Lengte (in cm)"
                placeholder="100..."
                type="text"
                {...register(path("length"), {
                    validate: validateDimension,
                    setValueAs: (value) => value * 10,
                    pattern: /([0-9]+)([.,][0-9]{0,2})?/
                })}
                errors={errors}
            />
            <InputField
                label="Hoogte (in cm)"
                placeholder="100..."
                type="text"
                {...register(path("height"), {
                    validate: validateDimension,
                    setValueAs: (value) => value * 10,
                    pattern: /([0-9]+)([.,][0-9]{0,2})?/
                })}
                errors={errors}
            />
            <InputField
                label="Diameter (in cm)"
                placeholder="100..."
                type="text"
                {...register(path("diameter"), {
                    validate: validateDimension,
                    setValueAs: (value) => value * 10,
                    pattern: /([0-9]+)([.,][0-9]{0,2})?/
                })}
                errors={errors}
            />
            <InputField
                label="Gewicht (in gram)"
                placeholder="100..."
                type="text"
                {...register(path("weight"), {
                    validate: validateWeight,
                    setValueAs: (value) => parseInt(value),
                    pattern: /([0-9]+)/
                })}
                errors={errors}
            />
        </div>
    )
}

export default DimensionsForm
