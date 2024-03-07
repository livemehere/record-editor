import { Variants } from "framer-motion";

export const fadeIn: Variants = {
  hidden: (index) => {
    const delay = index ? index * 0.05 : 0;
    return {
      x: "-10%",
      opacity: 0,
      transition: {
        duration: 0.25,
        stiffness: 50,
        delay,
      },
    };
  },
  show: (index) => {
    const delay = index ? index * 0.05 : 0;
    return {
      x: 0,
      opacity: 1,
      transition: {
        duration: 0.25,
        stiffness: 50,
        delay,
      },
    };
  },
};

export const fadeUp: Variants = {
  hidden: {
    y: "10%",
    opacity: 0,
  },
  show: {
    y: 0,
    opacity: 1,
    transition: {
      duration: 0.25,
      stiffness: 50,
    },
  },
};
