import ReactGA from "react-ga4";

export const initGA = () => {
  const measurementId = import.meta.env.VITE_GOOGLE_TAG_ID;
  if (measurementId) {
    ReactGA.initialize(measurementId);
    ReactGA.send("pageview");
  }
};