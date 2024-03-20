"use client";

import { dataUrl, debounce, download, getImageSize } from "@/lib/utils";
import { CldImage, getCldImageUrl } from "next-cloudinary";
import { PlaceholderValue } from "next/dist/shared/lib/get-img-props";
import Image from "next/image";
import React from "react";

const TransformedImage = ({
  image,
  transparentImageObj,
  backgroundImageObj,
  type,
  title,
  transformationConfig,
  isTransforming,
  setIsTransforming,
  hasDownload = false,
}: TransformedImageProps) => {
  const downloadHandler = (
    e: React.MouseEvent<HTMLButtonElement, MouseEvent>,
    image: any,
    url?: string
  ) => {
    e.preventDefault();

    download(
      url
        ? url
        : getCldImageUrl({
            width: image?.width,
            height: image?.height,
            src: image?.public_id,
            ...transformationConfig,
          }),
      title
    );
  };
  console.log("image.transformationType=", type);

  return (
    <>
      {type === "removeBackground" ? (
        <>
          <div className="flex flex-col gap-4">
            <div className="flex-between">
              <h3 className="h3-bold text-dark-600">Background removed</h3>
              {hasDownload && (
                <button
                  className="download-btn"
                  onClick={(e) =>
                    downloadHandler(e, null, transparentImageObj.secure_url)
                  }
                >
                  <Image
                    src="/assets/icons/download.svg"
                    alt="Download"
                    width={24}
                    height={24}
                    className="pb-[6px]"
                  />
                </button>
              )}
            </div>

            {transparentImageObj && (
              <Image
                src={transparentImageObj.secure_url}
                width={getImageSize(image.transformationType, image, "width")}
                height={getImageSize(image.transformationType, image, "height")}
                alt="remove.bg image"
              />
            )}
          </div>

          <div className="flex flex-col gap-4">
            <h3 className="h3-bold text-dark-600">Background Image</h3>

            <Image
              width={getImageSize(image.transformationType, image, "width")}
              height={getImageSize(image.transformationType, image, "height")}
              src={backgroundImageObj.secure_url}
              alt="image"
              className="transformation-original_image"
            />
          </div>

          <div className="flex flex-col gap-4">
            <div className="flex-between">
              <h3 className="h3-bold text-dark-600">Final Image</h3>
              {hasDownload && (
                <button
                  className="download-btn"
                  onClick={(e) =>
                    downloadHandler(e, null, image.transformationUrl)
                  }
                >
                  <Image
                    src="/assets/icons/download.svg"
                    alt="Download"
                    width={24}
                    height={24}
                    className="pb-[6px]"
                  />
                </button>
              )}
            </div>

            <Image
              width={getImageSize(image.transformationType, image, "width")}
              height={getImageSize(image.transformationType, image, "height")}
              src={image.transformationUrl}
              alt="image"
              className="transformation-original_image"
            />
          </div>
        </>
      ) : (
        <div className="flex flex-col gap-4">
          <div className="flex-between">
            <h3 className="h3-bold text-dark-600">Transformed</h3>

            {hasDownload && (
              <button
                className="download-btn"
                onClick={(e) => downloadHandler(e, image)}
              >
                <Image
                  src="/assets/icons/download.svg"
                  alt="Download"
                  width={24}
                  height={24}
                  className="pb-[6px]"
                />
              </button>
            )}
          </div>

          {image?.public_id && transformationConfig ? (
            <div className="relative">
              <CldImage
                width={getImageSize(type, image, "width")}
                height={getImageSize(type, image, "height")}
                src={image?.public_id}
                alt={image.title || "transformed image"}
                sizes={"(max-width: 767px) 100vw, 50vw"}
                placeholder={dataUrl as PlaceholderValue}
                className="transformed-image"
                onLoad={() => {
                  setIsTransforming && setIsTransforming(false);
                }}
                onError={() => {
                  debounce(() => {
                    setIsTransforming && setIsTransforming(false);
                  }, 8000)();
                }}
                {...transformationConfig}
              />

              {isTransforming && (
                <div className="transforming-loader">
                  <Image
                    src="/assets/icons/spinner.svg"
                    width={50}
                    height={50}
                    alt="spinner"
                  />
                  <p className="text-white/80">Please wait...</p>
                </div>
              )}
            </div>
          ) : (
            <div className="transformed-placeholder">Transformed Image</div>
          )}
        </div>
      )}
    </>
  );
};

export default TransformedImage;
