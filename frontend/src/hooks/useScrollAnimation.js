import { useEffect, useRef, useState } from "react";

/**
 * Hook for scroll-triggered animations
 * @param {Object} options - Intersection Observer options
 * @param {string} options.threshold - Percentage of element visibility to trigger (default: 0.1)
 * @param {string} options.rootMargin - Margin around the root (default: '0px')
 * @param {boolean} options.triggerOnce - Whether to trigger animation only once (default: true)
 * @returns {Object} - { ref, isVisible }
 */
export const useScrollAnimation = (options = {}) => {
  const { threshold = 0.1, rootMargin = "0px", triggerOnce = true } = options;

  const ref = useRef(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          if (triggerOnce) {
            observer.unobserve(element);
          }
        } else if (!triggerOnce) {
          setIsVisible(false);
        }
      },
      { threshold, rootMargin },
    );

    observer.observe(element);

    return () => {
      if (element) {
        observer.unobserve(element);
      }
    };
  }, [threshold, rootMargin, triggerOnce]);

  return { ref, isVisible };
};

export default useScrollAnimation;
