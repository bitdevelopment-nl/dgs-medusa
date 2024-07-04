import {AdminPostProductsReq} from "@medusajs/medusa"
import {useAdminCreateProduct} from "medusa-react"
import {useForm, useWatch} from "react-hook-form"
import DimensionsForm, {DimensionsFormType,} from "../../../components/forms/product/dimensions-form"
import GeneralForm, {GeneralFormType,} from "../../../components/forms/product/general-form"
import MediaForm, {MediaFormType,} from "../../../components/forms/product/media-form"
import ThumbnailForm, {ThumbnailFormType,} from "../../../components/forms/product/thumbnail-form"
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
import StockPriceForm, {StockPriceFormType} from "../../../components/forms/de-geslepen-steen/product/stock-price-form";
import AddSalesChannelsForm, {AddSalesChannelsFormType} from "./add-sales-channels";
import FeatureToggle from "../../../components/fundamentals/feature-toggle";

type NewProductForm = {
    general: GeneralFormType,
    stockPrice: StockPriceFormType,
    organize: OrganizeFormType,
    dimensions: DimensionsFormType
    thumbnail: ThumbnailFormType
    media: MediaFormType,
    salesChannels: AddSalesChannelsFormType
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
                payload.images = preppedImages.map((image) => image.url)
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
                        closeAndReset()
                        navigate(`/a/products/${product.id}`)
                },
                onError: (err) => {
                    notification(t("new-error", "Error"), getErrorMessage(err), "error")
                },
            })
        })

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
                                    <StockPriceForm form={nestedForm(form, "stockPrice")}/>
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
                                <FeatureToggle featureFlag="sales_channels">
                                    <div className="mt-xlarge">
                                        <AddSalesChannelsForm
                                            form={nestedForm(form, "salesChannels")}
                                        />
                                    </div>
                                </FeatureToggle>
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
        discountable: false, // unused
        is_giftcard: false, // unused
        collection_id: undefined, // unused
        description: data.general.description || undefined,
        height: data.dimensions.height || undefined,
        length: data.dimensions.length || undefined,
        weight: data.dimensions.weight || undefined,
        width: data.dimensions.width || undefined,
        diameter: data.dimensions.diameter || undefined,
        hs_code: undefined, // unused
        mid_code: undefined, // unused
        type:  undefined, // unused
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
                inventory_quantity: data.stockPrice.stock ?? 0,
                prices: [
                    {
                        amount: data.stockPrice.price,
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

export default NewProduct
