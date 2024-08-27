import {NestedForm} from "../../../../../utils/nested-form";
import FormValidator from "../../../../../utils/form-validator";
import InputField from "../../../../molecules/input";
import {NextSelect} from "../../../../molecules/select/next-select";
import {Controller} from "react-hook-form";
import {countries} from "../../../../../utils/countries";

export type StockPriceFormType = {
    stock: number
    price: number,
    origin_country: string | null
}

type Props = {
    form: NestedForm<StockPriceFormType>
}

const StockPriceForm = ({form}: Props) => {
    const { control, register, path, formState: {errors} } = form

    const countryOptions = countries.map((c) => ({
        label: c.name,
        value: c.alpha2,
    }))

    console.log(form.getValues());

    return (
        <div className="mb-large gap-x-large gap-y-large grid grid-cols-2">
            <InputField
                label="Aantal in voorraad"
                placeholder="1"
                type="number"
                {...register(path("stock"), {
                    valueAsNumber: true,
                    min: FormValidator.nonNegativeNumberRule('stock')
                })}
                errors={errors}
            />
            <InputField
                label="Prijs"
                placeholder="20"
                prefix={<span className="pt-1">€</span>}
                type="text"
                {...register(path("price"), {
                    validate: {
                        positive: (v) => v >= 0,
                    },
                    setValueAs: (value: string|undefined) => parseFloat(value?.toString()?.replace(',', '.') ?? "") * 100,
                    required: false
                })}
                errors={errors}
            />
            <Controller
                name={path("origin_country")}
                control={control}
                render={({ field }) => {
                    return (
                        <NextSelect
                            label="Country of origin"
                            placeholder="Choose a country"
                            options={countryOptions}
                            isSearchable
                            isClearable
                            {...field}
                            value={countryOptions.find((c) => field.value === c.value)}
                            onChange={(value) => field.onChange(value.value)}
                        />
                    )
                }}
            />
        </div>
    );
}

export default StockPriceForm;
