"use client";

import { useToast } from "@/components/ui/use-toast";
import { updateCredits } from "@/lib/actions/user.actions";
import { dataUrl, getImageSize } from "@/lib/utils";
import { CldImage, CldUploadWidget } from "next-cloudinary";
import { PlaceholderValue } from "next/dist/shared/lib/get-img-props";
import Image from "next/image";
import { title } from "process";
import { useTransition } from "react";

type MediaUploaderProps = {
  onValueChange: (value: string) => void;
  setImage: React.Dispatch<any>;
  public_id: string;
  image: any;
  type: string;
  preset?: string;
  bg?: boolean;
  userId?: string;
};

const MediaUploader = ({
  onValueChange,
  setImage,
  image,
  public_id,
  type,
  preset,
  bg,
  userId,
}: MediaUploaderProps) => {
  const { toast } = useToast();
  const [isPending, startTransition] = useTransition();

  const onUploadSuccessHandler = (result: any) => {
    setImage((prevState: any) => ({
      ...prevState,
      public_id: result?.info?.public_id,
      width: result?.info?.width,
      height: result?.info?.height,
      secure_url: result?.info?.secure_url,
    }));

    onValueChange(result?.info?.public_id);
    if (!bg && userId) {
      const creditFee = type === "removeBackground" ? -5 : -1;
      startTransition(async () => {
        await updateCredits(userId, creditFee);
      });

      toast({
        title: "Image uploaded successfully",
        description: `${
          type === "removeBackground" ? "5 credits " : "1 credit "
        }  was deducted from your account`,
        duration: 5000,
        className: "success-toast",
      });
    }
  };

  const onUploadErrorHandler = () => {
    toast({
      title: "Something went wrong while uploading",
      description: "Please try again",
      duration: 5000,
      className: "error-toast",
    });
  };

  return (
    <CldUploadWidget
      uploadPreset={`${preset ?? "jsm_imaginarium"}`} // "jsm_imaginarium"
      options={{
        multiple: false,
        resourceType: "image",
      }}
      onSuccess={onUploadSuccessHandler}
      onError={onUploadErrorHandler}
    >
      {({ open }) => (
        <div className="flex flex-col gap-4">
          <h3 className="h3-bold text-dark-600">{`${
            bg ? "New Background" : "Original"
          }`}</h3>

          {public_id ? (
            <>
              <div className="cursor-pointer overflow-hidden rounded-[10px]">
                <CldImage
                  width={getImageSize(type, image, "width")}
                  height={getImageSize(type, image, "height")}
                  src={public_id}
                  alt="image"
                  sizes={"(max-width: 767px) 100vw, 50vw"}
                  placeholder={dataUrl as PlaceholderValue}
                  className="media-uploader_cldImage "
                />
              </div>
            </>
          ) : (
            <div className="media-uploader_cta" onClick={() => open()}>
              <div className="media-uploader_cta-image">
                <Image
                  src="/assets/icons/add.svg"
                  alt="Add Image"
                  width={24}
                  height={24}
                />
              </div>
              <p className="p-14-medium">
                Click here to upload {`${bg ? "background" : "image"}`}{" "}
              </p>
            </div>
          )}
        </div>
      )}
    </CldUploadWidget>
  );
};

export default MediaUploader;
