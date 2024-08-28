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

const validateDimensionInCentimeter = (name: string) => ({
    positive: (v: number) => v >= 0 || `${name} moet groter of gelijk zijn dan 0`,
});

const validateDimensionInMillimeter = (name: string) => ({
    positive: (v: number) =>
        (new RegExp('[.,]', 'g')).exec(v.toString()) === null && v >= 0
        || `${name} moet groter of gelijk zijn dan 0`,
});

const validateWeight = {
    positive: (v: number) => v >= 0,
};

const parseCentimeterInput = (value: string | undefined): number => parseFloat(value?.toString()?.replace(',', '.') ?? "") * 10;
const parseMillimeterInput = (value: string | undefined): number => parseInt(value ?? "");

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
                    validate: validateDimensionInCentimeter('Breedte'),
                    setValueAs: parseCentimeterInput,
                })}
                errors={errors}
            />
            <InputField
                label="Lengte (in cm)"
                placeholder="100..."
                type="text"
                {...register(path("length"), {
                    validate: validateDimensionInCentimeter('Lengte'),
                    setValueAs: parseCentimeterInput,
                })}
                errors={errors}
            />
            <InputField
                label="Hoogte (in cm)"
                placeholder="100..."
                type="text"
                {...register(path("height"), {
                    validate: validateDimensionInCentimeter('Hoogte'),
                    setValueAs: parseCentimeterInput,
                })}
                errors={errors}
            />
            <InputField
                label="Diameter (in mm)"
                placeholder="100..."
                type="text"
                {...register(path("diameter"), {
                    validate: validateDimensionInMillimeter('Diameter'),
                    setValueAs: parseMillimeterInput,
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
