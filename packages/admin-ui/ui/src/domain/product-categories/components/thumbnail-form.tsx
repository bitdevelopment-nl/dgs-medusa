import { useWatch } from "react-hook-form";
import {FormImage} from "../../../types/shared";
import {NestedForm} from "../../../utils/nested-form";
import FileUploadField from "../../../components/atoms/file-upload-field";
import Actionables, {ActionType} from "../../../components/molecules/actionables";
import TrashIcon from "../../../components/fundamentals/icons/trash-icon";

export type ThumbnailFormType = {
    image: FormImage|null
}

type Props = {
    form: NestedForm<ThumbnailFormType>
}

const ThumbnailForm = ({form}: Props) => {
    const {control, path, setValue} = form

    const handleFileChosen = (files: File[]) => {
        if (files.length) {
            const file = files[0];
            setValue(path('image'), {
                url: URL.createObjectURL(file),
                name: file.name,
                size: file.size,
                nativeFile: file,
            });
        }
    }

    const image = useWatch({
        control,
        name: path('image'),
        defaultValue: null
    });

    return (
        <div>
            <div>
                <FileUploadField
                    onFileChosen={handleFileChosen}
                    placeholder="Category Thumbnail"
                    filetypes={["image/gif","image/jpeg","image/png","image/webp"]}
                    className="py-large"
                />
            </div>
            <div className="gap-y-2xsmall flex flex-col">
                {image && (<Image image={image} />)}
            </div>
        </div>
    )
}

const Image = ({ image }) => {
    // const actions: ActionType[] = [
    //     {
    //         label: "Delete",
    //         onClick: () => remove(index),
    //         icon: <TrashIcon size={20} />,
    //         variant: "danger",
    //     },
    // ]

    return (
        <div className="px-base py-xsmall hover:bg-grey-5 rounded-rounded group flex items-center justify-between">
            <div className="gap-x-large flex items-center">
                <div className="flex h-16 w-16 items-center justify-center">
                    <img
                        src={image.url}
                        alt={image.name || "Uploaded image"}
                        className="rounded-rounded max-h-[64px] max-w-[64px]"
                    />
                </div>
                <div className="inter-small-regular flex flex-col text-left">
                    <p>{image.name}</p>
                    <p className="text-grey-50">
                        {image.size ? `${(image.size / 1024).toFixed(2)} KB` : ""}
                    </p>
                </div>
            </div>

            {/*<Actionables actions={actions} forceDropdown />*/}
        </div>
    )
}





export default ThumbnailForm
