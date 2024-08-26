import {useTranslation} from "react-i18next"
import GeneralForm, {GeneralFormType} from "../../forms/product/general-form"
import OrganizeForm, {
    OrganizeFormType,
} from "../../forms/product/organize-form"

import {Product} from "@medusajs/medusa"
import {useEffect} from "react"
import {useForm} from "react-hook-form"
import useEditProductActions from "../../../hooks/use-edit-product-actions"
import {nestedForm} from "../../../utils/nested-form"
import Button from "../../fundamentals/button"
import Modal from "../../molecules/modal"
import StockPriceForm, {StockPriceFormType} from "../../forms/de-geslepen-steen/product/stock-price-form";
import DimensionsForm, {DimensionsFormType} from "../../forms/product/dimensions-form";

type Props = {
    product: Product
    open: boolean
    onClose: () => void
}

type GeneralFormWrapper = {
    dimensions: DimensionsFormType
    general: GeneralFormType
    organize: OrganizeFormType
    stockPrice: StockPriceFormType
}

const GeneralModal = ({product, open, onClose}: Props) => {
    const {t} = useTranslation()
    const {onUpdate, updating} = useEditProductActions(product.id)
    const form = useForm<GeneralFormWrapper>({
        defaultValues: getDefaultValues(product),
    })

    const {
        formState: {isDirty},
        handleSubmit,
        reset,
    } = form

    useEffect(() => {
        reset(getDefaultValues(product))
    }, [product, reset])

    const onReset = () => {
        reset(getDefaultValues(product))
        onClose()
    }

    const onSubmit = handleSubmit((data) => {
        onUpdate(
            {
                title: data.general.title,
                handle: data.general.handle,
                // @ts-ignore
                material: data.general.material,
                // @ts-ignore
                subtitle: data.general.subtitle,
                // @ts-ignore
                description: data.general.description,
                // @ts-ignore
                tags: data.organize.tags
                    ? data.organize.tags.map((t) => ({value: t}))
                    : null,
                categories: data.organize?.categories?.length
                    ? data.organize.categories.map((id) => ({id}))
                    : [],
                height: data.dimensions.height || undefined,
                length: data.dimensions.length || undefined,
                weight: data.dimensions.weight || undefined,
                width: data.dimensions.width || undefined,
                diameter: data.dimensions.diameter || undefined,
                variants: product.variants.length === 0
                    ? [
                        {
                            title: 'internal',
                            inventory_quantity: data.stockPrice.stock ?? 0,
                            prices: [
                                {
                                    amount: data.stockPrice.price,
                                    currency_code: 'eur'
                                }
                            ],
                            allow_backorder: false,
                            origin_country: data.stockPrice.origin_country !== null ? data.stockPrice.origin_country : undefined,
                            options: [
                                {
                                    value: 'internal'
                                }
                            ],
                            manage_inventory: true
                        },
                    ] :
                    [
                        {
                            id: product.variants[0].id ?? null,
                            inventory_quantity: data.stockPrice.stock,
                            prices: [
                                {
                                    id: product.variants[0].prices[0].id ?? null,
                                    amount: data.stockPrice.price,
                                    currency_code: product.variants[0].prices[0].currency_code ?? 'eur',
                                }
                            ],
                        }
                    ],
            },
            onReset
        )
    })

    return (
        <Modal open={open} handleClose={onReset} isLargeModal>
            <Modal.Body>
                <Modal.Header handleClose={onReset}>
                    <h1 className="inter-xlarge-semibold m-0">
                        {t(
                            "product-general-section-edit-general-information",
                            "Edit General Information"
                        )}
                    </h1>
                </Modal.Header>
                <form onSubmit={onSubmit}>
                    <Modal.Content>
                        <GeneralForm
                            form={nestedForm(form, "general")}
                            isGiftCard={product.is_giftcard}
                        />
                        <div className="my-xlarge">
                            <StockPriceForm form={nestedForm(form, "stockPrice")}/>
                        </div>
                        <div className="my-xlarge">
                            <h3 className="inter-base-semibold mb-base">
                                {t("new-dimensions", "Dimensions")}
                            </h3>
                            <DimensionsForm form={nestedForm(form, "dimensions")}/>
                        </div>
                        <div className="my-xlarge">
                            <h2 className="inter-base-semibold mb-base">
                                Organize{" "}
                                {product.is_giftcard
                                    ? t("product-general-section-gift-card", "Gift Card")
                                    : t("product-general-section-product", "Product")}
                            </h2>
                            <OrganizeForm form={nestedForm(form, "organize")}/>
                        </div>
                    </Modal.Content>
                    <Modal.Footer>
                        <div className="flex w-full justify-end gap-x-2">
                            <Button
                                size="small"
                                variant="secondary"
                                type="button"
                                onClick={onReset}
                            >
                                {t("product-general-section-cancel", "Cancel")}
                            </Button>
                            <Button
                                size="small"
                                variant="primary"
                                type="submit"
                                disabled={!isDirty}
                                loading={updating}
                            >
                                {t("product-general-section-save", "Save")}
                            </Button>
                        </div>
                    </Modal.Footer>
                </form>
            </Modal.Body>
        </Modal>
    )
}

const getDefaultValues = (product: Product): GeneralFormWrapper => {
    return {
        general: {
            title: product.title,
            subtitle: product.subtitle,
            material: product.material,
            handle: product.handle!,
            description: product.description || null,
        },
        organize: {
            tags: product.tags ? product.tags.map((t) => t.value) : null,
            categories: product.categories?.map((c) => c.id),
        },
        stockPrice: {
            stock: product.variants.length ? product.variants[0].inventory_quantity : 1,
            price: product.variants.length ? product.variants[0].prices[0].amount / 100 : 0,
            origin_country: product.origin_country
        },
        dimensions: {
            height: product.height ? product.height / 10 : null,
            width: product.width ? product.width / 10 : null,
            length: product.length ? product.length / 10 : null,
            weight: product.weight,
            diameter: product.diameter ?? null
        }
    }
}

export default GeneralModal
