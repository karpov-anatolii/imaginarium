"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  aspectRatioOptions,
  creditFee,
  defaultValues,
  transformationTypes,
} from "@/constants";
import { CustomField } from "./CustomField";
import { useEffect, useState, useTransition } from "react";
import { AspectRatioKey, debounce, deepMergeObjects } from "@/lib/utils";
import MediaUploader from "./MediaUploader";
import TransformedImage from "./TransformedImage";
import { updateCredits } from "@/lib/actions/user.actions";
import { getCldImageUrl } from "next-cloudinary";
import {
  addImage,
  removeBgApi,
  removeBgApiSaveToCld,
  resourceCld,
  updateImage,
  uploadToCld,
} from "@/lib/actions/image.actions";
import { useRouter } from "next/navigation";
import { InsufficientCreditsModal } from "./InsufficientCreditsModal";
import Image from "next/image";
import { Cloudinary } from "@cloudinary/url-gen";
import { initCldObj, bgCldObj } from "@/constants";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { log } from "console";
import { Slider } from "@/components/ui/slider";
import { Rock_3D } from "next/font/google";
import { LoadingSpinner } from "./Spinner";
type SliderProps = React.ComponentProps<typeof Slider>;
import { Switch } from "@/components/ui/switch";
import { preview } from "@cloudinary/url-gen/actions/videoEdit";

const cloudinary = new Cloudinary({
  cloud: {
    cloudName: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  },
  url: {
    secure: true,
  },
});

export const formSchema = z.object({
  title: z.string().min(2, {
    message: "Title must be at least 2 characters.",
  }),
  aspectRatio: z.string().optional(),
  color: z.string().optional(),
  prompt: z.string().optional(),
  to: z.string().optional(),
  from: z.string().optional(),
  public_id: z.string(),
  bgPublicId: z.string().optional(),
  bgReplaceSize: z.string().optional(),
  bgReplaceGravity: z.string().optional(),
  bgReplaceScale: z.number().optional(),
});

const TransformationForm = ({
  action,
  data = null, // from  MongoDB
  userId,
  type,
  creditBalance,
  config = null,
}: TransformationFormProps) => {
  const transformationType = transformationTypes[type];
  const [image, setImage] = useState(data); //   public_id  width height secure_url
  const [bgImageCldObj, setBgImageCldObj] = useState<{
    public_id: string;
    width: number;
    height: number;
  } | null>(); // public_id
  const [finallBrightness, setFinallBrightness] = useState(0);
  const [bgBrightness, setBgBrightness] = useState(0);
  const [bgBlur, setBgBlur] = useState(0);
  const [imageCldTranspObj, setImageCldTranspObj] = useState<{
    secure_url: string;
    public_id: string;
    width: number;
    height: number;
  }>();
  const [origScale, setOrigScale] = useState(1);
  const [offsetX, setOffsetX] = useState(0);
  const [offsetY, setOffsetY] = useState(0);
  const [imageSize, setImageSize] = useState({ width: 0, height: 0 });
  const [removeBgFinalUrl, setRemoveBgFinalUrl] = useState("");
  const [newTransformation, setNewTransformation] =
    useState<Transformations | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isTransforming, setIsTransforming] = useState(false);
  const [transformationConfig, setTransformationConfig] = useState(config);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();
  const [replaceMode, setReplaceMode] = useState(data?.to ? true : false);
  const [prompt, setPrompt] = useState(data?.prompt);

  const initialValues =
    data && action === "Update"
      ? {
          title: data?.title,
          aspectRatio: data?.aspectRatio,
          color: data?.color,
          prompt: data?.prompt,
          to: data?.to,
          from: data?.from,
          public_id: data?.public_id,
          bgPublicId: "",
          transparentPublicId: data?.transparentPublicId,
          transformationUrl: data?.transformationUrl,
        }
      : defaultValues;

  // 1. Define your form.
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: initialValues,
  });

  // 2. Define a submit handler.
  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsSubmitting(true);
    if (data || image) {
      const transformationUrl =
        type === "removeBackground"
          ? removeBgFinalUrl
          : getCldImageUrl({
              width: image?.width,
              height: image?.height,
              src: image?.public_id,
              ...transformationConfig,
            });

      const imageData = {
        title: values.title,
        public_id: image?.public_id || image?.public_id,
        transparentPublicId: imageCldTranspObj?.public_id,
        bgPublicId: bgImageCldObj?.public_id,
        transformationType: type,
        width: image?.width,
        height: image?.height,
        config: transformationConfig,
        secure_url: image?.secure_url || image?.secure_url,
        transformationUrl: transformationUrl,
        aspectRatio: values.aspectRatio,
        prompt: values.prompt,
        color: values.color,
        to: values.to,
        from: prompt,
      };

      if (action === "Add") {
        try {
          const newImage = await addImage({
            image: imageData,
            userId,
            path: "/",
          });

          if (newImage) {
            form.reset();
            setImage(data);
            router.push(`/transformations/${newImage._id}`);
          }
        } catch (error) {
          console.log(error);
        }
      }

      if (action === "Update") {
        try {
          const updatedImage = await updateImage({
            image: {
              ...imageData,
              _id: data._id,
            },
            userId,
            path: `/transformations/${data._id}`,
          });

          if (updatedImage) {
            router.push(`/transformations/${updatedImage._id}`);
          }
        } catch (error) {
          console.log(error);
        }
      }
    }

    setIsSubmitting(false);
  }

  const onSelectFieldHandler = (
    value: string,
    onChangeField: (value: string) => void
  ) => {
    const imageSize = aspectRatioOptions[value as AspectRatioKey];

    setImage((prevState: any) => ({
      ...prevState,
      aspectRatio: imageSize.aspectRatio,
      width: imageSize.width,
      height: imageSize.height,
    }));

    setNewTransformation(transformationType.config);

    return onChangeField(value);
  };

  const onInputChangeHandler = (
    fieldName: string,
    value: string,
    type: string,
    onChangeField: (value: string) => void
  ) => {
    debounce(() => {
      setPrompt(value);
      setNewTransformation((prevState: any) => ({
        ...prevState,
        [type]: {
          ...prevState?.[type],
          [fieldName === "prompt" ? "prompt" : "to"]: value,
        },
      }));
    }, 1000)();

    return onChangeField(value);
  };

  const onInputChangeHandler2 = (
    fieldName: string,
    value: string,
    type: string,
    onChangeField: (value: string) => void
  ) => {
    debounce(() => {
      setNewTransformation((prevState: any) => ({
        ...prevState,
        replace: {
          ...prevState?.replace,
          from: prompt,
          to: value,
        },
      }));
    }, 1000)();

    return onChangeField(value);
  };

  const correctNewTransformation = () => {
    if (replaceMode && newTransformation?.remove) {
      const { remove, ...rest } = newTransformation;
      return { ...rest };
    }
    if (!replaceMode && newTransformation?.replace) {
      const { replace, ...rest } = newTransformation;
      const config = { ...rest, remove: { prompt: prompt } };
      return config;
    }

    return newTransformation;
  };
  const onTransformHandler = async () => {
    setIsTransforming(true);

    setTransformationConfig(
      deepMergeObjects(correctNewTransformation(), transformationConfig) // is generated by ChatGPT
    );

    setNewTransformation(null);
  };

  const sizeHandler = () => {
    if (bgImageCldObj && imageCldTranspObj) {
      let { width: bg_width, height: bg_height } = bgImageCldObj;
      const bg_ar = bg_width / bg_height;
      let { width: orig_width, height: orig_height } = imageCldTranspObj;
      const orig_ar = orig_width / orig_height;

      if (bg_ar >= 1) {
        bg_width = 1280;
        bg_height = Math.round(1280 / bg_ar);
      } else {
        bg_height = 1280;
        bg_width = Math.round(1280 * bg_ar);
      }
      orig_height = bg_height;
      orig_width = Math.round(orig_height * orig_ar);
      if (orig_width > bg_width) {
        orig_width = bg_width;
        orig_height = Math.round(orig_width / orig_ar);
      }

      setImageSize({ width: bg_width, height: bg_height });
      return { bg_width, bg_height, orig_width, orig_height, orig_ar, bg_ar };
    }
    return;
  };

  const optionHandler = async () => {
    if (bgImageCldObj && imageCldTranspObj) {
      setRemoveBgFinalUrl("");
      setIsTransforming(true);
      let { bg_width, bg_height, orig_width, orig_height, orig_ar, bg_ar } =
        sizeHandler()!;

      let gravity = "";
      if (offsetX >= 0 && offsetY >= 0) {
        gravity = "north_west";
      } else if (offsetX >= 0 && offsetY < 0) {
        gravity = "south_west";
      } else if (offsetX < 0 && offsetY >= 0) {
        gravity = "north_east";
      } else {
        gravity = "south_east";
      }

      orig_width = Math.round(orig_width * origScale);
      orig_height = Math.round(orig_height * origScale);

      let finalImage;
      const resource = await resourceCld(bgImageCldObj.public_id);

      finalImage = cloudinary.image(resource.public_id);

      if (origScale >= 1) {
        finalImage.addTransformation(
          `c_scale,w_${bg_width},h_${bg_height}/e_brightness_hsb:${bgBrightness}/e_blur:${bgBlur}/l_${
            imageCldTranspObj.public_id
          }/c_fill,w_${orig_width},h_${orig_height}/c_crop,w_${
            bg_width + Math.abs(offsetX) * 2
          },h_${
            bg_height + Math.abs(offsetY) * 2
          }/fl_layer_apply,y_${offsetY},x_${offsetX}/c_crop,g_${gravity},w_${bg_width},h_${bg_height}/e_brightness_hsb:${finallBrightness}`
        );
      } else {
        finalImage.addTransformation(
          `c_scale,w_${bg_width},h_${bg_height}/e_brightness_hsb:${bgBrightness}/e_blur:${bgBlur}/l_${imageCldTranspObj.public_id}/c_fill,w_${orig_width},h_${orig_height}/fl_layer_apply,y_${offsetY},x_${offsetX}/c_crop,g_${gravity},w_${bg_width},h_${bg_height}/e_brightness_hsb:${finallBrightness}`
        );
      }

      finalImage = finalImage.toURL();
      setRemoveBgFinalUrl(finalImage);
      setIsTransforming(false);
    }
  };

  useEffect(() => {
    if (image && (type === "restore" || type === "removeBackground")) {
      setNewTransformation(transformationType.config);
    }

    if (image && type === "removeBackground") {
      const run = async () => {
        try {
          setIsTransforming(true);

          if (action === "Update") {
            const resourceBgImageCldObj = await resourceCld(
              image.transparentPublicId
            );
            if (resourceBgImageCldObj)
              setImageCldTranspObj(resourceBgImageCldObj);
          } else {
            const dataImage = await removeBgApiSaveToCld(image.secure_url);
            if (dataImage) setImageCldTranspObj(dataImage);
          }
        } catch (error) {
          console.log("error=", error);
        } finally {
          setIsTransforming(false);
        }
      };
      run();
    }
  }, [image, transformationType.config, type, action]);

  useEffect(() => {
    if (bgImageCldObj && imageCldTranspObj) {
      setIsTransforming(true);
      const { bg_width, bg_height, orig_width, orig_height } = sizeHandler()!;

      const run = async () => {
        let finalImage;

        //  const resource = await resourceCld(imageCldTranspObj.public_id);
        const resource = await resourceCld(bgImageCldObj.public_id);

        finalImage = cloudinary.image(resource.public_id);

        finalImage.addTransformation(
          `l_${
            imageCldTranspObj.public_id
          }/c_fill,w_${orig_width},h_${orig_height}/c_crop,w_${
            bg_width - offsetX * 2
          },h_${
            bg_height - offsetY * 2
          }/fl_layer_apply,y_${offsetY},x_${offsetX}`
        );

        finalImage = finalImage.toURL();
        setRemoveBgFinalUrl(finalImage);
      };

      run();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bgImageCldObj]);

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        {creditBalance < Math.abs(creditFee) && <InsufficientCreditsModal />}
        <CustomField
          control={form.control}
          name="title"
          formLabel="Image Title"
          className="w-full"
          render={({ field }) => <Input {...field} className="input-field" />}
        />

        {type === "fill" && (
          <CustomField
            control={form.control}
            name="aspectRatio"
            formLabel="Aspect Ratio"
            className="w-full"
            render={({ field }) => (
              <Select
                onValueChange={(value) =>
                  onSelectFieldHandler(value, field.onChange)
                }
                value={field.value}
              >
                <SelectTrigger className="select-field">
                  <SelectValue placeholder="Select size" />
                </SelectTrigger>
                <SelectContent>
                  {Object.keys(aspectRatioOptions).map((key) => (
                    <SelectItem key={key} value={key} className="select-item">
                      {aspectRatioOptions[key as AspectRatioKey].label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
        )}

        {(type === "remove" || type === "recolor") && (
          <div className="prompt-field">
            <CustomField
              control={form.control}
              name="prompt"
              formLabel={
                type === "remove" ? "Object to remove" : "Object to recolor"
              }
              className="w-full"
              render={({ field }) => (
                <Input
                  value={field.value}
                  className="input-field"
                  onChange={(e) =>
                    onInputChangeHandler(
                      "prompt",
                      e.target.value,
                      type,
                      field.onChange
                    )
                  }
                />
              )}
            />

            {type === "recolor" && (
              <CustomField
                control={form.control}
                name="color"
                formLabel="Replacement Color"
                className="w-full"
                render={({ field }) => (
                  <Input
                    value={field.value}
                    className="input-field"
                    onChange={(e) =>
                      onInputChangeHandler(
                        "color",
                        e.target.value,
                        "recolor",
                        field.onChange
                      )
                    }
                  />
                )}
              />
            )}

            {type === "remove" && (
              <div className="flex items-center space-x-2">
                <Switch
                  id="replace-mode"
                  checked={replaceMode}
                  onCheckedChange={() => {
                    setReplaceMode(!replaceMode);
                    setTransformationConfig(null);

                  }}
                />
                <Label htmlFor="replace-mode">Add replacement object</Label>
              </div>
            )}

            {type === "remove" && replaceMode && (
              <CustomField
                control={form.control}
                name="to"
                formLabel="Replace to"
                className="w-full"
                render={({ field }) => (
                  <Input
                    value={field.value}
                    className="input-field"
                    onChange={(e) =>
                      onInputChangeHandler2(
                        "to",
                        e.target.value,
                        "replace",
                        field.onChange
                      )
                    }
                  />
                )}
              />
            )}
          </div>
        )}

        <div className="media-uploader-field">
          <CustomField
            control={form.control}
            name="public_id"
            className="flex size-full flex-col"
            render={({ field }) => (
              <MediaUploader
                onValueChange={field.onChange}
                setImage={setImage}
                public_id={field.value}
                image={image}
                type={type}
                userId={userId}
              />
            )}
          />

          {type === "removeBackground" ? (
            <div className=" flex size-full flex-col gap-4">
              <h3 className="h3-bold text-dark-600">Background removed</h3>
              <div className="media-uploader_cta">
                {isTransforming && <LoadingSpinner size={34} />}
                {imageCldTranspObj && (
                  <Image
                    src={imageCldTranspObj.secure_url}
                    width={400}
                    height={400}
                    className="w-full"
                    alt="remove.bg image"
                  />
                )}
              </div>
            </div>
          ) : (
            <>
              <TransformedImage
                image={image}
                type={type}
                title={form.getValues().title}
                isTransforming={isTransforming}
                setIsTransforming={setIsTransforming}
                transformationConfig={transformationConfig}
              />
            </>
          )}
        </div>

        {type !== "removeBackground" && (
          <Button
            type="button"
            className="submit-button capitalize"
            disabled={isTransforming || newTransformation === null}
            onClick={onTransformHandler}
          >
            {isTransforming ? "Transforming..." : "Apply Transformation"}
          </Button>
        )}

        {type === "removeBackground" && (
          <>
            <div className="media-uploader-field">
              <CustomField
                control={form.control}
                name="bgPublicId"
                className="flex size-full flex-col"
                render={({ field }) => (
                  <MediaUploader
                    onValueChange={field.onChange}
                    setImage={setBgImageCldObj}
                    public_id={field.value}
                    image={image}
                    type={type}
                    preset="background"
                    bg={true}
                  />
                )}
              />

              <div className=" flex size-full flex-col gap-4">
                <h3 className="h3-bold text-dark-600"> Final image</h3>
                <div className="media-uploader_cta">
                  {isTransforming && <LoadingSpinner size={34} />}
                  {removeBgFinalUrl && (
                    <Image
                      src={removeBgFinalUrl}
                      width={400}
                      height={400}
                      className="w-full"
                      alt="image"
                      onLoad={() => setIsTransforming(false)}
                    />
                  )}
                </div>
              </div>
            </div>

            {/*  Options for replacing background */}
            {image && bgImageCldObj && (
              <div className="flex flex-col gap-8 border rounded-[16px] p-8">
                <h3 className="h3-bold text-dark-600 text-center">
                  Final image options
                </h3>
                <div className="grid options   grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 ">
                  {/* bgReplaceScale */}

                  <div className="flex flex-col gap-4  ">
                    <p>Origin image scale (-/+): {origScale}</p>
                    <Slider
                      defaultValue={[1]}
                      max={5}
                      min={0.2}
                      step={0.1}
                      onValueChange={(value) => setOrigScale(value[0])}
                    />
                  </div>

                  {/* bgReplaceOffsetX */}

                  <div className="flex flex-col gap-4 ">
                    <p>Final image offset X (left/right): {offsetX}</p>
                    <Slider
                      defaultValue={[0]}
                      max={Math.round(imageSize.width / 2)}
                      min={Math.round(-imageSize.width / 2)}
                      step={1}
                      onValueChange={(value) => setOffsetX(value[0])}
                    />
                  </div>

                  {/* bgReplaceOffsetY */}

                  <div className="flex flex-col gap-4 ">
                    <p>Final image offset Y (top/bottom): {offsetY}</p>
                    <Slider
                      defaultValue={[0]}
                      max={Math.round(imageSize.height / 2)}
                      min={Math.round(-imageSize.height / 2)}
                      step={1}
                      onValueChange={(value) => setOffsetY(value[0])}
                    />
                  </div>

                  {/* bgReplaceBrightness */}

                  <div className="flex flex-col gap-4 ">
                    <p>Final image brightness (-/+): {finallBrightness}</p>
                    <Slider
                      defaultValue={[0]}
                      max={99}
                      min={-99}
                      step={1}
                      onValueChange={(value) => setFinallBrightness(value[0])}
                    />
                  </div>

                  {/* bgBrightness */}

                  <div className="flex flex-col gap-4 ">
                    <p>Background image brightness (-/+): {bgBrightness}</p>
                    <Slider
                      defaultValue={[0]}
                      max={99}
                      min={-99}
                      step={1}
                      onValueChange={(value) => setBgBrightness(value[0])}
                    />
                  </div>

                  {/* bgBlur */}

                  <div className="flex flex-col gap-4 ">
                    <p>Background image blur (-/+): {bgBlur}</p>
                    <Slider
                      defaultValue={[1]}
                      max={2000}
                      min={1}
                      step={10}
                      onValueChange={(value) => setBgBlur(value[0])}
                    />
                  </div>
                </div>

                <Button
                  type="button"
                  className="submit-button capitalize"
                  // disabled={isTransforming || newTransformation === null}
                  onClick={optionHandler}
                >
                  {isTransforming ? "Transforming..." : " Apply Options"}
                </Button>
              </div>
            )}
          </>
        )}

        <Button
          type="submit"
          className="submit-button capitalize"
          disabled={isSubmitting}
        >
          {isSubmitting ? "Submitting..." : "Save Image"}
        </Button>
      </form>
    </Form>
  );
};

export default TransformationForm;
