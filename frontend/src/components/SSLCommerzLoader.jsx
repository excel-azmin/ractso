// SSLCommerzLoader.js
import { useEffect } from 'react';

const SSLCommerzLoader = () => {
  useEffect(() => {
    const loader = () => {
      const script = document.createElement('script');
      const tag = document.getElementsByTagName('script')[0];

      // Use sandbox for development, live for production
      const isLive = process.env.NODE_ENV === 'production';
      script.src = isLive
        ? 'https://seamless-epay.sslcommerz.com/embed.min.js?' +
          Math.random().toString(36).substring(7)
        : 'https://sandbox.sslcommerz.com/embed.min.js?' +
          Math.random().toString(36).substring(7);

      tag.parentNode.insertBefore(script, tag);
    };

    if (window.addEventListener) {
      window.addEventListener('load', loader, false);
    } else if (window.attachEvent) {
      window.attachEvent('onload', loader);
    }

    return () => {
      if (window.removeEventListener) {
        window.removeEventListener('load', loader);
      } else if (window.detachEvent) {
        window.detachEvent('onload', loader);
      }
    };
  }, []);

  return null;
};

export default SSLCommerzLoader;
