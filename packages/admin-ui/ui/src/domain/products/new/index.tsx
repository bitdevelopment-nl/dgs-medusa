import {AdminPostProductsReq, ProductVariant} from "@medusajs/medusa"
import {useAdminCreateProduct, useMedusa} from "medusa-react"
import {useForm, useWatch} from "react-hook-form"
import DimensionsForm, {
    DimensionsFormType,
} from "../../../components/forms/product/dimensions-form"
import GeneralForm, {
    GeneralFormType,
} from "../../../components/forms/product/general-form"
import MediaForm, {
    MediaFormType,
} from "../../../components/forms/product/media-form"
import ThumbnailForm, {
    ThumbnailFormType,
} from "../../../components/forms/product/thumbnail-form"
import {FormImage, ProductStatus} from "../../../types/shared"

import {useEffect} from "react"
import {useNavigate} from "react-router-dom"
import {useTranslation} from "react-i18next"
import Button from "../../../components/fundamentals/button"
import CrossIcon from "../../../components/fundamentals/icons/cross-icon"
import FocusModal from "../../../components/molecules/modal/focus-modal"
import Accordion from "../../../components/organisms/accordion"
import useNotification from "../../../hooks/use-notification"
import {useFeatureFlag} from "../../../providers/feature-flag-provider"
import {getErrorMessage} from "../../../utils/error-messages"
import {prepareImages} from "../../../utils/images"
import {nestedForm} from "../../../utils/nested-form"
import OrganizeForm, {OrganizeFormType} from "../../../components/forms/product/organize-form";

type NewProductForm = {
    general: GeneralFormType,
    organize: OrganizeFormType,
    dimensions: DimensionsFormType
    thumbnail: ThumbnailFormType
    media: MediaFormType
}

type Props = {
    onClose: () => void
}

const NewProduct = ({onClose}: Props) => {
    const {t} = useTranslation()
    const form = useForm<NewProductForm>({
        defaultValues: createBlank(),
    })
    const {mutate} = useAdminCreateProduct()
    const navigate = useNavigate()
    const notification = useNotification()

    const watchedCustoms = useWatch({
        control: form.control,
        name: "customs",
    })

    const watchedDimensions = useWatch({
        control: form.control,
        name: "dimensions",
    })

    const {
        handleSubmit,
        formState: {isDirty},
        reset,
    } = form

    const closeAndReset = () => {
        reset(createBlank())
        onClose()
    }

    useEffect(() => {
        reset(createBlank())
    }, [])

    const {isFeatureEnabled} = useFeatureFlag()

    const onSubmit = (publish = true) =>
        handleSubmit(async (data) => {
            const payload = createPayload(
                data,
                publish,
                isFeatureEnabled("sales_channels")
            )

            if (data.media?.images?.length) {
                let preppedImages: FormImage[] = []

                try {
                    preppedImages = await prepareImages(data.media.images)
                } catch (error) {
                    let errorMessage = t(
                        "new-something-went-wrong-while-trying-to-upload-images",
                        "Something went wrong while trying to upload images."
                    )
                    const response = (error as any).response as Response

                    if (response.status === 500) {
                        errorMessage =
                            errorMessage +
                            " " +
                            t(
                                "new-no-file-service-configured",
                                "You might not have a file service configured. Please contact your administrator"
                            )
                    }

                    notification(t("new-error", "Error"), errorMessage, "error")
                    return
                }
                const urls = preppedImages.map((image) => image.url)

                payload.images = urls
            }

            if (data.thumbnail?.images?.length) {
                let preppedImages: FormImage[] = []

                try {
                    preppedImages = await prepareImages(data.thumbnail.images)
                } catch (error) {
                    let errorMessage = t(
                        "new-upload-thumbnail-error",
                        "Something went wrong while trying to upload the thumbnail."
                    )
                    const response = (error as any).response as Response

                    if (response.status === 500) {
                        errorMessage =
                            errorMessage +
                            " " +
                            t(
                                "new-no-file-service-configured",
                                "You might not have a file service configured. Please contact your administrator"
                            )
                    }

                    notification(t("new-error", "Error"), errorMessage, "error")
                    return
                }
                const urls = preppedImages.map((image) => image.url)

                payload.thumbnail = urls[0]
            }

            mutate(payload, {
                onSuccess: ({product}) => {
                    createStockLocationsForVariants(
                        product.variants,
                        []
                    ).then(() => {
                        closeAndReset()
                        navigate(`/a/products/${product.id}`)
                    })
                },
                onError: (err) => {
                    notification(t("new-error", "Error"), getErrorMessage(err), "error")
                },
            })
        })

    const {client} = useMedusa()

    const createStockLocationsForVariants = async (
        variants: ProductVariant[],
        stockLocationsMap: Map<
            string,
            { stocked_quantity: number; location_id: string }[] | undefined
        >
    ) => {
        await Promise.all(
            variants
                .map(async (variant) => {
                    const optionsKey = variant.options
                        .map((option) => option?.value || "")
                        .sort()
                        .join(",")

                    const stock_locations = stockLocationsMap.get(optionsKey)
                    if (!stock_locations?.length) {
                        return
                    }

                    const inventory = await client.admin.variants.getInventory(variant.id)

                    return await Promise.all(
                        inventory.variant.inventory
                            .map(async (item) => {
                                return Promise.all(
                                    stock_locations.map(async (stock_location) => {
                                        client.admin.inventoryItems.createLocationLevel(item.id!, {
                                            location_id: stock_location.location_id,
                                            stocked_quantity: stock_location.stocked_quantity,
                                        })
                                    })
                                )
                            })
                            .flat()
                    )
                })
                .flat()
        )
    }

    return (
        <form className="w-full">
            <FocusModal>
                <FocusModal.Header>
                    <div className="medium:w-8/12 flex w-full justify-between px-8">
                        <Button
                            size="small"
                            variant="ghost"
                            type="button"
                            onClick={closeAndReset}
                        >
                            <CrossIcon size={20}/>
                        </Button>
                        <div className="gap-x-small flex">
                            <Button
                                size="small"
                                variant="secondary"
                                type="button"
                                disabled={!isDirty}
                                onClick={onSubmit(false)}
                            >
                                {t("new-save-as-draft", "Save as draft")}
                            </Button>
                            <Button
                                size="small"
                                variant="primary"
                                type="button"
                                disabled={!isDirty}
                                onClick={onSubmit(true)}
                            >
                                {t("new-publish-product", "Publish product")}
                            </Button>
                        </div>
                    </div>
                </FocusModal.Header>
                <FocusModal.Main className="no-scrollbar flex w-full justify-center py-16">
                    <div className="small:w-4/5 medium:w-7/12 large:w-6/12 max-w-[700px]">
                        <Accordion defaultValue={["general"]} type="multiple">
                            <Accordion.Item
                                value={"general"}
                                title={t(
                                    "new-general-information-title",
                                    "General information"
                                )}
                                required
                            >
                                <p className="inter-base-regular text-grey-50">
                                    {t(
                                        "new-to-start-selling-all-you-need-is-a-name-and-a-price",
                                        "To start selling, all you need is a name and a price."
                                    )}
                                </p>
                                <div className="mt-xlarge gap-y-xlarge flex flex-col">
                                    <GeneralForm
                                        form={nestedForm(form, "general")}
                                        requireHandle={false}
                                    />
                                </div>
                                <div className="my-xlarge">
                                    <h3 className="inter-base-semibold mb-base">
                                        {t("new-dimensions", "Dimensions")}
                                    </h3>
                                    <DimensionsForm form={nestedForm(form, "dimensions")}/>
                                </div>
                            </Accordion.Item>
                            <Accordion.Item title="Categorieën" value="categories">
                                <p className="inter-base-regular mb-large text-grey-50">
                                    {t(
                                        "add-categories-and-types-here",
                                        "Used to organize your products"
                                    )}
                                </p>
                                <OrganizeForm form={nestedForm(form, "organize")}/>
                            </Accordion.Item>
                            <Accordion.Item title="Thumbnail" value="thumbnail">
                                <p className="inter-base-regular mb-large text-grey-50">
                                    {t(
                                        "new-used-to-represent-your-product-during-checkout-social-sharing-and-more",
                                        "Used to represent your product during checkout, social sharing and more."
                                    )}
                                </p>
                                <ThumbnailForm form={nestedForm(form, "thumbnail")}/>
                            </Accordion.Item>
                            <Accordion.Item title={t("new-media", "Media")} value="media">
                                <p className="inter-base-regular mb-large text-grey-50">
                                    {t(
                                        "new-add-images-to-your-product",
                                        "Add images to your product."
                                    )}
                                </p>
                                <MediaForm form={nestedForm(form, "media")}/>
                            </Accordion.Item>
                        </Accordion>
                    </div>
                </FocusModal.Main>
            </FocusModal>
        </form>
    )
}

const createPayload = (
    data: NewProductForm,
    publish = true,
    salesChannelsEnabled = false
): AdminPostProductsReq => {
    const payload: AdminPostProductsReq = {
        title: data.general.title,
        subtitle: data.general.subtitle || undefined,
        material: data.general.material || undefined,
        handle: data.general.handle,
        discountable: false,
        is_giftcard: false,
        collection_id: data.organize.collection?.value,
        description: data.general.description || undefined,
        height: data.dimensions.height || undefined,
        length: data.dimensions.length || undefined,
        weight: data.dimensions.weight || undefined,
        width: data.dimensions.width || undefined,
        hs_code: undefined, // unused
        mid_code: undefined, // unused
        type: data.organize.type
          ? {
              value: data.organize.type.label,
              id: data.organize.type.value,
            }
          : undefined,
        tags: data.organize.tags
          ? data.organize.tags.map((t) => ({
              value: t,
            }))
          : undefined,
        categories: data.organize.categories?.length
          ? data.organize.categories.map((id) => ({ id }))
          : undefined,
        options: [
            {
                title: 'internal'
            }
        ],
        variants: [
            {
                title: 'internal',
                inventory_quantity: 0,
                prices: [
                    {
                        amount: 10,
                        currency_code: 'eur'
                    }
                ],
                allow_backorder: false,
                options: [
                    {
                        value: 'internal'
                    }
                ],
                manage_inventory: true
            },
        ],
        // origin_country: data.customs.origin_country?.value || undefined,
        // options: data.variants.options.map((o) => ({
        //   title: o.title,
        // })),
        // variants: data.variants.entries.map((v) => ({
        //   title: v.general.title!,
        //   material: v.general.material || undefined,
        //   inventory_quantity: v.stock.inventory_quantity || 0,
        //   prices: getVariantPrices(v.prices),
        //   allow_backorder: v.stock.allow_backorder,
        //   sku: v.stock.sku || undefined,
        //   barcode: v.stock.barcode || undefined,
        //   options: v.options.map((o) => ({
        //     value: o.option?.value!,
        //   })),
        //   ean: v.stock.ean || undefined,
        //   upc: v.stock.upc || undefined,
        //   height: v.dimensions.height || undefined,
        //   length: v.dimensions.length || undefined,
        //   weight: v.dimensions.weight || undefined,
        //   width: v.dimensions.width || undefined,
        //   hs_code: v.customs.hs_code || undefined,
        //   mid_code: v.customs.mid_code || undefined,
        //   origin_country: v.customs.origin_country?.value || undefined,
        //   manage_inventory: v.stock.manage_inventory,
        // })),
        // @ts-ignore
        status: publish ? ProductStatus.PUBLISHED : ProductStatus.DRAFT,
    }

    if (salesChannelsEnabled) {
        payload.sales_channels = data.salesChannels.channels.map((c) => ({
            id: c.id,
        }))
    }

    return payload
}

const createBlank = (): NewProductForm => {
    return {
        general: {
            title: "",
            material: null,
            subtitle: null,
            description: null,
            handle: "",
        },
        dimensions: {
            height: null,
            length: null,
            weight: null,
            width: null,
            diameter: null,
        },
        organize: {
            type: null,
            collection: null,
            categories: [],
            tags: []
        },
        media: {
            images: [],
        },
        salesChannels: {
            channels: [],
        },
        thumbnail: {
            images: [],
        },
    }
}

const getVariantPrices = (prices: PricesFormType) => {
    const priceArray = prices.prices
        .filter((price) => typeof price.amount === "number")
        .map((price) => {
            return {
                amount: price.amount as number,
                currency_code: price.region_id ? undefined : price.currency_code,
                region_id: price.region_id || undefined,
            }
        })

    return priceArray
}

export default NewProduct
