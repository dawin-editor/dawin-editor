import {
  defineConfig,
  minimal2023Preset,
  createAppleSplashScreens,
} from "@vite-pwa/assets-generator/config";

export default defineConfig({
  headLinkOptions: {
    preset: "2023", // generate HTML head links for favicons and apple-touch-icons
  },
  preset: {
    ...minimal2023Preset,
    appleSplashScreens: createAppleSplashScreens(
      {
        padding: 0.3,
        resizeOptions: { background: "white", fit: "contain" },
        darkResizeOptions: { background: "black", fit: "contain" },
        linkMediaOptions: { log: true, addMediaScreen: true, basePath: "/" },
        png: { compressionLevel: 9, quality: 60 },
        name: (landscape, size, dark) =>
          `apple-splash-${landscape ? "landscape" : "portrait"}-${
            dark ? "dark-" : "light-"
          }${size.width}x${size.height}.png`,
      },
      ['iPad Air 9.7"']
    ), // specify devices
  },
  images: ["public/logo.svg"], // your source logo
});
