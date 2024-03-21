"use server";

import fs from "fs";
import https from "https";
import path from "path";
const axios = require("axios");
const FormData = require("form-data");

import { revalidatePath } from "next/cache";
import { connectToDatabase, clearDatabaseCache } from "../database/mongoose";
import { handleError } from "../utils";
import User from "../database/models/user.model";
import Image from "../database/models/image.model";
import { redirect } from "next/navigation";

import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

const populateUser = (query: any) =>
  query.populate({
    path: "author",
    model: User,
    select: "_id firstName lastName clerkId",
  });

// ADD IMAGE
export async function addImage({ image, userId, path }: AddImageParams) {
  try {
    await connectToDatabase();
    // clearDatabaseCache(); // clear cache mongodb if new fields are added to schema
    const author = await User.findById(userId);

    if (!author) {
      throw new Error("User not found");
    }

    const newImage = await Image.create({
      ...image,
      author: author._id,
    });
    revalidatePath(path);

    return JSON.parse(JSON.stringify(newImage));
  } catch (error) {
    handleError(error);
  }
}

// UPDATE IMAGE
export async function updateImage({ image, userId, path }: UpdateImageParams) {
  try {
    await connectToDatabase();

    const imageToUpdate = await Image.findById(image._id);

    if (!imageToUpdate || imageToUpdate.author.toHexString() !== userId) {
      throw new Error("Unauthorized or image not found");
    }

    const updatedImage = await Image.findByIdAndUpdate(
      imageToUpdate._id,
      image,
      { new: true } //to create a new instance of the document
    );

    revalidatePath(path);

    return JSON.parse(JSON.stringify(updatedImage));
  } catch (error) {
    handleError(error);
  }
}

// DELETE IMAGE
export async function deleteImage(image: any) {
  try {
    await connectToDatabase();

    await Image.findByIdAndDelete(image._id);
    await cloudinary.api
      .delete_resources(
        [image.public_id, image.bgPublicId, image.transparentPublicId],
        {
          type: "upload",
          resource_type: "image",
        }
      )
      .then((res) => console.log("res delete=", res));
  } catch (error) {
    handleError(error);
  } finally {
    redirect("/");
  }
}

// GET IMAGE
export async function getImageById(imageId: string) {
  try {
    await connectToDatabase();

    const image = await populateUser(Image.findById(imageId));

    if (!image) throw new Error("Image not found");

    return JSON.parse(JSON.stringify(image));
  } catch (error) {
    handleError(error);
  }
}

// GET IMAGES
export async function getAllImages({
  limit = 9,
  page = 1,
  searchQuery = "",
}: {
  limit?: number;
  page: number;
  searchQuery?: string;
}) {
  try {
    await connectToDatabase();

    let expression = "folder=imaginarium";

    if (searchQuery) {
      expression += ` AND ${searchQuery}`;
    }

    const { resources } = await cloudinary.search
      .expression(expression)
      .execute();

    const resourceIds = resources.map((resource: any) => resource.public_id);

    let query = {};

    if (searchQuery) {
      query = {
        public_id: {
          // MongoDB будет искать документы, у которых значение поля public_id соответствует хотя бы одному из значений в массиве resourceIds
          $in: resourceIds,
        },
      };
    }

    const skipAmount = (Number(page) - 1) * limit;

    const images = await populateUser(Image.find(query))
      .sort({ updatedAt: -1 })
      .skip(skipAmount)
      .limit(limit);

    const totalImages = await Image.find(query).countDocuments();
    const savedImages = await Image.find().countDocuments();

    return {
      data: JSON.parse(JSON.stringify(images)),
      totalPage: Math.ceil(totalImages / limit),
      savedImages,
    };
  } catch (error) {
    handleError(error);
  }
}

// GET IMAGES BY USER
export async function getUserImages({
  limit = 9,
  page = 1,
  userId,
}: {
  limit?: number;
  page: number;
  userId: string;
}) {
  try {
    await connectToDatabase();

    const skipAmount = (Number(page) - 1) * limit;

    const images = await populateUser(Image.find({ author: userId }))
      .sort({ updatedAt: -1 })
      .skip(skipAmount)
      .limit(limit);

    const totalImages = await Image.find({ author: userId }).countDocuments();

    return {
      data: JSON.parse(JSON.stringify(images)),
      totalPages: Math.ceil(totalImages / limit),
    };
  } catch (error) {
    handleError(error);
  }
}

export async function uploadToCld(filename: string) {
  try {
    const filePath = path.join(process.cwd(), "public/images/" + filename);
    const results = await cloudinary.uploader.upload(filePath);

    return JSON.parse(JSON.stringify(results));
  } catch (error) {
    console.log(error);
    handleError(error);
  }
}

export async function resourceCld(public_id: string) {
  try {
    const results = await cloudinary.api.resource(public_id);

    return JSON.parse(JSON.stringify(results));
  } catch (error) {
    console.log(error);
  }
}

export async function saveTransparentImage(url: string) {
  const filename = Date.now() + path.basename(url).split("?")[0] + ".png";
  const localFilePath = path.join(process.cwd(), "public/images/" + filename);

  const file = fs.createWriteStream(localFilePath);

  https.get(url, function (response) {
    response.pipe(file);
  });

  return filename;
}

export async function removeBgApi(url: string) {
  try {
    const formData = new FormData();
    formData.append("size", "auto");
    formData.append("image_url", url);
    const filename = "removebg_" + Date.now() + ".png";

    await axios({
      method: "post",
      url: "https://api.remove.bg/v1.0/removebg",
      data: formData,
      responseType: "arraybuffer",
      headers: {
        ...formData.getHeaders(),
        "X-Api-Key": process.env.REMOVE_BG_API_KEY,
      },
      encoding: null,
    })
      .then((response: any) => {
        if (response.status != 200)
          return console.error("Error:", response.status, response.statusText);

        fs.writeFileSync(
          path.join(process.cwd(), "public/images/" + filename),
          response.data
        );
      })
      .catch((error: any) => {
        return console.error("Request failed:", error);
      });

    return JSON.parse(JSON.stringify({ filename }));
  } catch (error) {
    console.log(error);
    handleError(error);
  }
}

export async function removeBgApiSaveToCld(url: string) {
  try {
    const formData = new FormData();
    formData.append("size", "auto");
    formData.append("image_url", url);

    const response = await axios({
      method: "post",
      url: "https://api.remove.bg/v1.0/removebg",
      data: formData,
      responseType: "arraybuffer",
      headers: {
        ...formData.getHeaders(),
        "X-Api-Key": process.env.REMOVE_BG_API_KEY,
      },
      encoding: null,
    });

    if (response.status != 200)
      return console.error("Error:", response.status, response.statusText);

    const base64String = response.data.toString("base64");
    const dataURI = `data:image/png;base64,${base64String}`;
    const result = await cloudinary.uploader.upload(dataURI, {
      resource_type: "image",
    });
    return result;
  } catch (error) {
    console.log(error);
    handleError(error);
  }
}
