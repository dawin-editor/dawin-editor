export const isAndroidWebView = typeof window !== "undefined" &&
  typeof window.AndroidBridge !== "undefined";

declare global {
  interface Window {
    AndroidBridge?: {
      saveFile(content: string, filename: string, mimeType: string): boolean;
      printPdf(html: string, jobName: string): void;
      openUrl(url: string): void;
    };
  }
}

export function invokeBridge<T>(method: string, ...args: any[]): Promise<T> {
  if (!window.AndroidBridge) {
    console.warn("AndroidBridge not available");
    return Promise.reject("Bridge unavailable");
  }
  return new Promise((resolve, reject) => {
    try {
      const result = (window.AndroidBridge as any)[method](...args);
      resolve(result as T);
    } catch (e) {
      console.error(`Bridge error on ${method}:`, e);
      reject(e);
    }
  });
}

export const androidBridge = {
  saveFile: (content: string, filename: string, mimeType: string) =>
    invokeBridge<boolean>("saveFile", content, filename, mimeType),
  printPdf: (html: string, jobName: string) =>
    invokeBridge<void>("printPdf", html, jobName),
  openUrl: (url: string) =>
    invokeBridge<void>("openUrl", url),
};
