import type { MetaFunction } from "@remix-run/node";
import { Link } from "@remix-run/react";

export const meta: MetaFunction = () => {
  return [
    { title: "Simplinvo" },
    { name: "description", content: "We make invoices simple!" },
  ];
};

export default function Index() {
  return (
    <>
      <main>
        <section className="py-20">
          <div className="container mx-auto px-4 text-center">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
              The invoicing software your
              <br />
              business will absolutely love!
              <span className="text-secondary">💛</span>
            </h1>
            <p className="text-lg md:text-xl text-secondary max-w-3xl mx-auto mb-10">
              Simplinvo is the ultimate invoicing software to help you create
              invoice templates, send them to customers!
            </p>
            <div className="flex justify-center gap-4">
              <Link to="/join">
                <button className="btn btn-secondary btn-lg">
                  GET STARTED NOW - IT&apos;S FREE!
                </button>
              </Link>
              <button className="btn btn-outline btn-lg">WATCH DEMO</button>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}
