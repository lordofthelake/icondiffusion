import { AppProps } from "next/app";
import Head from "next/head";
import { MantineProvider } from "@mantine/core";
import { SWRConfig } from "swr";
import { Analytics } from "@vercel/analytics/react";
import { SWRConfiguration } from "swr";
import { defaultConfig as defaultSwrConfig } from "swr/_internal";

const fetcher = async ({ url, method = "GET", args = null }) => {
  const requestUrl = new URL(url, location.href);
  if (args) {
    for (const [arg, value] of Object.entries(args)) {
      requestUrl.searchParams.append(arg, value as string);
    }
  }

  const result = await fetch(requestUrl, {
    method,
  });

  return result.json();
};

const onErrorRetry: SWRConfiguration["onErrorRetry"] = (
  error,
  key,
  config,
  revalidate,
  revalidateOpts
) => {
  if ([502, 503, 504].includes(error.response?.status)) {
    return defaultSwrConfig.onErrorRetry(
      error,
      key,
      config,
      revalidate,
      revalidateOpts
    );
  }

  // Otherwise, just use the default handling
  return;
};

export default function App(props: AppProps) {
  const { Component, pageProps } = props;

  return (
    <>
      <Head>
        <title>Icon Diffusion — Generate icons with AI</title>
        <meta
          name="viewport"
          content="minimum-scale=1, initial-scale=1, width=device-width"
        />
        <link
          rel="apple-touch-icon"
          sizes="180x180"
          href="/apple-touch-icon.png"
        />
        <link
          rel="icon"
          type="image/png"
          sizes="32x32"
          href="/favicon-32x32.png"
        />
        <link
          rel="icon"
          type="image/png"
          sizes="16x16"
          href="/favicon-16x16.png"
        />
        <link rel="manifest" href="/site.webmanifest" />
        <link rel="mask-icon" href="/safari-pinned-tab.svg" color="#5bbad5" />
        <meta name="msapplication-TileColor" content="#9f00a7" />
        <meta name="theme-color" content="#ffffff" />
      </Head>

      <MantineProvider
        withGlobalStyles
        withNormalizeCSS
        theme={{
          /** Put your mantine theme override here */
          colorScheme: "light",
        }}
      >
        <SWRConfig value={{ fetcher, revalidateOnFocus: false, onErrorRetry }}>
          <Component {...pageProps} />
          <Analytics />
        </SWRConfig>
      </MantineProvider>
    </>
  );
}
