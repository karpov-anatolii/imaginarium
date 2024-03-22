export const navLinks = [
  {
    label: "Home",
    route: "/",
    icon: "/assets/icons/home.svg",
  },
  {
    label: "Image Restore",
    route: "/transformations/add/restore",
    icon: "/assets/icons/image.svg",
  },
  {
    label: "Generative Fill",
    route: "/transformations/add/fill",
    icon: "/assets/icons/stars.svg",
  },
  {
    label: "Object Remove",
    route: "/transformations/add/remove",
    icon: "/assets/icons/scan.svg",
  },

  {
    label: "Background Replacement",
    route: "/transformations/add/removeBackground",
    icon: "/assets/icons/replace_bg.svg",
  },
  {
    label: "Object Recolor",
    route: "/transformations/add/recolor",
    icon: "/assets/icons/filter.svg",
  },
  {
    label: "Profile",
    route: "/profile",
    icon: "/assets/icons/profile.svg",
  },
  {
    label: "Buy Credits",
    route: "/credits",
    icon: "/assets/icons/bag.svg",
  },
];

export const plans = [
  {
    _id: 1,
    name: "Free",
    icon: "/assets/icons/free-plan.svg",
    price: 0,
    credits: 9,
    inclusions: [
      {
        label: "9 Free Credits",
        isIncluded: true,
      },
      {
        label: "1 Background Replacement",
        isIncluded: true,
      },
      {
        label: "+ 4 Other Operations",
        isIncluded: true,
      },
    ],
  },
  {
    _id: 2,
    name: "Pro Package",
    icon: "/assets/icons/free-plan.svg",
    price: 10,
    credits: 50,
    inclusions: [
      {
        label: "50 Credits",
        isIncluded: true,
      },
      {
        label: "10 Background Replacement",
        isIncluded: true,
      },
      {
        label: "Or 50 Other Operations",
        isIncluded: true,
      },
    ],
  },
  {
    _id: 3,
    name: "Premium Package",
    icon: "/assets/icons/free-plan.svg",
    price: 20,
    credits: 125,
    inclusions: [
      {
        label: "125 Credits",
        isIncluded: true,
      },
      {
        label: "25 Background Replacement",
        isIncluded: true,
      },
      {
        label: "Or 125 Other Operations",
        isIncluded: true,
      },
    ],
  },
];

export const transformationTypes = {
  restore: {
    type: "restore",
    title: "Restore Image",
    subTitle:
      "Refine images by removing noise and imperfections. Price - 1 credit.",
    config: { restore: true, improve: "100" },
    icon: "image.svg",
  },
  removeBackground: {
    type: "removeBackground",
    title: "Background Replacement",
    subTitle:
      "Removes the background of the image using AI and merges it with the new background. Price - 5 credits.",
    config: { removeBackground: true },
    icon: "replace_bg.svg",
  },
  fill: {
    type: "fill",
    title: "Generative Fill",
    subTitle:
      "Enhance an image's dimensions using AI outpainting. Price - 1 credit.",
    config: { fillBackground: true },
    icon: "stars.svg",
  },
  remove: {
    type: "remove",
    title: "Object Remove",
    subTitle: "Identify and eliminate objects from images. Price - 1 credit.",
    config: {
      remove: { prompt: "", removeShadow: true, multiple: true },
    },
    icon: "scan.svg",
  },
  replace: {
    type: "replace",
    title: "Object replace",
    subTitle:
      "Identify and eliminate objects from images and replace them with new objects. Price - 1 credit.",
    config: {
      replace: { from: "", to: "", preserveGeometry: true },
    },
    icon: "scan.svg",
  },
  recolor: {
    type: "recolor",
    title: "Object Recolor",
    subTitle: "Identify and recolor objects from the image. Price - 1 credit.",
    config: {
      recolor: { prompt: "", to: "", multiple: true },
    },
    icon: "filter.svg",
  },
};

export const aspectRatioOptions = {
  "1:1": {
    aspectRatio: "1:1",
    label: "Square (1:1)",
    width: 1000,
    height: 1000,
  },
  "3:4": {
    aspectRatio: "3:4",
    label: "Standard Portrait (3:4)",
    width: 1000,
    height: 1334,
  },
  "16:9": {
    aspectRatio: "16:9",
    label: "Landscape (16:9)",
    width: 1778,
    height: 1000,
  },
  "9:16": {
    aspectRatio: "9:16",
    label: "Phone Portrait (9:16)",
    width: 1000,
    height: 1778,
  },
};

export const defaultValues = {
  title: "",
  aspectRatio: "",
  color: "",
  prompt: "",
  to: "",
  from: "",
  public_id: "",
  bgPublicId: "",
};

export const creditFee = -1;

export const initCldObj = {
  asset_id: "79d7c3256f37f10cfddf08de210b6d5f",
  public_id: "guj72i5revmtmgz7zno2",
  version: 1709894724,
  version_id: "58e99620948adf8043dc1c790212a15c",
  signature: "3f62962ac7dac20820b39f38b2e34ef423408063",
  width: 613,
  height: 407,
  format: "png",
  resource_type: "image",
  created_at: "2024-03-08T10:45:24Z",
  tags: [],
  bytes: 69489,
  type: "upload",
  etag: "10c0e6d5320cb4f30ed7f77d1aafde84",
  placeholder: false,
  url: "http://res.cloudinary.com/dt7syzzuv/image/upload/v1709894724/irw1khht1eggslkaamfw.png",
  secure_url:
    "https://res.cloudinary.com/dt7syzzuv/image/upload/v1709894724/irw1khht1eggslkaamfw.png",
  folder: "",
  access_mode: "public",
  api_key: "293596924669646",
};

export const bgCldObj = {
  id: "uw-file3",
  batchId: "uw-batch2",
  asset_id: "b31ef38d1c2b1752f8fbda2cd1816cc6",
  public_id: "mthhm2xfjvtxlxrcx8po",
  version: 1710144016,
  version_id: "ab50866977d9ca4fa396bd1aa131c44d",
  signature: "1ad0cef0b13e684f5868551ad7e825fe6e5290ff",
  width: 1280,
  height: 1920,
  format: "jpg",
  resource_type: "image",
  created_at: "2024-03-11T08:00:16Z",
  tags: [],
  bytes: 140186,
  type: "upload",
  etag: "8020932e6df68e3fc3bd58412938b5da",
  placeholder: false,
  url: "http://res.cloudinary.com/dt7syzzuv/image/upload/v1710144016/ntfgozm8keresbwrxjzt.jpg",
  secure_url:
    "https://res.cloudinary.com/dt7syzzuv/image/upload/v1710144016/ntfgozm8keresbwrxjzt.jpg",
  folder: "",
  access_mode: "public",
  original_filename: "woman-4",
  path: "v1710144016/ntfgozm8keresbwrxjzt.jpg",
  thumbnail_url:
    "https://res.cloudinary.com/dt7syzzuv/image/upload/c_limit,h_60,w_90/v1710144016/ntfgozm8keresbwrxjzt.jpg",
};
