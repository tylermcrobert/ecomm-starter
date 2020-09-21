import sanityClient from "@sanity/client";
import { Product } from "@tylermcrobert/shopify-react";
import { clientOptions } from "lib/sanity";
import { NextApiRequest, NextApiResponse } from "next";

export const client = sanityClient({
  ...clientOptions,
  useCdn: false,
  token: process.env.SANITY_TOKEN,
});

// TODO: verify webhook
//https://shopify.dev/tutorials/manage-webhooks#verify-webhook

export default async (req: NextApiRequest, res: NextApiResponse) => {
  const setErr = (code: number, message: string, err: any | null) => {
    console.error(err);
    res.status(code).json({ error: true, message: message });
    return null;
  };

  /**
   * Check for correct method
   */
  if (req.method !== "POST" || !req.body) {
    setErr(400, "Method must be POST and have body", null);
  }

  const data: Product = req.body;

  /**
   * Format for Sanity
   */
  const sanityProduct = {
    _type: "product",
    _id: data.id.toString(),
    slug: { current: data.handle },
    title: data.title,
  };

  /** Add product to sanity */
  try {
    await client.transaction().createIfNotExists(sanityProduct).commit();
    res.json({ success: true });
  } catch (err) {
    setErr(400, "Cannot create sanity product", err);
  }
};
