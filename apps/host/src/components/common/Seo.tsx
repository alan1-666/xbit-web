import { FC } from "react";
import { Helmet } from "react-helmet";

interface SeoProps {
  title?: string;
  description?: string;
  keywords?: string;
  type?: "website" | "article" | "profile";
  url?: string;
  image?: string;
  imgWidth?: number;
  imgHeight?: number;
  cardType?: "summary" | "summary_large_image";
  children?: React.ReactNode;
}

export const DefaultTitle = 'XBIT.com | Decentralized Exchange (DEX) to Buy Bitcoin, Crypto & Meme Coins'

const Seo: FC<SeoProps> = ({
  title,
  description,
  keywords,
  type,
  url,
  image,
  imgWidth,
  imgHeight,
  cardType,
  children,
}) => {
  title = title ?? DefaultTitle
  image = image ?? `${window?.location.origin || ""}/images/og-image-large2.png`
  description = description ?? 'Trade Bitcoin, cryptocurrencies, and trending meme coins on XBIT.com. A decentralized exchange (DEX) with full asset control, low fees, and high security.'
  cardType = cardType ?? 'summary_large_image'
  url = url ?? window?.location.href
  keywords = keywords ?? 'XBIT, decentralized exchange, DEX, buy Bitcoin, trade crypto, meme coins, crypto exchange, buy crypto, Bitcoin DEX, safe crypto trading, DeFi exchange'
  type = type ?? 'website'

  return (
    <Helmet>
      {title && <title>{title} 🚀</title>}
      {description && <meta name="description" content={description} />}
      {keywords && <meta name="keywords" content={keywords} />}

      {title && <meta property="og:title" content={title} />}
      {type && <meta property="og:type" content={type} />}
      {description && <meta property="og:description" content={description} />}
      {url && <meta property="og:url" content={url} />}
      {image && <meta property="og:image" content={image} />}
      {image && imgWidth && (
        <meta property="og:image:width" content={imgWidth.toString()} />
      )}
      {image && imgHeight && (
        <meta property="og:image:height" content={imgHeight.toString()} />
      )}

      {title && <meta name="twitter:title" content={title} />}
      {description && <meta name="twitter:description" content={description} />}
      {url && <meta name="twitter:url" content={url} />}
      {cardType && <meta name="twitter:card" content={cardType} />}
      {image && <meta name="twitter:image" content={image} />}
      {children}
    </Helmet>
  );
};

export default Seo;
