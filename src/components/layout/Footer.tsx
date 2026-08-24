import { ArrowUpRight } from "@phosphor-icons/react";

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="mt-8 border-t border-border-light px-4 py-4 lg:px-6">
      <div className="flex flex-col-reverse items-center justify-between gap-2 text-[11.5px] text-text-muted sm:flex-row">
        <span>&copy; {year} Stationery Manager. All rights reserved.</span>

        <a
          href="https://www.zentrya.co.tz"
          target="_blank"
          rel="noopener noreferrer"
          className="group inline-flex items-center gap-1 rounded-sm text-text-muted transition-colors duration-150 hover:text-orange-dark focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange/35 focus-visible:ring-offset-1"
        >
          Created by{" "}
          <span className="font-medium text-text-secondary transition-colors duration-150 group-hover:text-orange-dark">
            Zentrya Limited
          </span>

          <ArrowUpRight
            size={11}
            weight="bold"
            className="transition-transform duration-150 group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
          />
        </a>
      </div>
    </footer>
  );
}