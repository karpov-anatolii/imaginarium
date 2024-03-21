import { auth } from "@clerk/nextjs";
import Image from "next/image";
import Link from "next/link";

import Header from "@/components/shared/Header";
import TransformedImage from "@/components/shared/TransformedImage";
import { Button } from "@/components/ui/button";
import { getImageById, resourceCld } from "@/lib/actions/image.actions";
import { getImageSize } from "@/lib/utils";
import { DeleteConfirmation } from "@/components/shared/DeleteConfirmation";
import { redirect } from "next/navigation";
import { getUserById } from "@/lib/actions/user.actions";
import { Cloudinary } from "@cloudinary/url-gen";

const ImageDetails = async ({ params: { id } }: SearchParamProps) => {
  const { userId } = auth();

  const transformation = "restore";

  if (!userId) redirect("/sign-in");

  const user = await getUserById(userId);

  const image = await getImageById(id);

  const transparentImageObj = await resourceCld(image.transparentPublicId);

  const backgroundImageObj = await resourceCld(image.bgPublicId);

  ///////////////////////////////////////////////////
  const cloudinary = new Cloudinary({
    cloud: {
      cloudName: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
    },
    url: {
      secure: true,
    },
  });

  // const mainImage =
  //   uploadData && cloudinary.image(uploadData.public_id).toURL();
  // const transparentImage =
  //   transparentData && cloudinary.image(transparentData.public_id).toURL();

  return (
    <>
      <Header title={image.title} />

      <section className="mt-5 flex flex-wrap gap-4">
        <div className="p-14-medium md:p-16-medium flex gap-2">
          <p className="text-dark-600">Transformation:</p>
          <p className=" capitalize text-purple-400">
            {image.transformationType}
          </p>
        </div>

        {image.prompt && (
          <>
            <p className="hidden text-dark-400/50 md:block">&#x25CF;</p>
            <div className="p-14-medium md:p-16-medium flex gap-2 ">
              <p className="text-dark-600">Prompt:</p>
              <p className=" capitalize text-purple-400">{image.prompt}</p>
            </div>
          </>
        )}

        {image.color && (
          <>
            <p className="hidden text-dark-400/50 md:block">&#x25CF;</p>
            <div className="p-14-medium md:p-16-medium flex gap-2">
              <p className="text-dark-600">Color:</p>
              <p className=" capitalize text-purple-400">{image.color}</p>
            </div>
          </>
        )}

        {image.aspectRatio && (
          <>
            <p className="hidden text-dark-400/50 md:block">&#x25CF;</p>
            <div className="p-14-medium md:p-16-medium flex gap-2">
              <p className="text-dark-600">Aspect Ratio:</p>
              <p className=" capitalize text-purple-400">{image.aspectRatio}</p>
            </div>
          </>
        )}
      </section>

      <section className="mt-10 border-t border-dark-400/15">
        <div className="transformation-grid">
          {/* MEDIA UPLOADER */}
          <div className="flex flex-col gap-4">
            <h3 className="h3-bold text-dark-600">Original</h3>

            <Image
              width={getImageSize(image.transformationType, image, "width")}
              height={getImageSize(image.transformationType, image, "height")}
              src={image.secure_url}
              alt="image"
              className="transformation-original_image"
            />
          </div>

          {image.transformationType === "removeBackground" ? (
            // <>
            //   <div className=" flex size-full flex-col gap-4">
            //     <h3 className="h3-bold text-dark-600">Background removed</h3>
            //     <div className="media-uploader_cta">
            //       {transparentImageObj && (
            //         <Image
            //           src={transparentImageObj.secure_url}
            //           width={400}
            //           height={400}
            //           className="w-full"
            //           alt="remove.bg image"
            //         />
            //       )}
            //     </div>
            //   </div>

            //   <div className="flex flex-col gap-4">
            //     <h3 className="h3-bold text-dark-600">Background Image</h3>

            //     <Image
            //       width={getImageSize(image.transformationType, image, "width")}
            //       height={getImageSize(
            //         image.transformationType,
            //         image,
            //         "height"
            //       )}
            //       src={backgroundImageObj.secure_url}
            //       alt="image"
            //       className="transformation-original_image"
            //     />
            //   </div>

            //   <div className="flex flex-col gap-4">
            //     <h3 className="h3-bold text-dark-600">Final Image</h3>

            //     <Image
            //       width={getImageSize(image.transformationType, image, "width")}
            //       height={getImageSize(
            //         image.transformationType,
            //         image,
            //         "height"
            //       )}
            //       src={image.transformationUrl}
            //       alt="image"
            //       className="transformation-original_image"
            //     />
            //   </div>
            // </>

            <TransformedImage
              image={image}
              transparentImageObj={transparentImageObj}
              backgroundImageObj={backgroundImageObj}
              type={image.transformationType}
              title={image.title}
              isTransforming={false}
              transformationConfig={image.config || { removeBackground: true }}
              hasDownload={true}
            />
          ) : (
            <TransformedImage
              image={image}
              type={image.transformationType}
              title={image.title}
              isTransforming={false}
              transformationConfig={image.config}
              hasDownload={true}
            />
          )}
        </div>

        {userId === image.author.clerkId && (
          <>
            {/* //ADD Background ==========================

            <BgForm
              action="Add"
              data={image}
              userId={user._id}
              type={transformation}
              creditBalance={user.creditBalance}
            /> */}
            {/* //End add Background ==========================*/}
            <div className="mt-4 space-y-4">
              <Button
                asChild
                type="button"
                className="submit-button capitalize "
              >
                <Link href={`/transformations/${image._id}/update`}>
                  Update Image{" "}
                  {image.transformationType === "removeBackground" &&
                    "(Replace Background Image)"}
                </Link>
              </Button>

              <DeleteConfirmation image={image} />
            </div>
          </>
        )}
      </section>
    </>
  );
};

export default ImageDetails;
