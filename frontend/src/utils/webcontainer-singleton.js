import { WebContainer } from "@webcontainer/api";

let bootPromise = null;

export function getWebContainer() {
  if (!bootPromise) {
    bootPromise = WebContainer.boot();
  }
  return bootPromise;
}
