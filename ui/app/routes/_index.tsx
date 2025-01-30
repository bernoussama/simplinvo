import Footer from "@/components/Footer";
import type { MetaFunction } from "@remix-run/node";
import { Link } from "@remix-run/react";
import { useTranslation } from "react-i18next";

export const meta: MetaFunction = () => {
  const { t } = useTranslation("index");
  return [
    { title: t("title") },
    { name: "description", content: t("description") },
  ];
};

export default function Index() {
  const { t } = useTranslation("index");
  return (
    <>
      <main className="container flex-grow mx-auto">
        <section className="py-20">
          <div className="container mx-auto px-4 text-center flex flex-col items-center">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 mx-auto max-w-4xl text-center">
              {t("heading")}
              <span className="text-secondary">💛</span>
            </h1>
            <p className="text-lg md:text-xl text-secondary max-w-3xl mx-auto mb-10">
              {t("subheading")}
            </p>
            <div className="flex flex-col lg:flex-row justify-center gap-4">
              <Link to="/join" className="btn btn-secondary btn-lg mb-2">
                {t("getStarted")}
              </Link>
              <Link to="/join" className="btn btn-outline btn-lg">
                {t("watchDemo")}
              </Link>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
