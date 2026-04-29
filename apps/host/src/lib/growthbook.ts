import { GrowthBook } from "@growthbook/growthbook";
import { autoAttributesPlugin } from "@growthbook/growthbook/plugins";

export const growthbook = new GrowthBook({
  apiHost: import.meta.env.VITE_GROWTH_BOOK_URL,
  clientKey: import.meta.env.VITE_GROWTH_BOOK_CLIENT_KEY,
  enableDevMode: true,
  trackingCallback: (experiment, result) => {
    // console.log("Viewed Experiment", {
    //   experimentId: experiment.key,
    //   variationId: result.key
    // });
  },
  plugins: [ autoAttributesPlugin() ],
});
