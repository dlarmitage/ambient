import { useLayoutEffect } from "react";

const BASE_URL = "https://ambient.technology";

function setMetaContent(selector, value) {
  const el = document.head.querySelector(selector);
  if (el) {
    el.setAttribute("content", value);
    return;
  }
  // Create if missing. Infer whether it's property= or name=.
  const match = selector.match(/\[(property|name)="([^"]+)"\]/);
  if (!match) return;
  const created = document.createElement("meta");
  created.setAttribute(match[1], match[2]);
  created.setAttribute("content", value);
  document.head.appendChild(created);
}

function setCanonical(href) {
  let el = document.head.querySelector('link[rel="canonical"]');
  if (!el) {
    el = document.createElement("link");
    el.setAttribute("rel", "canonical");
    document.head.appendChild(el);
  }
  el.setAttribute("href", href);
}

const Seo = ({ title, description, path = "/", image }) => {
  const url = `${BASE_URL}${path}`;
  const ogImage = image || `${BASE_URL}/ambient-og.jpg`;

  useLayoutEffect(() => {
    document.title = title;
    setMetaContent('meta[name="description"]', description);
    setMetaContent('meta[property="og:title"]', title);
    setMetaContent('meta[property="og:description"]', description);
    setMetaContent('meta[property="og:url"]', url);
    setMetaContent('meta[property="og:image"]', ogImage);
    setMetaContent('meta[name="twitter:title"]', title);
    setMetaContent('meta[name="twitter:description"]', description);
    setMetaContent('meta[name="twitter:image"]', ogImage);
    setCanonical(url);
  }, [title, description, url, ogImage]);

  return null;
};

export default Seo;
